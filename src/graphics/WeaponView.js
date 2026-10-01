/**
 * WeaponView.js — First-person weapon model + procedural recoil
 */

import * as THREE from 'three';
import { WeaponConfigs } from '../config/WeaponConfigs.js';

export class WeaponView {
  constructor(camera, bus) {
    this.camera = camera;
    this.bus = bus;
    this.group = new THREE.Group();
    camera.add(this.group);

    this.currentWeaponId = 'assaultRifle';
    this.recoilPitch = 0;
    this.recoilYaw = 0;
    this.recoilZ = 0;

    this._buildWeapon('assaultRifle');

    this.bus.on('weapon:fire', () => this.applyRecoil());
    this.bus.on('weapon:switch', ({ id }) => this.switchWeapon(id));
  }

  _buildWeapon(id) {
    while (this.group.children.length) {
      this.group.remove(this.group.children[0]);
    }

    const cfg = WeaponConfigs[id] || WeaponConfigs.assaultRifle;
    this.currentWeaponId = id;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.4 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.6 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.55), bodyMat);
    body.position.set(0.18, -0.18, -0.45);
    this.group.add(body);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.4, 8), accentMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.18, -0.14, -0.75);
    this.group.add(barrel);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.2), bodyMat);
    stock.position.set(0.18, -0.2, -0.15);
    this.group.add(stock);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.08), accentMat);
    grip.position.set(0.18, -0.28, -0.35);
    this.group.add(grip);

    this.muzzle = new THREE.Object3D();
    this.muzzle.position.set(0.18, -0.14, -0.95);
    this.group.add(this.muzzle);
  }

  switchWeapon(id) {
    if (WeaponConfigs[id]) this._buildWeapon(id);
  }

  applyRecoil() {
    const cfg = WeaponConfigs[this.currentWeaponId];
    if (!cfg) return;
    const r = cfg.recoil;
    this.recoilPitch += r.kickVertical * (0.8 + Math.random() * 0.4);
    this.recoilYaw += (Math.random() - 0.5) * r.kickHorizontal * 2;
    this.recoilZ += r.kickTranslational;
  }

  update(dt) {
    const cfg = WeaponConfigs[this.currentWeaponId];
    const recovery = cfg ? cfg.recoil.recoverySpeed : 10;

    this.recoilPitch = THREE.MathUtils.lerp(this.recoilPitch, 0, recovery * dt);
    this.recoilYaw = THREE.MathUtils.lerp(this.recoilYaw, 0, recovery * dt);
    this.recoilZ = THREE.MathUtils.lerp(this.recoilZ, 0, recovery * 1.5 * dt);

    this.group.rotation.x = -this.recoilPitch;
    this.group.rotation.y = this.recoilYaw;
    this.group.position.z = this.recoilZ;
  }

  getMuzzleWorldPosition() {
    const v = new THREE.Vector3();
    this.muzzle.getWorldPosition(v);
    return { x: v.x, y: v.y, z: v.z };
  }
}
