import { Scene } from 'phaser';

export class TitleScene extends Scene {
  constructor() {
    super('Title');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Background
    this.add.rectangle(0, 0, width, height, 0x71c9ce).setOrigin(0);

    // Title text
    this.add.text(width / 2, height / 3, 'SUPER MARIO GAME', {
      fontFamily: 'Arial Black',
      fontSize: 48,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Start instruction
    this.add.text(width / 2, height / 2, 'Press ENTER to Start', {
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#ffffff'
    }).setOrigin(0.5);

    // Handle input
    const enterKey = this.input.keyboard.addKey('ENTER');
    enterKey.on('down', () => {
      this.scene.start('Game');
      this.scene.launch('UI');
    });
  }
}