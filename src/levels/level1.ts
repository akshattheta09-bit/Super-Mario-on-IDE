import { Level } from './level';

export class Level1 extends Level {
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  create() {
    return super.createLevel1();
  }
}