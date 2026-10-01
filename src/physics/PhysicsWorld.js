/**
 * PhysicsWorld.js — Rapier3D world wrapper
 */

import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsConfig } from '../config/PhysicsConfig.js';

export class PhysicsWorld {
  constructor(bus) {
    this.bus = bus;
    this.world = null;
    this.bodies = new Map();
    this.ready = false;
  }

  async init() {
    await RAPIER.init();
    this.world = new RAPIER.World(PhysicsConfig.gravity);
    this.world.numSolverIterations = PhysicsConfig.solverIterations;
    this.world.numInternalPgsIterations = PhysicsConfig.solverNdsIterations;
    this.ready = true;
    this.bus.emit('physics:ready');
  }

  getWorld() {
    return this.world;
  }

  step(dt) {
    if (!this.ready) return;
    this.world.timestep = dt;
    this.world.step();
  }

  createStaticBox(pos, size, rotation = null) {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z);
    if (rotation) bodyDesc.setRotation(rotation);
    const body = this.world.createRigidBody(bodyDesc);
    const colDesc = RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2)
      .setFriction(PhysicsConfig.defaultFriction)
      .setRestitution(PhysicsConfig.defaultRestitution);
    this.world.createCollider(colDesc, body);
    return body;
  }

  createStaticTerrain(heightData, width, depth, scale = 1) {
    return this.createStaticBox(
      { x: 0, y: -0.5, z: 0 },
      { x: width * scale, y: 1, z: depth * scale }
    );
  }

  removeBody(body) {
    if (body) this.world.removeRigidBody(body);
  }

  destroy() {
    if (this.world) {
      this.world.free();
      this.world = null;
    }
    this.ready = false;
  }
}
