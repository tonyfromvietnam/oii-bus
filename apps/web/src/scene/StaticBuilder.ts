import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Gom mọi hình tĩnh theo vật liệu rồi merge → mỗi vật liệu một draw call (brief §7).
 * Dùng primitive low-poly; sau này thay bằng glTF chỉ cần thêm geometry đã transform vào bucket.
 */
export class StaticBuilder {
  private buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private e = new THREE.Euler();
  private s = new THREE.Vector3();
  private p = new THREE.Vector3();

  add(
    mat: THREE.Material,
    geom: THREE.BufferGeometry,
    x = 0,
    y = 0,
    z = 0,
    rx = 0,
    ry = 0,
    rz = 0,
    sx = 1,
    sy = 1,
    sz = 1,
  ) {
    this.e.set(rx, ry, rz);
    this.q.setFromEuler(this.e);
    this.p.set(x, y, z);
    this.s.set(sx, sy, sz);
    this.m.compose(this.p, this.q, this.s);
    const g = geom.index ? geom.toNonIndexed() : geom.clone();
    g.applyMatrix4(this.m);
    for (const name of Object.keys(g.attributes)) {
      if (name !== "position" && name !== "normal" && name !== "uv") g.deleteAttribute(name);
    }
    let list = this.buckets.get(mat);
    if (!list) this.buckets.set(mat, (list = []));
    list.push(g);
    if (geom !== BOX && geom !== CYL8 && geom !== SPHERE && geom !== PLANE) {
      // geometry tạm (không dùng chung) → giải phóng
      geom.dispose();
    }
  }

  /** Hộp: kích thước w×h×d, tâm tại (x, y, z). */
  box(
    mat: THREE.Material,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    rx = 0,
    ry = 0,
    rz = 0,
  ) {
    this.add(mat, BOX, x, y, z, rx, ry, rz, w, h, d);
  }

  /** Trụ đứng: bán kính r, cao h, tâm tại (x, y, z). */
  cyl(mat: THREE.Material, r: number, h: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) {
    this.add(mat, CYL8, x, y, z, rx, ry, rz, r, h, r);
  }

  sphere(mat: THREE.Material, r: number, x: number, y: number, z: number, sy = 1) {
    this.add(mat, SPHERE, x, y, z, 0, 0, 0, r, r * sy, r);
  }

  /** Mặt phẳng nằm ngang (trên mặt đất). */
  flat(mat: THREE.Material, w: number, d: number, x: number, y: number, z: number, ry = 0) {
    this.add(mat, PLANE, x, y, z, -Math.PI / 2, 0, 0, w, d, 1);
    if (ry) {
      // xoay quanh y: áp riêng để giữ mặt nằm ngang
      const list = this.buckets.get(mat)!;
      const g = list[list.length - 1]!;
      g.translate(-x, -y, -z);
      g.rotateY(ry);
      g.translate(x, y, z);
    }
  }

  build(): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    for (const [mat, geoms] of this.buckets) {
      const merged = mergeGeometries(geoms, false);
      for (const g of geoms) g.dispose();
      if (!merged) continue;
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, mat);
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      meshes.push(mesh);
    }
    this.buckets.clear();
    return meshes;
  }
}

const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL8 = new THREE.CylinderGeometry(1, 1, 1, 10);
const SPHERE = new THREE.IcosahedronGeometry(1, 1);
const PLANE = new THREE.PlaneGeometry(1, 1);
