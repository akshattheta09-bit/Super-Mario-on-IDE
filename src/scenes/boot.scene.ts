import { Scene } from 'phaser';

export class BootScene extends Scene {
  constructor() {
    super('Boot');
  }

  init() {
    // Set up game scaling and orientation
    this.scale.resize(800, 600);
    this.scale.centerSize();
  }

  preload() {
    // Load minimal assets for boot (if any)
    // This scene is mainly for setup
  }

  create() {
    // Transition to preload scene
    this.scene.start('Preload');
  }
}