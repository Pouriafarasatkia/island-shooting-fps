/**
 * InputPoller.js — Keyboard + mouse + pointer lock
 */

export class InputPoller {
  constructor(canvas, bus) {
    this.canvas = canvas;
    this.bus = bus;

    this.keys = new Set();
    this.mouseDown = false;
    this.pointerLocked = false;
    this.yaw = 0;
    this.pitch = 0;
    this.sensitivity = 0.0022;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);
    this._onClick = this._onClick.bind(this);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    canvas.addEventListener('click', this._onClick);
  }

  _onClick() {
    if (!this.pointerLocked) {
      this.canvas.requestPointerLock();
    }
  }

  _onPointerLockChange() {
    this.pointerLocked = document.pointerLockElement === this.canvas;
    this.bus.emit('input:pointerLock', { locked: this.pointerLocked });
  }

  _onKeyDown(e) {
    this.keys.add(e.code);
    if (e.code === 'KeyR') this.bus.emit('input:reload');
    if (e.code === 'Digit1') this.bus.emit('input:weapon', { slot: 0 });
    if (e.code === 'Digit2') this.bus.emit('input:weapon', { slot: 1 });
  }

  _onKeyUp(e) {
    this.keys.delete(e.code);
  }

  _onMouseMove(e) {
    if (!this.pointerLocked) return;
    this.yaw -= e.movementX * this.sensitivity;
    this.pitch -= e.movementY * this.sensitivity;
    this.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.pitch));
  }

  _onMouseDown(e) {
    if (e.button === 0) this.mouseDown = true;
  }

  _onMouseUp(e) {
    if (e.button === 0) this.mouseDown = false;
  }

  poll() {
    const moveX = (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);
    const moveZ = (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0);
    let mx = moveX, mz = moveZ;
    const len = Math.hypot(mx, mz);
    if (len > 1) { mx /= len; mz /= len; }

    return {
      moveX: mx,
      moveZ: mz,
      jump: this.keys.has('Space'),
      sprint: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'),
      fire: this.mouseDown && this.pointerLocked,
      yaw: this.yaw,
      pitch: this.pitch,
      seq: 0
    };
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
    this.canvas.removeEventListener('click', this._onClick);
  }
}
