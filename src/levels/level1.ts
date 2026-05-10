import { Level } from './level';

export class Level1 extends Level {
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  create(): void {
    // Ground
    const ground = this.groundLayer.create(400, 560, 'ground');
    ground.setDisplaySize(800, 40);
    ground.refreshBody();

    // Platforms
    const platform1 = this.platformLayer.create(600, 400, 'ground');
    platform1.setDisplaySize(200, 40);
    platform1.refreshBody();

    const platform2 = this.platformLayer.create(300, 250, 'ground');
    platform2.setDisplaySize(150, 40);
    platform2.refreshBody();

    const platform3 = this.platformLayer.create(100, 100, 'ground');
    platform3.setDisplaySize(100, 40);
    platform3.refreshBody();

    // Set world bounds
    this.widthInPixels = 1600;
    this.heightInPixels = 600;
    this.scene.physics.world.setBounds(0, 0, this.widthInPixels, this.heightInPixels);
  }
}