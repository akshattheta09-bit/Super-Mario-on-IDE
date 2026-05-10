import { Scene } from 'phaser';
import { Player } from '../entities/player';
import { Level } from '../levels/level1';

export class GameScene extends Scene {
  private player!: Player;
  private level!: Level;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('Game');
  }

  create() {
    // Create level
    this.level = new Level(this);
    this.level.create();

    // Create player
    this.player = new Player(this, 100, 450);
    this.player.create();

    // Set up camera to follow player
    this.cameras.main.startFollow(this.player.sprite, true, 0.05, 0.05);
    this.cameras.main.setBounds(0, 0, this.level.widthInPixels, this.level.heightInPixels);

    // Set up input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Collision between player and level layers
    this.physics.add.collider(this.player.sprite, this.level.groundLayer);
    this.physics.add.collider(this.player.sprite, this.level.platformLayer);
  }

  update(time: number, delta: number) {
    this.player.update(time, delta, this.cursors);
  }
}