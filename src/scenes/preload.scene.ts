import { Scene } from 'phaser';
import { AssetKeys } from '../utils/assetKeys';

export class PreloadScene extends Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    // Set up a loading sprite or text if desired
    const width = this.scale.width;
    const height = this.scale.height;

    // Loading text
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    // Progress bar background
    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x222222, 0.8);
    progressBarBg.fillRect(width / 2 - 150, height / 2, 300, 30);

    // Progress bar
    const progressBar = this.add.graphics();
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 145, height / 2 + 5, 290 * value, 20);
    });

    // Load assets
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('block', 'assets/block.png');
    this.load.image('coin', 'assets/coin.png');
    this.load.spritesheet('mario', 'assets/mario.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('enemy', 'assets/enemy.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.audio('jump', 'assets/audio/jump.wav');
    this.load.audio('coin', 'assets/audio/coin.wav');
    this.load.audio('stomp', 'assets/audio/stomp.wav');

    // Remove loading graphics when done
    this.load.on('complete', () => {
      loadingText.destroy();
      progressBarBg.destroy();
      progressBar.destroy();
      this.scene.start('Title');
    });
  }

  create() {
    // This will be called when preload is complete, but we handle transition in the 'complete' event
  }
}