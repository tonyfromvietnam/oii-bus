import { useFrame } from "@react-three/fiber";
import { londonDarkness, darknessAt, londonParts, MAX_SPEED } from "@xom-oii/shared";
import { BUS, OII_STREET, resolveCollisions } from "@xom-oii/world";
import { vi } from "../copy/vi";
import { daveSays, findInteraction, interactionLabel } from "./actions";
import { game } from "./state";
import { ui } from "./ui";

const WALK = 3.2;
const RUN = Math.min(4.6, MAX_SPEED - 0.2);
const PAVE_Y = 0.12;

/** Ghi đè giờ để xem trước ánh sáng: ?time=17:00&month=11 */
const params = new URLSearchParams(typeof location !== "undefined" ? location.search : "");
const timeOverride = params.get("time");
const monthOverride = params.get("month");

function updateEnv() {
  const now = new Date();
  const p = londonParts(now);
  if (timeOverride && /^\d{1,2}:\d{2}$/.test(timeOverride)) {
    const [h, m] = timeOverride.split(":").map(Number) as [number, number];
    game.env.darkness = darknessAt(Number(monthOverride ?? p.month), h + m / 60);
    game.env.londonClock = timeOverride.padStart(5, "0");
  } else {
    game.env.darkness = londonDarkness(now);
    game.env.londonClock = `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
  }
  ui().setClock(game.env.londonClock);
}
updateEnv();

let envTimer = 0;
let promptTimer = 0;

export function GameLoop() {
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    game.time += dt;
    const p = game.player;
    const input = game.input;

    envTimer -= dt;
    if (envTimer <= 0) {
      envTimer = 1;
      updateEnv();
    }

    game.bus.step(dt);

    // --- input → hướng đi (theo camera) ---
    let ix = 0;
    let iy = 0;
    const k = input.keys;
    if (k.has("KeyW") || k.has("ArrowUp")) iy += 1;
    if (k.has("KeyS") || k.has("ArrowDown")) iy -= 1;
    if (k.has("KeyD") || k.has("ArrowRight")) ix += 1;
    if (k.has("KeyA") || k.has("ArrowLeft")) ix -= 1;
    ix += input.joy.x;
    iy += input.joy.y;
    const mag = Math.hypot(ix, iy);
    const yaw = game.camera.yaw;
    let dirX = 0;
    let dirZ = 0;
    let speedFactor = 1;
    if (mag > 0.08) {
      input.moveTarget = null;
      const nx = ix / Math.max(1, mag);
      const ny = iy / Math.max(1, mag);
      speedFactor = Math.min(1, mag);
      // forward = (−sin yaw, −cos yaw), right = (cos yaw, −sin yaw)
      dirX = -Math.sin(yaw) * ny + Math.cos(yaw) * nx;
      dirZ = -Math.cos(yaw) * ny - Math.sin(yaw) * nx;
      if (p.pose === "sit") {
        p.pose = "stand";
        p.seatId = null;
      }
    } else if (input.moveTarget && p.pose === "stand") {
      const mx = input.moveTarget.x - p.x;
      const mz = input.moveTarget.z - p.z;
      const d = Math.hypot(mx, mz);
      if (d < 0.25) input.moveTarget = null;
      else {
        dirX = mx / d;
        dirZ = mz / d;
        speedFactor = Math.min(1, d / 0.8);
      }
    }

    if (p.pose === "bus") {
      // ngồi tầng trên, gắn theo bus
      p.x = game.bus.x - 1.7;
      p.z = BUS.laneZ + 0.35;
      p.y = 2.2;
      p.ry = -Math.PI / 2;
      p.speed = 0;
    } else if (p.pose === "stand") {
      const len = Math.hypot(dirX, dirZ);
      const speed = (input.run ? RUN : WALK) * speedFactor;
      const ox = p.x;
      const oz = p.z;
      if (len > 0) {
        const colliders = [...OII_STREET.colliders, game.bus.collider()];
        const next = resolveCollisions(
          { x: p.x + (dirX / len) * speed * dt, z: p.z + (dirZ / len) * speed * dt },
          colliders,
        );
        p.x = next.x;
        p.z = next.z;
        const target = Math.atan2(dirX, dirZ);
        let diff = target - p.ry;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        p.ry += diff * Math.min(1, dt * 12);
      } else if (game.bus.phase !== "away") {
        // bus có thể đẩy người đang đứng trên làn
        const next = resolveCollisions({ x: p.x, z: p.z }, [game.bus.collider()]);
        p.x = next.x;
        p.z = next.z;
      }
      p.speed = Math.hypot(p.x - ox, p.z - oz) / dt;
      const targetY = Math.abs(p.z) > 4.05 ? PAVE_Y : 0;
      p.y += (targetY - p.y) * Math.min(1, dt * 14);
    } else {
      p.speed = 0;
    }

    // --- Dave: quay về phía người chơi, thỉnh thoảng nói ---
    const dave = game.dave;
    const ddx = p.x - dave.x;
    const ddz = p.z - dave.z;
    const dDist = Math.hypot(ddx, ddz);
    const face = dDist < 12 ? Math.atan2(ddx, ddz) : Math.PI;
    let dDiff = face - dave.ry;
    dDiff = Math.atan2(Math.sin(dDiff), Math.cos(dDiff));
    dave.ry += dDiff * Math.min(1, dt * 3);
    dave.holding = "tea"; // "pint" — dùng cốc chung
    if (game.time > dave.nextLineAt) {
      dave.nextLineAt = game.time + 14 + Math.random() * 10;
      if (dDist < 14) {
        daveSays(vi.dave.lines[Math.floor(Math.random() * vi.dave.lines.length)]!);
        if (Math.random() < 0.3) dave.gesture = { id: "cheers", until: game.time + 2 };
      }
    }

    // --- prompt E (10 Hz) ---
    promptTimer -= dt;
    if (promptTimer <= 0) {
      promptTimer = 0.1;
      const i = findInteraction();
      ui().setPrompt(i ? interactionLabel(i) : null);
    }
  });
  return null;
}
