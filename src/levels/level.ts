import { Scene } from 'phaser';

export abstract class Level {
  protected scene: Scene;
  public groundLayer!: Phaser.Physics.Arcade.StaticGroup;
  public platformLayer!: Phaser.Physics.Arcade.StaticGroup;
  public widthInPixels: number = 0;
  public heightInPixels: number = 0;

  constructor(scene: Scene) {
    this.scene = scene;
    this.initLayers();
  }

  private initLayers(): void {
    this.groundLayer = this.scene.physics.add.staticGroup();
    this.platformLayer = this.scene.physics.add.staticGroup();
  }

  public abstract create(): void;

  // Helper method to create a tile sprite
  protected createTile(x: number, y: number, texture: string, width?: number, height?: number): Phaser.Physics.Arcade.Sprite {
    const tile = this.scene.physics.add.sprite(x, y, texture);
    if (width && height) {
      tile.setDisplaySize(width, height);
    }
    tile.setOrigin(0.5, 0.5);
    tile.body.setAllowGravity(false);
    tile.body.setImmovable(true);
    return tile;
  }

  // Helper method to create a static tile (for ground/platforms)
  protected createStaticTile(x: number, y: number, texture: string, width?: number, height?: number): Phaser.Physics.Arcade.Sprite {
    const tile = this.scene.add.sprite(x, y, texture);
    if (width && height) {
      tile.setDisplaySize(width, height);
    }
    tile.setOrigin(0.5, 0.5);
    this.groundLayer.add(tile);
    return tile;
  }
}