import { useFrame } from "@react-three/fiber";
import { TEMPLE_PROPS as T, TEMPLE_SCENE, mulberry32 } from "@oii-bus/world";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { C, glow, mat, metal, shiny, texMat } from "./materials";
import { signMaterial } from "./signs";
import { StaticBuilder } from "./StaticBuilder";

const B = TEMPLE_SCENE.bounds;
const RED = "#b8322f";
const RED_DARK = "#8f2522";
const ROOF = "#3f6b5c";
const ROOF_EDGE = "#2f5448";
const WALL = "#f2d98b";
const GOLD = "#e3b23c";
const BRONZE = "#8a6a3b";

type Builder = StaticBuilder;

/** Mái cong kiểu chùa Việt: hai mái dốc + bờ nóc + đầu đao cong vút ở bốn góc. */
function curvedRoof(b: Builder, x: number, y: number, z: number, w: number, d: number, h: number) {
  const roof = mat(ROOF, 0.7);
  const edge = mat(ROOF_EDGE, 0.7);
  const half = d / 2;
  const slope = Math.atan2(h, half);
  const len = Math.hypot(h, half) + 0.4;
  for (const s of [-1, 1]) {
    b.box(roof, w, 0.22, len, x, y + h / 2, z + s * (half / 2), s * slope);
    b.box(edge, w + 0.2, 0.18, 0.3, x, y - 0.05, z + s * (half + 0.15));
  }
  b.box(edge, w + 0.6, 0.35, 0.45, x, y + h + 0.1, z); // bờ nóc
  // đầu đao cong
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      b.add(
        edge,
        new THREE.ConeGeometry(0.16, 1.4, 6),
        x + sx * (w / 2 + 0.35),
        y + 0.45,
        z + sz * (half + 0.1),
        sz * -0.5,
        0,
        sx * -0.9,
      );
    }
    b.add(
      edge,
      new THREE.ConeGeometry(0.2, 1.1, 6),
      x + sx * (w / 2 + 0.2),
      y + h + 0.55,
      z,
      0,
      0,
      sx * -0.6,
    );
  }
  // rồng chầu mặt nguyệt trên nóc
  b.sphere(mat(GOLD, 0.4, 0.4), 0.35, x, y + h + 0.65, z);
  for (const sx of [-1, 1])
    b.add(
      edge,
      new THREE.TorusGeometry(0.5, 0.12, 6, 12, Math.PI),
      x + sx * 1.4,
      y + h + 0.45,
      z,
      0,
      0,
      sx > 0 ? 0 : Math.PI,
    );
}

function buildTemple(): THREE.Group {
  const b = new StaticBuilder();
  const rnd = mulberry32(88);
  const W = B.maxX - B.minX + 2;
  const D = B.maxZ - B.minZ + 2;

  // sân lát đá + lối đi chính
  b.box(texMat("flagstone", "#d9d2c3", 6, 4), W, 0.2, D, 0, -0.1, 0);
  b.box(texMat("flagstone", "#cbbfa8", 1, 4), 3, 0.02, D, 0, 0.01, 0);
  // nền xa (vườn, tre)
  b.box(texMat("grass", "#a9d79a", 8, 4), 70, 0.1, 40, 0, -0.15, -22);

  // tường bao vàng, mái ngói xanh (hai bên)
  for (const s of [-1, 1]) {
    b.box(mat(WALL), 0.5, 2.2, D, s * (B.maxX + 0.7), 1.1, 0);
    b.box(mat(ROOF), 1.1, 0.25, D + 0.4, s * (B.maxX + 0.7), 2.35, 0);
    for (let z = B.minZ; z < B.maxZ; z += 2.4)
      b.box(mat("#e8c96f"), 0.52, 0.8, 0.8, s * (B.maxX + 0.7), 1.3, z + 1.2);
  }

  // --- Chính điện phía sau ---
  const hz = B.minZ - 3.2;
  b.box(mat("#cdbf9f"), 16, 0.9, 6.5, 0, 0.45, hz); // bệ
  for (let i = 0; i < 3; i++) b.box(mat("#d8ccb0"), 5, 0.3, 0.6, 0, 0.15 + i * 0.3, hz + 3.6 - i * 0.6); // bậc thềm
  b.box(mat(WALL), 13, 4.2, 5, 0, 3, hz - 0.3);
  for (let i = 0; i < 6; i++) b.cyl(mat(RED, 0.5), 0.26, 4.4, -6 + i * 2.4, 3.1, hz + 2.4); // cột đỏ
  b.box(mat(RED_DARK), 13.6, 0.4, 0.4, 0, 5.2, hz + 2.4);
  // cửa gỗ đỏ + ánh nến bên trong
  for (const dx of [-3.6, 0, 3.6]) {
    b.box(mat(RED, 0.55), 2.2, 3, 0.2, dx, 2.4, hz + 2.2);
    b.box(glow("#ffcf7a", 0.6, 1.1), 1.6, 2.4, 0.1, dx, 2.4, hz + 2.31);
  }
  b.add(
    signMaterial("", {
      bg: "#8f2522",
      fg: "#f2c14e",
      border: "#f2c14e",
      lines: ["CHÙA CẦU DUYÊN"],
      font: 'bold 64px "Nunito", serif',
    }),
    new THREE.PlaneGeometry(5, 0.9),
    0,
    4.55,
    hz + 2.65,
  );
  curvedRoof(b, 0, 5.4, hz, 15, 7.5, 1.9);
  curvedRoof(b, 0, 7.6, hz - 0.3, 9, 4.5, 1.4); // mái chồng diêm tầng hai
  b.box(mat(WALL), 8, 1.2, 3.6, 0, 7.4, hz - 0.3);
  // câu đối hai bên cửa
  for (const dx of [-5.4, 5.4])
    b.add(
      signMaterial("", {
        bg: "#8f2522",
        fg: "#f2c14e",
        width: 96,
        height: 512,
        lines: ["Duyên", "lành", "tự", "đến"],
      }),
      new THREE.PlaneGeometry(0.5, 2.8),
      dx,
      3,
      hz + 2.71,
    );

  // --- Lư hương đồng giữa sân ---
  const ic = T.incense;
  const bronze = mat(BRONZE, 0.4, 0.6);
  b.box(mat("#bfb39a"), 1.6, 0.6, 1.6, ic.x, 0.3, ic.z);
  b.add(bronze, new THREE.CylinderGeometry(0.7, 0.55, 0.8, 16), ic.x, 1.0, ic.z);
  b.add(bronze, new THREE.TorusGeometry(0.72, 0.06, 6, 20), ic.x, 1.4, ic.z, Math.PI / 2);
  for (const a of [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3])
    b.cyl(bronze, 0.08, 0.5, ic.x + Math.cos(a) * 0.45, 0.65, ic.z + Math.sin(a) * 0.45);
  for (const s of [-1, 1])
    b.add(bronze, new THREE.TorusGeometry(0.18, 0.04, 6, 12), ic.x + s * 0.8, 1.25, ic.z, 0, Math.PI / 2);
  b.add(mat("#d9cdb0"), new THREE.CylinderGeometry(0.62, 0.62, 0.05, 16), ic.x, 1.38, ic.z);
  for (let i = 0; i < 14; i++) {
    const a = rnd() * Math.PI * 2;
    const r = rnd() * 0.45;
    b.box(
      mat(RED),
      0.03,
      0.7,
      0.03,
      ic.x + Math.cos(a) * r,
      1.72,
      ic.z + Math.sin(a) * r,
      (rnd() - 0.5) * 0.2,
      0,
      (rnd() - 0.5) * 0.2,
    );
    b.sphere(glow("#ff8a3c", 1, 1.5), 0.025, ic.x + Math.cos(a) * r, 2.07, ic.z + Math.sin(a) * r);
  }

  // --- Miếu Ông Tơ Bà Nguyệt ---
  const mm = T.matchmaker;
  b.box(mat("#cdbf9f"), 3.4, 0.5, 2, mm.x, 0.25, mm.z - 0.4);
  b.box(mat(WALL), 3, 2.4, 1.6, mm.x, 1.7, mm.z - 0.6);
  for (const dx of [-1.4, 1.4]) b.cyl(mat(RED, 0.5), 0.12, 2.4, dx + mm.x, 1.7, mm.z + 0.3);
  curvedRoof(b, mm.x, 2.9, mm.z - 0.4, 3.6, 2.6, 0.8);
  b.box(glow("#ffcf7a", 0.5, 1), 2.4, 1.6, 0.1, mm.x, 1.6, mm.z + 0.21);
  // Ông Tơ (áo nâu, râu trắng) + Bà Nguyệt (áo hồng), sợi chỉ đỏ nối hai người
  for (const [dx, robe] of [
    [-0.5, "#9a6b46"],
    [0.5, "#e98a9a"],
  ] as const) {
    b.add(mat(robe), new THREE.ConeGeometry(0.28, 0.7, 10), mm.x + dx, 1.35, mm.z + 0.35);
    b.sphere(mat(C.skin), 0.17, mm.x + dx, 1.8, mm.z + 0.35);
    if (dx < 0)
      b.add(mat("#ffffff"), new THREE.ConeGeometry(0.1, 0.25, 8), mm.x + dx, 1.62, mm.z + 0.5, Math.PI);
  }
  b.add(
    mat("#e0302e", 0.5),
    new THREE.TorusGeometry(0.5, 0.015, 4, 20, Math.PI),
    mm.x,
    1.5,
    mm.z + 0.42,
    Math.PI,
  );
  b.add(
    signMaterial("", { bg: "#8f2522", fg: "#f2c14e", lines: ["Ông Tơ · Bà Nguyệt"] }),
    new THREE.PlaneGeometry(2, 0.38),
    mm.x,
    2.75,
    mm.z + 0.33,
  );
  b.box(mat("#6b4a2f"), 1.6, 0.8, 0.6, mm.x, 0.9, mm.z + 0.55); // bàn thờ nhỏ
  b.add(
    signMaterial("", { bg: "#fff4d6", fg: "#8f2522", lines: ["💞 Xin quẻ se duyên"] }),
    new THREE.PlaneGeometry(1.4, 0.3),
    mm.x,
    0.95,
    mm.z + 0.86,
  );

  // --- Cây duyên với chỉ đỏ và thẻ gỗ ---
  const wt = T.wishTree;
  b.cyl(mat("#6b4f3a"), 0.35, 3.2, wt.x, 1.6, wt.z);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.cyl(
      mat("#6b4f3a"),
      0.1,
      1.8,
      wt.x + Math.cos(a) * 0.6,
      3.6,
      wt.z + Math.sin(a) * 0.6,
      Math.sin(a) * 0.7,
      0,
      -Math.cos(a) * 0.7,
    );
  }
  for (let i = 0; i < 9; i++)
    b.sphere(
      mat(["#7fbf6a", "#8fcf7a", "#6fae5c"][i % 3]!),
      0.9 + rnd() * 0.5,
      wt.x + (rnd() - 0.5) * 3,
      4.3 + rnd() * 1.2,
      wt.z + (rnd() - 0.5) * 2.4,
    );
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 0.8 + rnd() * 1.2;
    const x = wt.x + Math.cos(a) * r;
    const z = wt.z + Math.sin(a) * r * 0.8;
    const y = 2.6 + rnd() * 1.2;
    b.box(mat("#e0302e", 0.6), 0.03, 0.9, 0.03, x, y, z);
    b.box(mat("#d9b27a"), 0.18, 0.26, 0.03, x, y - 0.55, z);
  }
  b.box(mat("#bfb39a"), 1.6, 0.4, 1.6, wt.x, 0.2, wt.z);

  // --- Hòm công đức + mâm ngũ quả ---
  const dn = T.donate;
  b.box(mat("#6b4a2f"), 1.4, 0.8, 0.8, dn.x, 0.4, dn.z);
  b.box(mat(RED, 0.5), 0.9, 0.7, 0.6, dn.x, 1.15, dn.z);
  b.box(mat("#2a1a14"), 0.4, 0.04, 0.1, dn.x, 1.51, dn.z);
  b.add(
    signMaterial("", { bg: "#b8322f", fg: "#f2c14e", lines: ["CÔNG ĐỨC"] }),
    new THREE.PlaneGeometry(0.8, 0.3),
    dn.x,
    1.15,
    dn.z + 0.31,
  );
  b.cyl(mat(GOLD, 0.4, 0.5), 0.3, 0.06, dn.x + 0.5, 0.83, dn.z - 0.1);
  for (const [fx, c] of [
    [0.4, "#f2c14e"],
    [0.55, "#e85d3a"],
    [0.6, "#7fbf6a"],
    [0.45, "#ffd27a"],
  ] as const)
    b.sphere(mat(c), 0.09, dn.x + fx, 0.95, dn.z - 0.1 + (fx - 0.5));

  // --- Lầu chuông kiểu chùa Hàn ---
  const bl = T.bell;
  for (const [dx, dz] of [
    [-0.6, -0.6],
    [0.6, -0.6],
    [-0.6, 0.6],
    [0.6, 0.6],
  ] as const)
    b.cyl(mat(RED, 0.5), 0.08, 2.8, bl.x + dx, 1.4, bl.z + dz);
  curvedRoof(b, bl.x, 2.8, bl.z, 1.8, 1.8, 0.6);
  b.add(mat("#5f7f6e", 0.35, 0.7), new THREE.CylinderGeometry(0.32, 0.42, 0.9, 16), bl.x, 1.9, bl.z);
  b.sphere(mat("#5f7f6e", 0.35, 0.7), 0.32, bl.x, 2.35, bl.z);
  b.box(mat("#8a6a4a"), 1.1, 0.12, 0.12, bl.x + 0.3, 1.8, bl.z + 0.55); // chày gỗ

  // --- Góc tụng kinh: bàn thờ nhỏ, mõ, chuông, nến ---
  const ca = T.chantAltar;
  b.box(mat("#6b4a2f"), 3.4, 0.9, 0.8, ca.x, 0.45, ca.z);
  b.box(mat(RED, 0.5), 3.5, 0.08, 0.9, ca.x, 0.92, ca.z);
  b.add(
    mat("#8b3a1f", 0.4),
    new THREE.SphereGeometry(0.28, 14, 10),
    ca.x - 0.8,
    1.15,
    ca.z,
    0,
    0,
    0,
    1.2,
    0.8,
    1,
  ); // mõ
  b.add(
    mat(GOLD, 0.35, 0.6),
    new THREE.CylinderGeometry(0.2, 0.14, 0.2, 14, 1, true),
    ca.x + 0.8,
    1.06,
    ca.z,
  );
  b.add(
    mat("#f7d9a0"),
    new THREE.SphereGeometry(0.3, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    ca.x,
    0.96,
    ca.z,
    0,
    0,
    0,
    1,
    1.2,
    1,
  ); // hoa sen
  for (const dx of [-1.4, 1.4]) {
    b.cyl(mat("#fff3d6"), 0.05, 0.3, ca.x + dx, 1.1, ca.z);
    b.sphere(glow("#ffb347", 1, 1.6), 0.04, ca.x + dx, 1.3, ca.z);
  }
  for (const s of TEMPLE_SCENE.seats)
    b.add(mat("#e8b84a"), new THREE.CylinderGeometry(0.34, 0.36, 0.18, 16), s.x, 0.09, s.z);
  b.add(
    signMaterial("", { bg: "#fff4d6", fg: "#8f2522", lines: ["📿 Tụng kinh tích đức"] }),
    new THREE.PlaneGeometry(1.6, 0.3),
    ca.x,
    0.55,
    ca.z + 0.41,
  );

  // --- Hồ cá koi với hoa sen ---
  const pd = T.pond;
  b.box(mat("#b9b0a0"), 4.6, 0.4, 3.2, pd.x, 0.2, pd.z);
  b.box(shiny("#5fa8b8"), 4.1, 0.05, 2.7, pd.x, 0.38, pd.z);
  for (let i = 0; i < 6; i++) {
    const lx = pd.x + (rnd() - 0.5) * 3.4;
    const lz = pd.z + (rnd() - 0.5) * 2.0;
    b.add(mat("#5fae5c"), new THREE.CylinderGeometry(0.28, 0.28, 0.02, 12), lx, 0.42, lz);
    if (i % 2 === 0)
      for (let k = 0; k < 5; k++)
        b.add(
          mat("#f7a8c0"),
          new THREE.ConeGeometry(0.06, 0.18, 4),
          lx + Math.cos(k) * 0.06,
          0.52,
          lz + Math.sin(k) * 0.06,
          Math.cos(k) * 0.5,
          0,
          Math.sin(k) * 0.5,
        );
  }

  // --- Tháp đá 5 tầng kiểu Hàn ---
  const pg = T.pagoda;
  const stone = mat("#b4ada0");
  b.box(stone, 1.6, 0.5, 1.6, pg.x, 0.25, pg.z);
  for (let i = 0; i < 5; i++) {
    const y = 0.5 + i * 0.75;
    const w = 1.0 - i * 0.12;
    b.box(stone, w, 0.5, w, pg.x, y + 0.25, pg.z);
    b.box(stone, w + 0.5, 0.12, w + 0.5, pg.x, y + 0.56, pg.z);
  }
  b.add(stone, new THREE.ConeGeometry(0.2, 0.7, 8), pg.x, 4.6, pg.z);

  // --- Cầu thang lên thư viện ---
  const st = T.stairs;
  for (let i = 0; i < 5; i++)
    b.box(mat("#cdbf9f"), 2.2, 0.25 + i * 0.3, 0.4, st.x, (0.25 + i * 0.3) / 2, st.z + 1.0 - i * 0.4);
  b.add(
    signMaterial("", { bg: "#4e9297", fg: "#ffffff", lines: ["📚 Lên thư viện"] }),
    new THREE.PlaneGeometry(1.6, 0.4),
    st.x,
    2.3,
    st.z - 0.8,
  );

  // --- Rừng tre + đèn đá ---
  for (let i = 0; i < 40; i++) {
    const x = -22 + rnd() * 44;
    const z = -14 - rnd() * 8;
    const h = 6 + rnd() * 5;
    b.cyl(mat("#7fae5c"), 0.08, h, x, h / 2, z);
    b.sphere(mat("#8fcf7a"), 0.7, x, h, z);
  }
  for (const [lx, lz] of [
    [-3, 3.6],
    [3, 3.6],
    [-3, -3.4],
    [3, -3.4],
  ] as const) {
    b.box(stone, 0.5, 0.9, 0.5, lx, 0.45, lz);
    b.box(stone, 0.7, 0.12, 0.7, lx, 0.96, lz);
    b.box(glow("#ffd27a", 0.6, 1.3), 0.4, 0.35, 0.4, lx, 1.2, lz);
    b.add(stone, new THREE.ConeGeometry(0.5, 0.35, 4), lx, 1.55, lz, 0, Math.PI / 4);
  }

  // đèn lồng đỏ dưới hiên chính điện
  for (let i = 0; i < 5; i++)
    b.add(
      glow("#e8443a", 0.6, 1.3),
      new THREE.SphereGeometry(0.28, 12, 10),
      -5 + i * 2.5,
      4.6,
      hz + 2.9,
      0,
      0,
      0,
      1,
      1.25,
      1,
    );

  const g = new THREE.Group();
  for (const m of b.build()) {
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  }
  return g;
}

const LANTERN_ROWS = [-5.6, -2.8];

/** Đèn lồng hoa sen nhiều màu treo khắp sân (như chùa Hàn mùa Phật đản). */
function LotusLanterns() {
  const { geo, mats, positions } = useMemo(() => {
    const petal = new THREE.SphereGeometry(0.15, 10, 8);
    petal.scale(1, 1.15, 1);
    const colors = ["#f7a8c0", "#fde3a0", "#a8d3d9", "#c5e3b0", "#f6c6cf"];
    const mats = colors.map((c) => glow(c, 0.45, 1.1));
    const positions: { x: number; y: number; z: number; m: number }[] = [];
    let k = 0;
    // hai dây đèn phía sau sân, để không che camera
    for (const z of LANTERN_ROWS) {
      for (let x = -10; x <= 10; x += 1.3) {
        const sag = Math.cos((x / 10) * (Math.PI / 2)) * 0.4;
        positions.push({ x, y: 3.5 - sag, z, m: k++ % colors.length });
      }
    }
    return { geo: petal, mats, positions };
  }, []);
  const refs = useRef<THREE.InstancedMesh[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    mats.forEach((_, mi) => {
      const mesh = refs.current[mi];
      if (!mesh) return;
      let i = 0;
      for (const p of positions) {
        if (p.m !== mi) continue;
        dummy.position.set(p.x, p.y + Math.sin(t * 1.2 + p.x) * 0.03, p.z);
        dummy.rotation.set(0, t * 0.2 + p.x, Math.sin(t + p.z) * 0.05);
        dummy.updateMatrix();
        mesh.setMatrixAt(i++, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    });
  });
  const counts = mats.map((_, mi) => positions.filter((p) => p.m === mi).length);
  return (
    <>
      {mats.map((m, mi) => (
        <instancedMesh
          key={mi}
          ref={(el) => {
            if (el) refs.current[mi] = el;
          }}
          args={[geo, m, counts[mi] ?? 0]}
          frustumCulled={false}
        />
      ))}
      {LANTERN_ROWS.map((z) => (
        <mesh key={z} position={[0, 3.62, z]} material={metal("#5a4636")}>
          <boxGeometry args={[21, 0.015, 0.015]} />
        </mesh>
      ))}
    </>
  );
}

/** Khói hương bay lên từ lư hương. */
function Smoke() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const t = (clock.elapsedTime * 0.25 + i / 6) % 1;
      m.position.set(
        T.incense.x + Math.sin(t * 5 + i) * 0.25 * t,
        2.1 + t * 2.6,
        T.incense.z + Math.cos(t * 4 + i) * 0.15 * t,
      );
      m.scale.setScalar(0.08 + t * 0.35);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - t);
    });
  });
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color="#f4f1ea" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

/** Cá koi bơi vòng trong hồ. */
function Koi() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((g, i) => {
      if (!g) return;
      const a = clock.elapsedTime * (0.4 + i * 0.1) + i * 2;
      g.position.set(
        T.pond.x + Math.cos(a) * (1.4 - i * 0.2),
        0.36,
        T.pond.z + Math.sin(a) * (0.8 - i * 0.1),
      );
      g.rotation.y = -a;
    });
  });
  return (
    <>
      {["#ff8a3c", "#ffffff", "#ffb347"].map((c, i) => (
        <group
          key={c}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <mesh scale={[0.12, 0.06, 0.28]} material={mat(c, 0.4)}>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
          <mesh position={[0, 0, -0.3]} rotation-x={Math.PI / 2} material={mat(c, 0.4)}>
            <coneGeometry args={[0.08, 0.14, 6]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

export function Temple() {
  const temple = useMemo(() => buildTemple(), []);
  return (
    <>
      <primitive object={temple} />
      <LotusLanterns />
      <Smoke />
      <Koi />
      <pointLight
        position={[T.incense.x, 2.4, T.incense.z]}
        color="#ffb060"
        intensity={4}
        distance={6}
        decay={1.6}
      />
      <pointLight
        position={[T.matchmaker.x, 2, T.matchmaker.z + 1]}
        color="#ff9a8a"
        intensity={4}
        distance={6}
        decay={1.6}
      />
    </>
  );
}
