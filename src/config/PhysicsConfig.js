/**
 * PhysicsConfig.js — Central data-driven physics constants
 * Units: SI (meters, kilograms, seconds)
 */

export const PhysicsConfig = Object.freeze({
  gravity: { x: 0, y: -9.81, z: 0 },
  airDensity: 1.225,
  defaultFriction: 0.6,
  defaultRestitution: 0.1,

  character: {
    height: 1.8,
    radius: 0.35,
    mass: 80,
    walkSpeed: 5.0,
    sprintMultiplier: 1.7,
    jumpImpulse: 7.0,
    airControl: 0.35,
    groundFriction: 0.85,
    maxSlopeAngle: Math.PI / 3.5
  },

  fixedTimestep: 1 / 60,
  solverIterations: 4,
  solverNdsIterations: 1
});
