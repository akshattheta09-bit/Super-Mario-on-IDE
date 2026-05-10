import { Scene } from 'phaser';
import { Player } from '../entities/player';

export abstract class Enemy extends Scene.constructor.prototype.constructor {
  protected scene: Scene;
  public sprite: Phaser.Physics.Arcade.Sprite;
  protected playerRef: Player;
  protected speed: number = 50;
  protected direction: number = 1; // 1 for right, -1 for left
  protected isActive: boolean = true;
  protected health: number = 1;
  protected points: number = 100;
  protected turnAroundDistance: number = 50; // Distance to check for edge/wall

  constructor(scene: Scene, x: number, y: number, texture: string, player: Player) {
    // We cannot directly call super because Enemy is not a Scene
    // Instead, we'll create the sprite manually
    this.scene = scene;
    this.playerRef = player;
    this.sprite = this.scene.physics.add.sprite(x, y, texture);
    this.initEnemy();
  }

  protected initEnemy(): void {
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setSize(12, 16);
    this.sprite.setOffset(2, 0);
    this.sprite.setBounce(0.2);
  }

  public abstract update(time: number, delta: number): void;

  public takeDamage(): void {
    this.health--;
    if (this.health <= 0) {
      this.die();
    }
  }

  protected die(): void {
    this.isActive = false;
    this.sprite.setVelocity(0, 0);
    this.sprite.setAcceleration(0);
    // Play death animation if exists
    // Add points to player
    this.playerRef.score += this.points;
    // Remove after a short delay
    this.scene.time.delayedCall(300, () => {
      this.sprite.destroy();
    });
  }

  // Helper method to check for ground ahead
  protected isGroundAhead(): boolean {
    const aheadX = this.sprite.x + (this.direction * this.turnAroundDistance);
    const aheadY = this.sprite.y + 20; // Slightly below to check ground
    
    // Use raycast or overlap check
    // For simplicity, we'll check overlap with ground layer
    // This requires access to the level's ground layer, which we don't have here
    // We'll implement a different approach: check if there's no ground ahead by using a ray down from ahead position
    
    // Since we don't have level reference, we'll rely on collision with world bounds or custom properties
    // For now, we'll use a simple method: reverse when hitting a wall (handled by collision)
    return true; // Placeholder
  }

  // Method to reverse direction
  public reverseDirection(): void {
    this.direction *= -1;
    this.sprite.setFlipX(this.direction === -1);
  }

  // Getters
  public isActiveEnemy(): boolean {
    return this.isActive;
  }

  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }
}