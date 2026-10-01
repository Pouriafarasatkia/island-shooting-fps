/**
 * WeaponConfigs.js — Data-driven weapon definitions
 */

export const WeaponConfigs = Object.freeze({
  assaultRifle: {
    id: 'assaultRifle',
    name: 'Assault Rifle',
    muzzleVelocity: 720,
    projectileMass: 0.004,
    ballisticCoefficient: 0.25,
    dragModel: 'G7',
    caliber: 0.00556,
    baseDamage: 28,
    headshotMultiplier: 2.4,
    limbMultiplier: 0.75,
    penetrationPower: 1.2,
    ricochetChance: 0.15,
    fireMode: 'auto',
    fireRate: 650,
    magazineSize: 30,
    reloadTime: 2.2,
    recoil: {
      kickVertical: 0.016,
      kickHorizontal: 0.005,
      kickTranslational: 0.01,
      recoverySpeed: 9.0,
      pattern: 'climbing'
    },
    tracerColor: 0xffaa00,
    sound: 'rifle'
  },
  pistol: {
    id: 'pistol',
    name: 'Pistol',
    muzzleVelocity: 380,
    projectileMass: 0.008,
    ballisticCoefficient: 0.18,
    dragModel: 'G1',
    caliber: 0.009,
    baseDamage: 35,
    headshotMultiplier: 2.6,
    limbMultiplier: 0.7,
    penetrationPower: 0.6,
    ricochetChance: 0.25,
    fireMode: 'semi',
    fireRate: 380,
    magazineSize: 15,
    reloadTime: 1.5,
    recoil: {
      kickVertical: 0.03,
      kickHorizontal: 0.01,
      kickTranslational: 0.018,
      recoverySpeed: 11.0,
      pattern: 'sharp'
    },
    tracerColor: 0xffee88,
    sound: 'pistol'
  }
});

export const DefaultLoadout = ['assaultRifle', 'pistol'];
