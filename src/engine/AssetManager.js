/**
 * AssetManager.js — Async loader (procedural focused, minimal external assets)
 */

import * as THREE from 'three';

export class AssetManager {
  constructor(bus) {
    this.bus = bus;
    this.cache = new Map();
    this.loading = new Map();
    this.textureLoader = new THREE.TextureLoader();
    this.audioLoader = new THREE.AudioLoader();
  }

  load(url, type = 'texture') {
    if (this.cache.has(url)) {
      return Promise.resolve(this.cache.get(url));
    }
    if (this.loading.has(url)) {
      return this.loading.get(url);
    }

    let promise;
    switch (type) {
      case 'texture':
        promise = this.textureLoader.loadAsync(url);
        break;
      case 'audio':
        promise = this.audioLoader.loadAsync(url);
        break;
      default:
        return Promise.reject(new Error(`Unknown asset type: ${type}`));
    }

    const tracked = promise
      .then((res) => {
        this.cache.set(url, res);
        this.loading.delete(url);
        this.bus.emit('assets:progress', { loaded: this.cache.size, total: this.cache.size + this.loading.size, url });
        return res;
      })
      .catch((err) => {
        this.loading.delete(url);
        this.bus.emit('assets:error', { url, error: err });
        throw err;
      });

    this.loading.set(url, tracked);
    return tracked;
  }

  async loadAll(list) {
    if (!list || list.length === 0) {
      this.bus.emit('assets:complete');
      return new Map();
    }
    const results = await Promise.all(
      list.map(({ url, type }) => this.load(url, type || 'texture').then((r) => [url, r]))
    );
    this.bus.emit('assets:complete');
    return new Map(results);
  }

  get(url) {
    return this.cache.get(url) ?? null;
  }

  has(url) {
    return this.cache.has(url);
  }

  clear() {
    this.cache.clear();
    this.loading.clear();
  }
}
