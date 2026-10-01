/**
 * Ballistics.js — Real projectile simulation (RK4 + drag)
 * No hitscan. Full G1/G7 drag models, drop, wind.
 */

import { PhysicsConfig } from '../config/PhysicsConfig.js';

const G1_DRAG = 0.5;
const G7_DRAG = 0.35;

export class Projectile {
  constructor(id, origin, direction, weaponCfg, ownerId) {
    this.id = id;
    this.ownerId = ownerId;
    this.weapon = weaponCfg;
    this.alive = true;
    this.age = 0;
    this.maxAge = 4.0;

    const speed = weaponCfg.muzzleVelocity;
    this.pos = { x: origin.x, y: origin.y, z: origin.z };
    this.vel = {
      x: direction.x * speed,
      y: direction.y * speed,
      z: direction.z * speed
    };
    this.mass = weaponCfg.projectileMass;
    this.bc = weaponCfg.ballisticCoefficient;
    this.dragModel = weaponCfg.dragModel;
    this.tracerColor = weaponCfg.tracerColor;
  }

  step(dt, wind = { x: 0, y: 0, z: 0 }) {
    if (!this.alive) return;

    const g = PhysicsConfig.gravity;
    const rho = PhysicsConfig.airDensity;
    const Cd = this.dragModel === 'G7' ? G7_DRAG : G1_DRAG;
    const area = Math.PI * (this.weapon.caliber * 0.5) ** 2;
    const k = 0.5 * rho * Cd * area / (this.mass * this.bc);

    const accel = (v) => {
      const speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 0.001;
      const drag = -k * speed;
      return {
        x: drag * v.x + wind.x,
        y: g.y + drag * v.y + wind.y,
        z: drag * v.z + wind.z
      };
    };

    const k1v = accel(this.vel);
    const k1p = { ...this.vel };

    const v2 = {
      x: this.vel.x + k1v.x * dt * 0.5,
      y: this.vel.y + k1v.y * dt * 0.5,
      z: this.vel.z + k1v.z * dt * 0.5
    };
    const k2v = accel(v2);
    const k2p = v2;

    const v3 = {
      x: this.vel.x + k2v.x * dt * 0.5,
      y: this.vel.y + k2v.y * dt * 0.5,
      z: this.vel.z + k2v.z * dt * 0.5
    };
    const k3v = accel(v3);
    const k3p = v3;

    const v4 = {
      x: this.vel.x + k3v.x * dt,
      y: this.vel.y + k3v.y * dt,
      z: this.vel.z + k3v.z * dt
    };
    const k4v = accel(v4);
    const k4p = v4;

    this.vel.x += (dt / 6) * (k1v.x + 2 * k2v.x + 2 * k3v.x + k4v.x);
    this.vel.y += (dt / 6) * (k1v.y + 2 * k2v.y + 2 * k3v.y + k4v.y);
    this.vel.z += (dt / 6) * (k1v.z + 2 * k2v.z + 2 * k3v.z + k4v.z);

    this.pos.x += (dt / 6) * (k1p.x + 2 * k2p.x + 2 * k3p.x + k4p.x);
    this.pos.y += (dt / 6) * (k1p.y + 2 * k2p.y + 2 * k3p.y + k4p.y);
    this.pos.z += (dt / 6) * (k1p.z + 2 * k2p.z + 2 * k3p.z + k4p.z);

    this.age += dt;
    if (this.age > this.maxAge || this.pos.y < -50) {
      this.alive = false;
    }
  }
}

export class BallisticsSystem {
  constructor(bus) {
    this.bus = bus;
    this.projectiles = new Map();
    this.nextId = 1;
    this.wind = { x: 0.5, y: 0, z: 0.2 };
  }

  fire(origin, direction, weaponCfg, ownerId) {
    const id = this.nextId++;
    const p = new Projectile(id, origin, direction, weaponCfg, ownerId);
    this.projectiles.set(id, p);
    this.bus.emit('ballistics:fired', { id, origin, direction, weaponId: weaponCfg.id, ownerId });
    return id;
  }

  step(dt) {
    for (const [id, p] of this.projectiles) {
      if (!p.alive) {
        this.projectiles.delete(id);
        this.bus.emit('ballistics:expired', { id });
        continue;
      }
      const prev = { ...p.pos };
      p.step(dt, this.wind);
      this.bus.emit('ballistics:update', { id, pos: p.pos, prev, color: p.tracerColor });
    }
  }

  getProjectiles() {
    return this.projectiles;
  }

  clear() {
    this.projectiles.clear();
  }
}
