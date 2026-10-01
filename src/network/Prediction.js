/**
 * Prediction.js — Client-side prediction + reconciliation
 */

export class Prediction {
  constructor(bus) {
    this.bus = bus;
    this.seq = 0;
    this.pendingInputs = [];
    this.lastServerState = null;
  }

  recordAndSend(input, sendFn) {
    this.seq++;
    const stamped = { ...input, seq: this.seq };
    this.pendingInputs.push(stamped);
    if (this.pendingInputs.length > 120) {
      this.pendingInputs.shift();
    }
    sendFn(stamped, this.seq);
    return stamped;
  }

  applyInput(character, input, dt) {
    character.applyInput(input, dt);
    character.step(dt);
  }

  reconcile(character, serverState) {
    if (!serverState || serverState.seq == null) return;

    this.pendingInputs = this.pendingInputs.filter((i) => i.seq > serverState.seq);

    character.setPosition(serverState.x, serverState.y, serverState.z);
    character.setRotation(serverState.yaw, serverState.pitch);
    character.velocity.x = serverState.vx || 0;
    character.velocity.y = serverState.vy || 0;
    character.velocity.z = serverState.vz || 0;

    const dt = 1 / 60;
    for (const input of this.pendingInputs) {
      character.applyInput(input, dt);
      character.step(dt);
    }

    this.lastServerState = serverState;
  }

  reset() {
    this.seq = 0;
    this.pendingInputs = [];
    this.lastServerState = null;
  }
}
