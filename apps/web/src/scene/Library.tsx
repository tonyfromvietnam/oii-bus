import { useFrame } from "@react-three/fiber";
import { LIBRARY_PROPS as L, LIBRARY_SCENE, mulberry32 } from "@xom-oii/world";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { game } from "../game/state";
import { useUi } from "../game/ui";
import { C, glow, toon } from "./materials";
import { signMaterial } from "./signs";
import { StaticBuilder } from "./StaticBuilder";

const B = LIBRARY_SCENE.bounds;
const BOOK_COLORS = ["#ff8fab", "#ffd166", "#8fd3ff", "#9de8c9", "#cdb8ff", "#ffb38a", "#f6f1e7", "#7fb3ff"];

function buildLibrary(): THREE.Group {
  const b = new StaticBuilder();
  const rnd = mulberry32(8);
  const W = B.maxX - B.minX + 0.6;
  const D = B.maxZ - B.minZ + 0.6;
  // sàn gỗ + thảm
  b.box(toon("#e2b583"), W, 0.2, D, 0, -0.1, 0);
  for (let x = B.minX; x < B.maxX; x += 0.9) b.box(toon("#d4a26f"), 0.04, 0.01, D, x, 0.002, 0);
  b.add(toon("#ffd6e0"), new THREE.CircleGeometry(2.3, 32), L.nook.x, 0.012, L.nook.z, -Math.PI / 2);
  b.box(toon("#cfe6ff"), 13, 0.012, 5.2, 0, 0.008, -0.45);
  // tường xa (cửa sổ lớn) + hai tường bên
  const wall = toon("#fff1dc");
  b.box(wall, W, 5, 0.3, 0, 2.5, B.minZ - 0.15);
  b.box(wall, 0.3, 5, D, B.minX - 0.15, 2.5, 0);
  b.box(wall, 0.3, 5, D, B.maxX + 0.15, 2.5, 0);
  b.box(toon("#f4c7a1"), W, 0.6, 0.32, 0, 0.3, B.minZ - 0.14);
  // kệ sách hai bên, đầy sách màu
  for (const side of [-1, 1]) {
    const sx = side * (B.maxX - 0.4);
    const len = side < 0 ? 8 : 7;
    const cz = side < 0 ? -1 : -1.6;
    b.box(toon(C.woodDark), 0.8, 3.6, len, sx, 1.8, cz);
    for (let shelf = 0; shelf < 5; shelf++) {
      const y = 0.25 + shelf * 0.7;
      b.box(toon(C.wood), 0.82, 0.06, len, sx, y, cz);
      let z = cz - len / 2 + 0.15;
      while (z < cz + len / 2 - 0.2) {
        const w = 0.12 + rnd() * 0.12;
        const h = 0.4 + rnd() * 0.2;
        b.box(
          toon(BOOK_COLORS[Math.floor(rnd() * BOOK_COLORS.length)]!),
          0.5,
          h,
          w,
          sx - side * 0.1,
          y + 0.03 + h / 2,
          z + w / 2,
        );
        z += w + 0.015;
      }
    }
  }
  // bàn học + đèn bàn xanh + ghế
  for (const d of L.desks) {
    b.box(toon(C.wood), 3.0, 0.08, 0.9, d.x, 0.78, d.z);
    for (const lx of [-1.35, 1.35]) b.box(toon(C.woodDark), 0.08, 0.76, 0.8, d.x + lx, 0.38, d.z);
    b.cyl(toon("#2f8f6b"), 0.08, 0.35, d.x, 0.97, d.z - 0.25);
    b.add(
      glow("#7fe0b5", 0.6, 1),
      new THREE.CylinderGeometry(0.12, 0.28, 0.18, 12, 1, true),
      d.x,
      1.18,
      d.z - 0.25,
    );
    b.box(toon(C.lemon), 0.3, 0.04, 0.22, d.x - 0.8, 0.84, d.z);
    b.box(toon(C.sky), 0.3, 0.04, 0.22, d.x + 0.8, 0.84, d.z + 0.05, 0, 0.3);
    b.box(toon("#b0b6c8"), 0.45, 0.03, 0.32, d.x + 0.6, 0.835, d.z - 0.1);
    for (const dx of [-0.8, 0.8]) {
      const cz = d.z + 0.85;
      b.box(toon(C.peach), 0.5, 0.08, 0.5, d.x + dx, 0.45, cz);
      b.box(toon(C.peach), 0.5, 0.5, 0.08, d.x + dx, 0.72, cz + 0.22);
      for (const [ox, oz] of [
        [-0.2, -0.2],
        [0.2, -0.2],
        [-0.2, 0.2],
        [0.2, 0.2],
      ] as const)
        b.cyl(toon(C.woodDark), 0.03, 0.45, d.x + dx + ox, 0.22, cz + oz);
    }
  }
  // góc đọc sách: 2 ghế bành + bàn trà + ấm trà + cây
  const n = L.nook;
  for (const [cx, rot] of [
    [n.x - 1.1, Math.PI / 2],
    [n.x + 1.3, -Math.PI / 2],
  ] as const) {
    b.box(toon(C.lilac), 0.9, 0.45, 0.9, cx, 0.25, n.z);
    b.box(toon(C.lilac), 0.25, 0.7, 0.9, cx - Math.sin(rot) * 0.35, 0.7, n.z);
    for (const az of [-0.42, 0.42]) b.box(toon("#b9a2f0"), 0.9, 0.3, 0.16, cx, 0.6, n.z + az);
  }
  b.cyl(toon(C.wood), 0.4, 0.05, n.x, 0.55, n.z + 0.2);
  b.cyl(toon(C.woodDark), 0.06, 0.55, n.x, 0.27, n.z + 0.2);
  b.sphere(toon(C.white), 0.12, n.x, 0.67, n.z + 0.2);
  b.cyl(toon(C.peach), 0.25, 0.5, n.x + 2.2, 0.25, n.z + 1.2);
  b.sphere(toon(C.leaf), 0.5, n.x + 2.2, 0.85, n.z + 1.2);
  // mèo thư viện (cục cam ngủ)
  const c = L.cat;
  b.add(toon("#ffb067"), new THREE.SphereGeometry(0.28, 12, 10), c.x, 0.62, c.z, 0, 0, 0, 1.3, 0.75, 1);
  b.sphere(toon("#ffb067"), 0.18, c.x + 0.3, 0.72, c.z + 0.05);
  for (const ex of [-0.08, 0.08])
    b.add(toon("#ffb067"), new THREE.ConeGeometry(0.06, 0.12, 4), c.x + 0.3 + ex, 0.88, c.z + 0.05);
  b.box(toon("#ffd6a5"), 0.7, 0.18, 0.7, c.x, 0.45, c.z); // gối nằm
  // radio lofi
  const r = L.radio;
  b.box(toon(C.woodDark), 1.2, 0.7, 0.5, r.x, 0.35, r.z);
  b.box(toon("#ff8fab"), 0.9, 0.5, 0.4, r.x, 0.95, r.z);
  b.cyl(toon(C.ink), 0.13, 0.02, r.x - 0.2, 0.95, r.z + 0.2, Math.PI / 2);
  b.box(toon(C.cream), 0.25, 0.15, 0.02, r.x + 0.22, 1.0, r.z + 0.205);
  b.add(
    signMaterial("lofi radio ♪", { bg: "#3b2f45", fg: "#ffd166" }),
    new THREE.PlaneGeometry(0.9, 0.22),
    r.x,
    0.55,
    r.z + 0.26,
  );
  // cầu thang lên tầng thượng
  const st = L.stairs;
  for (let i = 0; i < 5; i++)
    b.box(toon(C.wood), 2.0, 0.25 + i * 0.3, 0.4, st.x, (0.25 + i * 0.3) / 2, st.z + 1.0 - i * 0.4);
  b.add(
    signMaterial("", { bg: "#ff5a5f", fg: "#ffffff", lines: ["🚌 Lên tầng thượng"] }),
    new THREE.PlaneGeometry(1.6, 0.4),
    st.x,
    2.3,
    st.z - 0.8,
  );
  // biển "Suỵt!"
  b.add(
    signMaterial("", {
      bg: "#fff4e0",
      fg: "#3b2f45",
      border: "#ff8fab",
      lines: ["Suỵt! 🤫", "Thư viện yên lặng"],
    }),
    new THREE.PlaneGeometry(2.2, 1.0),
    -4.5,
    3.6,
    B.minZ + 0.02,
  );
  // đèn dây + cây treo trên tường xa
  const bulb = glow("#fff3b0", 0.8, 1.2);
  for (let x = B.minX + 0.5; x < B.maxX; x += 0.8)
    b.sphere(bulb, 0.06, x, 4.4 - Math.abs(Math.sin(x * 0.7)) * 0.2, B.minZ + 0.1);
  for (const px of [-7.5, 7.5]) {
    b.cyl(toon(C.peach), 0.2, 0.3, px, 4.2, B.minZ + 0.35);
    for (let i = 0; i < 4; i++)
      b.sphere(toon(C.leaf), 0.14, px - 0.15 + i * 0.1, 3.9 - i * 0.2, B.minZ + 0.4);
  }
  const g = new THREE.Group();
  for (const m of b.build()) g.add(m);
  return g;
}

/** Cửa sổ lớn: London trôi qua ngoài kính (texture canvas cuộn theo tuyến bus). */
function makeSkylineTexture(): THREE.CanvasTexture {
  const w = 2048;
  const h = 256;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d")!;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#9fd8ff");
  sky.addColorStop(1, "#ffe3c4");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const rnd = mulberry32(21);
  const colors = ["#ffc7d1", "#ffe3a3", "#bfe8d6", "#cfd8ff", "#ffd2b5"];
  for (let x = 0; x < w;) {
    const bw = 60 + rnd() * 90;
    const bh = 70 + rnd() * 110;
    ctx.fillStyle = colors[Math.floor(rnd() * colors.length)]!;
    ctx.fillRect(x, h - bh, bw - 6, bh);
    ctx.fillStyle = "#fff6d6";
    for (let wy = h - bh + 14; wy < h - 20; wy += 26)
      for (let wx = x + 10; wx < x + bw - 20; wx += 22) ctx.fillRect(wx, wy, 10, 12);
    x += bw;
  }
  // Big Ben và London Eye nhỏ xinh
  ctx.fillStyle = "#f2d49b";
  ctx.fillRect(400, 30, 40, h - 30);
  ctx.beginPath();
  ctx.moveTo(395, 32);
  ctx.lineTo(420, 0);
  ctx.lineTo(445, 32);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(1300, 120, 90, 0, Math.PI * 2);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(0.35, 1);
  return tex;
}

function Windows() {
  const tex = useMemo(() => makeSkylineTexture(), []);
  useFrame(() => {
    tex.offset.x = (game.route / 90) % 1;
  });
  const z = B.minZ + 0.01;
  return (
    <group>
      {[-4.5, 0.5, 5].map((x, i) =>
        i === 0 ? null : (
          <group key={x} position={[x, 2.6, z]}>
            <mesh>
              <planeGeometry args={[3.6, 2.4]} />
              <meshBasicMaterial map={tex} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, 0.02]} material={toon(C.white)}>
              <boxGeometry args={[0.1, 2.4, 0.04]} />
            </mesh>
            <mesh position={[0, 0, 0.02]} material={toon(C.white)}>
              <boxGeometry args={[3.6, 0.1, 0.04]} />
            </mesh>
          </group>
        ),
      )}
    </group>
  );
}

/** Nốt nhạc bay lên từ radio khi đang phát lofi. */
function Notes() {
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  const on = useUi((s) => s.music.on);
  const mat = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 64;
    const ctx = cv.getContext("2d")!;
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ff8fab";
    ctx.fillText("♪", 32, 34);
    const t = new THREE.CanvasTexture(cv);
    return new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false });
  }, []);
  useFrame(({ clock }) => {
    refs.current.forEach((s, i) => {
      if (!s) return;
      const t = (clock.elapsedTime * 0.35 + i / 3) % 1;
      s.visible = on;
      s.position.set(L.radio.x + Math.sin(t * 6 + i) * 0.3, 1.3 + t * 1.6, L.radio.z);
      s.material.opacity = 1 - t;
      s.scale.setScalar(0.35);
    });
  });
  return (
    <>
      {[0, 1, 2].map((i) => (
        <sprite
          key={i}
          material={i === 0 ? mat : mat.clone()}
          ref={(el) => {
            refs.current[i] = el;
          }}
        />
      ))}
    </>
  );
}

export function Library() {
  const room = useMemo(() => buildLibrary(), []);
  return (
    <>
      <primitive object={room} />
      <Windows />
      <Notes />
      {L.desks.map((d, i) => (
        <pointLight
          key={i}
          position={[d.x, 1.6, d.z]}
          color="#ffe2a8"
          intensity={i < 4 ? 3 : 0}
          distance={4.5}
          decay={1.5}
        />
      ))}
    </>
  );
}
