/**
 * CharacterBody.js — Kinematic player controller
 */

import RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsConfig } from '../config/PhysicsConfig.js';

export class CharacterBody {
  constructor(physicsWorld, playerId, spawnPos = { x: 0, y: 2, z: 0 }) {
    this.physics = physicsWorld;
    this.playerId = playerId;
    this.cfg = PhysicsConfig.character;

    const halfHeight = (this.cfg.height * 0.5) - this.cfg.radius;
    const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(spawnPos.x, spawnPos.y, spawnPos.z);

    this.body = this.physics.getWorld().createRigidBody(bodyDesc);

    const colDesc = RAPIER.ColliderDesc.capsule(halfHeight, this.cfg.radius)
      .setFriction(this.cfg.groundFriction)
      .setDensity(0);

    this.collider = this.physics.getWorld().createCollider(colDesc, this.body);

    this.controller = this.physics.getWorld().createCharacterController(0.01);
    this.controller.setMaxSlopeClimbAngle(this.cfg.maxSlopeAngle);
    this.controller.setMinSlopeSlideAngle(this.cfg.maxSlopeAngle * 0.5);
    this.controller.enableAutostep(0.3, 0.2, true);
    this.controller.enableSnapToGround(0.3);

    this.velocity = { x: 0, y: 0, z: 0 };
    this.isGrounded = false;
    this.yaw = 0;
    this.pitch = 0;
  }

  applyInput(input, dt) {
    this.yaw = input.yaw;
    this.pitch = input.pitch;

    const speed = this.cfg.walkSpeed * (input.sprint ? this.cfg.sprintMultiplier : 1);
    const groundedFactor = this.isGrounded ? 1.0 : this.cfg.airControl;

    const sin = Math.sin(this.yaw);
    const cos = Math.cos(this.yaw);
    const wishX = (input.moveX * cos - input.moveZ * sin) * speed * groundedFactor;
    const wishZ = (input.moveX * sin + input.moveZ * cos) * speed * groundedFactor;

    this.velocity.x = wishX;
    this.velocity.z = wishZ;

    if (input.jump && this.isGrounded) {
      this.velocity.y = this.cfg.jumpImpulse;
    }
  }

  step(dt) {
    if (!this.isGrounded) {
      this.velocity.y += PhysicsConfig.gravity.y * dt;
    }

    const desiredTranslation = {
      x: this.velocity.x * dt,
      y: this.velocity.y * dt,
      z: this.velocity.z * dt
    };

    this.controller.computeColliderMovement(this.collider, desiredTranslation);

    const corrected = this.controller.computedMovement();
    const pos = this.body.translation();
    this.body.setNextKinematicTranslation({
      x: pos.x + corrected.x,
      y: pos.y + corrected.y,
      z: pos.z + corrected.z
    });

    this.isGrounded = this.controller.computedGrounded();

    if (this.isGrounded && this.velocity.y < 0) {
      this.velocity.y = 0;
    }
  }

  getPosition() {
    const t = this.body.translation();
    return { x: t.x, y: t.y, z: t.z };
  }

  getRotation() {
    return { yaw: this.yaw, pitch: this.pitch };
  }

  setPosition(x, y, z) {
    this.body.setNextKinematicTranslation({ x, y, z });
  }

  setRotation(yaw, pitch) {
    this.yaw = yaw;
    this.pitch = pitch;
  }

  destroy() {
    this.physics.getWorld().removeCharacterController(this.controller);
    this.physics.removeBody(this.body);
  }
}
