import { useFrame } from "@react-three/fiber";
import { londonDarkness } from "@xom-oii/shared";
import { SCENES, landmarkStatus, resolveCollisions, routeOffset } from "@xom-oii/world";
import { vi } from "../copy/vi";
import { findInteraction, interactionLabel, npcSays } from "./actions";
import { NPCS, randomWalkable } from "./npcs";
import { progressQuest } from "./quests";
import { game } from "./state";
import { ui } from "./ui";

const WALK = 3.4;
/** Giây tập trung cần để có tem (bản thử; bản thật là pomodoro 25 phút). */
export const FOCUS_GOAL_SECONDS = 60;

let slowTimer = 0;
let lastWhere = "";

export function GameLoop() {
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    game.time += dt;
    game.route = routeOffset(Date.now());
    const scene = SCENES[game.scene];
    const p = game.player;
    const input = game.input;

    // --- input: hướng theo màn hình (camera cố định) ---
    let ix = 0;
    let iz = 0;
    const k = input.keys;
    if (k.has("KeyW") || k.has("ArrowUp")) iz -= 1;
    if (k.has("KeyS") || k.has("ArrowDown")) iz += 1;
    if (k.has("KeyD") || k.has("ArrowRight")) ix += 1;
    if (k.has("KeyA") || k.has("ArrowLeft")) ix -= 1;
    ix += input.joy.x;
    iz -= input.joy.y;
    let mag = Math.hypot(ix, iz);
    if (mag > 0.1) {
      input.moveTarget = null;
    } else if (input.moveTarget && p.pose === "stand") {
      ix = input.moveTarget.x - p.x;
      iz = input.moveTarget.z - p.z;
      const d = Math.hypot(ix, iz);
      if (d < 0.2) {
        input.moveTarget = null;
        ix = iz = 0;
      } else {
        ix /= Math.max(d, 1);
        iz /= Math.max(d, 1);
      }
      mag = Math.hypot(ix, iz);
    }

    if (p.pose === "stand") {
      const ox = p.x;
      const oz = p.z;
      if (mag > 0.05) {
        const f = Math.min(1, mag) / mag;
        const next = resolveCollisions(
          { x: p.x + ix * f * WALK * dt, z: p.z + iz * f * WALK * dt },
          scene.colliders,
          scene.bounds,
        );
        p.x = next.x;
        p.z = next.z;
        turnTowards(p, Math.atan2(ix, iz), dt);
      }
      p.speed = Math.hypot(p.x - ox, p.z - oz) / dt;
    } else {
      p.speed = 0;
    }

    updateNpcs(dt);

    // --- việc chậm (5 Hz): prompt, địa danh, tập trung, ánh sáng ---
    slowTimer -= dt;
    if (slowTimer <= 0) {
      slowTimer = 0.2;
      const u = ui();
      const i = findInteraction();
      u.setPrompt(i ? interactionLabel(i) : null);
      const st = landmarkStatus(game.route);
      const now = st.current ? vi.landmarks[st.current.id].name : null;
      const where = {
        now,
        next: vi.landmarks[st.next.id].name,
        meters: Math.round(st.metersToNext / 10) * 10,
        joke: st.current ? vi.landmarks[st.current.id].joke : null,
      };
      const key = JSON.stringify(where);
      if (key !== lastWhere) {
        lastWhere = key;
        u.set({ where });
      }
      game.env.darkness = londonDarkness(new Date());
    }

    if (game.focus.running) {
      game.focus.elapsed += dt;
      const s = Math.floor(game.focus.elapsed);
      if (s !== ui().focus.seconds) {
        ui().set({ focus: { running: true, seconds: s } });
        if (s === FOCUS_GOAL_SECONDS) {
          ui().showToast(vi.lines.focusDone);
          progressQuest("focus", 1);
        }
      }
    }
  });
  return null;
}

function turnTowards(a: { ry: number }, target: number, dt: number) {
  let diff = target - a.ry;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  a.ry += diff * Math.min(1, dt * 14);
}

function updateNpcs(dt: number) {
  const p = game.player;
  for (const n of NPCS) {
    if (n.scene !== game.scene) continue;
    const scene = SCENES[n.scene];
    if (n.mode === "wander") {
      n.timer -= dt;
      if (!n.target && n.timer <= 0) n.target = randomWalkable(n.scene);
      if (n.target) {
        const dx = n.target.x - n.x;
        const dz = n.target.z - n.z;
        const d = Math.hypot(dx, dz);
        const ox = n.x;
        const oz = n.z;
        if (d < 0.3) {
          n.target = null;
          n.timer = 2 + Math.random() * 5;
        } else {
          const next = resolveCollisions(
            { x: n.x + (dx / d) * 1.6 * dt, z: n.z + (dz / d) * 1.6 * dt },
            scene.colliders,
            scene.bounds,
          );
          n.x = next.x;
          n.z = next.z;
          turnTowards(n, Math.atan2(dx, dz), dt);
          // kẹt thì đổi hướng
          if (Math.hypot(n.x - ox, n.z - oz) < 0.2 * 1.6 * dt) n.target = null;
        }
        n.speed = Math.hypot(n.x - ox, n.z - oz) / dt;
      } else {
        n.speed = 0;
        // đứng yên thì quay về phía người chơi nếu gần
        if (Math.hypot(p.x - n.x, p.z - n.z) < 4) turnTowards(n, Math.atan2(p.x - n.x, p.z - n.z), dt);
      }
    } else if (n.mode === "sing") {
      n.speed = 0;
      n.ry = Math.sin(game.time * 2) * 0.4;
      if (!n.gesture || n.gesture.until < game.time) n.gesture = { id: "cheers", until: game.time + 1.2 };
    }
    if (game.time > n.nextLineAt) {
      n.nextLineAt = game.time + 12 + Math.random() * 14;
      if (Math.hypot(p.x - n.x, p.z - n.z) < 12) {
        npcSays(n, n.lines[Math.floor(Math.random() * n.lines.length)]!);
      }
    }
  }
}
