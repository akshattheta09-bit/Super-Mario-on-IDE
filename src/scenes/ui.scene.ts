import { Scene } from 'phaser';

export class UiScene extends Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private score = 0;
  private lives = 3;

  constructor() {
    super('UI');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Score
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#fff'
    });
    this.scoreText.setScrollFactor(0);

    // Lives
    this.livesText = this.add.text(width - 16, 16, 'Lives: 3', {
      fontSize: '24px',
      fill: '#fff'
    });
    this.livesText.setOrigin(1, 0);
    this.livesText.setScrollFactor(0);
  }

  updateScore(points: number) {
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  updateLives(lives: number) {
    this.lives = lives;
    this.livesText.setText(`Lives: ${this.lives}`);
  }
}