/**
 * GameState.js — Authoritative game state (host) + local mirror
 */

import { WeaponConfigs, DefaultLoadout } from '../config/WeaponConfigs.js';

export class PlayerState {
  constructor(id, name, spawn = { x: 0, y: 2, z: 0 }) {
    this.id = id;
    this.name = name;
    this.x = spawn.x;
    this.y = spawn.y;
    this.z = spawn.z;
    this.yaw = 0;
    this.pitch = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.alive = true;
    this.weaponId = DefaultLoadout[0];
    this.ammo = WeaponConfigs[this.weaponId]?.magazineSize ?? 30;
    this.reserveAmmo = 90;
    this.kills = 0;
    this.deaths = 0;
    this.lastFireTime = 0;
    this.reloading = false;
    this.reloadEnd = 0;
  }

  toNetwork() {
    return {
      id: this.id,
      name: this.name,
      x: this.x, y: this.y, z: this.z,
      yaw: this.yaw, pitch: this.pitch,
      vx: this.vx, vy: this.vy, vz: this.vz,
      health: this.health,
      alive: this.alive,
      weaponId: this.weaponId,
      ammo: this.ammo,
      kills: this.kills,
      deaths: this.deaths
    };
  }
}

export class GameState {
  constructor(bus) {
    this.bus = bus;
    this.players = new Map();
    this.tick = 0;
    this.spawns = [
      { x: 5, y: 2, z: 5 },
      { x: -5, y: 2, z: 5 },
      { x: 5, y: 2, z: -5 },
      { x: -5, y: 2, z: -5 },
      { x: 10, y: 2, z: 0 },
      { x: -10, y: 2, z: 0 },
      { x: 0, y: 2, z: 10 },
      { x: 0, y: 2, z: -10 }
    ];
    this.spawnIndex = 0;
  }

  addPlayer(id, name) {
    const spawn = this.spawns[this.spawnIndex % this.spawns.length];
    this.spawnIndex++;
    const p = new PlayerState(id, name, spawn);
    this.players.set(id, p);
    this.bus.emit('state:playerAdded', { id, player: p });
    return p;
  }

  removePlayer(id) {
    this.players.delete(id);
    this.bus.emit('state:playerRemoved', { id });
  }

  getPlayer(id) {
    return this.players.get(id);
  }

  getAllPlayers() {
    return Array.from(this.players.values());
  }

  snapshot() {
    return {
      tick: this.tick,
      players: this.getAllPlayers().map((p) => p.toNetwork())
    };
  }

  applyDamage(targetId, amount, attackerId, headshot = false) {
    const p = this.players.get(targetId);
    if (!p || !p.alive) return false;
    p.health = Math.max(0, p.health - amount);
    if (p.health <= 0) {
      p.alive = false;
      p.deaths++;
      const attacker = this.players.get(attackerId);
      if (attacker) attacker.kills++;
      this.bus.emit('state:kill', { victim: targetId, killer: attackerId, headshot });
      setTimeout(() => this.respawn(targetId), 3000);
    }
    this.bus.emit('state:damage', { targetId, amount, health: p.health });
    return true;
  }

  respawn(id) {
    const p = this.players.get(id);
    if (!p) return;
    const spawn = this.spawns[Math.floor(Math.random() * this.spawns.length)];
    p.x = spawn.x;
    p.y = spawn.y;
    p.z = spawn.z;
    p.health = p.maxHealth;
    p.alive = true;
    p.ammo = WeaponConfigs[p.weaponId]?.magazineSize ?? 30;
    this.bus.emit('state:respawn', { id, x: p.x, y: p.y, z: p.z });
  }

  updateFromNetwork(netPlayers) {
    for (const np of netPlayers) {
      let p = this.players.get(np.id);
      if (!p) {
        p = this.addPlayer(np.id, np.name);
      }
      Object.assign(p, {
        x: np.x, y: np.y, z: np.z,
        yaw: np.yaw, pitch: np.pitch,
        vx: np.vx, vy: np.vy, vz: np.vz,
        health: np.health,
        alive: np.alive,
        weaponId: np.weaponId,
        ammo: np.ammo,
        kills: np.kills,
        deaths: np.deaths
      });
    }
  }
}
