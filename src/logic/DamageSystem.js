/**
 * DamageSystem.js — Hit detection against players + simple world collision
 */

import { WeaponConfigs } from '../config/WeaponConfigs.js';

export class DamageSystem {
  constructor(bus, gameState) {
    this.bus = bus;
    this.state = gameState;
    this.playerRadius = 0.4;
    this.playerHeight = 1.8;
    this.headHeight = 1.55;
  }

  checkProjectile(projectile, prevPos) {
    if (!projectile.alive) return null;

    for (const player of this.state.getAllPlayers()) {
      if (player.id === projectile.ownerId || !player.alive) continue;

      const hit = this._segmentHitsCapsule(
        prevPos,
        projectile.pos,
        { x: player.x, y: player.y, z: player.z },
        this.playerRadius,
        this.playerHeight
      );

      if (hit) {
        const cfg = projectile.weapon;
        const isHead = hit.y > player.y + this.headHeight;
        let dmg = cfg.baseDamage;
        if (isHead) dmg *= cfg.headshotMultiplier;
        else if (hit.y < player.y + 0.6) dmg *= cfg.limbMultiplier;

        projectile.alive = false;
        return {
          targetId: player.id,
          damage: Math.round(dmg),
          headshot: isHead,
          hitPos: hit,
          attackerId: projectile.ownerId,
          weaponId: cfg.id
        };
      }
    }

    if (projectile.pos.y < 0.1) {
      projectile.alive = false;
    }
    return null;
  }

  _segmentHitsCapsule(a, b, capsuleBase, radius, height) {
    const ax = a.x, ay = a.y, az = a.z;
    const bx = b.x, by = b.y, bz = b.z;
    const cx = capsuleBase.x, cy = capsuleBase.y, cz = capsuleBase.z;

    const abx = bx - ax, aby = by - ay, abz = bz - az;
    const acx = cx - ax, acy = (cy + height * 0.5) - ay, acz = cz - az;
    const abLen2 = abx * abx + aby * aby + abz * abz || 0.0001;
    let t = (acx * abx + acy * aby + acz * abz) / abLen2;
    t = Math.max(0, Math.min(1, t));

    const px = ax + abx * t;
    const py = ay + aby * t;
    const pz = az + abz * t;

    const dx = px - cx;
    const dz = pz - cz;
    const distXZ = Math.sqrt(dx * dx + dz * dz);

    if (distXZ > radius) return null;
    if (py < cy || py > cy + height) return null;

    return { x: px, y: py, z: pz };
  }
}
