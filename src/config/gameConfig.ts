import { Game } from 'phaser';
import { BootScene } from './scenes/boot.scene';
import { PreloadScene } from './scenes/preload.scene';
import { TitleScene } from './scenes/title.scene';
import { GameScene } from './scenes/game.scene';
import { UiScene } from './scenes/ui.scene';

export const gameConfig: GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#71c9ce',
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: [BootScene, PreloadScene, TitleScene, GameScene, UiScene]
};

interface GameConfig extends Phaser.Types.Core.GameConfig {
  scene: Phaser.Types.Core.SceneConfig[];
}

export class SuperMarioGame extends Game {
  constructor(config: GameConfig) {
    super(config);
  }
}