import { Scene } from 'phaser';

// Player constants
const PLAYER_SPEED = 150;
const PLAYER_SPRINT_SPEED = 250;
const PLAYER_ACCELERATION = 800;
const PLAYER_DECELERATION = 600;
const PLAYER_JUMP_SPEED = 400;
const PLAYER_VARIABLE_JUMP_HEIGHT_MULTIPLIER = 0.5;
const PLAYER_COYOTE_TIME = 0.1; // seconds
const PLAYER_JUMP_BUFFER_TIME = 0.1; // seconds
const PLAYER_GRAVITY_SCALE = 1.2;
const PLAYER_AIR_CONTROL_FACTOR = 0.3;
const PLAYER_GROUND_FRICTION = 0.8;
const PLAYER_INVULNERABILITY_TIME = 2.0; // seconds
const PLAYER_MAX_HEALTH = 3;
const PLAYER_MAX_LIVES = 3;

export class Player {
  private scene: Scene;
  public sprite: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private shiftKey: Phaser.Input.Keyboard.Key;
  private spaceKey: Phaser.Input.Keyboard.Key;

  // Movement state
  private isOnGround: boolean = false;
  private wasOnGround: boolean = false;
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private isJumping: boolean = false;
  private variableJumpTimer: number = 0;
  private facingRight: boolean = true;
  private isSprinting: boolean = false;
  private isCrouching: boolean = false;

  // Player stats
  public health: number = PLAYER_MAX_HEALTH;
  public lives: number = PLAYER_MAX_LIVES;
  public coins: number = 0;
  public score: number = 0;
  public powerLevel: number = 0; // 0 = small, 1 = big, 2 = fire

  // State timers
  private invulnerabilityTimer: number = 0;
  private deathTimer: number = 0;

  // Animation states
  private currentAnimation: string = '';

  constructor(scene: Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = this.scene.physics.add.sprite(x, y, 'mario');
    this.initPhysics();
    this.initAnimations();
    this.initInput();
  }

  private initPhysics(): void {
    // Enable physics
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setGravityY(800 * PLAYER_GRAVITY_SCALE); // Base gravity scaled

    // Set size and offset for hitbox tuning (adjust as needed)
    this.sprite.setSize(12, 16); // Width, Height
    this.sprite.setOffset(2, 0); // X, Y offset

    // Set bounce (for stomp mechanics)
    this.sprite.setBounce(0.2);
  }

  private initAnimations(): void {
    const anims = this.scene.anims;
    
    // Idle
    anims.create({
      key: 'idle',
      frames: anims.generateFrameNumbers('mario', { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1
    });

    // Run
    anims.create({
      key: 'run',
      frames: anims.generateFrameNumbers('mario', { start: 4, end: 9 }),
      frameRate: 12,
      repeat: -1
    });

    // Sprint
    anims.create({
      key: 'sprint',
      frames: anims.generateFrameNumbers('mario', { start: 10, end: 15 }),
      frameRate: 15,
      repeat: -1
    });

    // Jump
    anims.create({
      key: 'jump',
      frames: [{ key: 'mario', frame: 16 }],
      frameRate: 1
    });

    // Fall
    anims.create({
      key: 'fall',
      frames: [{ key: 'mario', frame: 17 }],
      frameRate: 1
    });

    // Crouch
    anims.create({
      key: 'crouch',
      frames: [{ key: 'mario', frame: 18 }],
      frameRate: 1
    });

    // Skid
    anims.create({
      key: 'skid',
      frames: [{ key: 'mario', frame: 19 }],
      frameRate: 1
    });

    // Death
    anims.create({
      key: 'death',
      frames: anims.generateFrameNumbers('mario', { start: 20, end: 25 }),
      frameRate: 8,
      repeat: 0
    });
  }

  private initInput(): void {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.shiftKey = this.scene.input.keyboard.addKey('SHIFT');
    this.spaceKey = this.scene.input.keyboard.addKey('SPACE');
  }

  public create(): void {
    // Initial animation
    this.playAnimation('idle');
  }

  public update(time: number, delta: number, cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    // Update timers
    this.updateTimers(delta);
    
    // Handle input
    this.handleInput(cursors);
    
    // Update movement
    this.updateMovement(delta);
    
    // Update animations
    this.updateAnimations();
    
    // Update state (invulnerability, etc.)
    this.updateState(delta);
  }

  private updateTimers(delta: number): void {
    const deltaSec = delta / 1000;
    
    if (this.coyoteTimer > 0) {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - deltaSec);
    }
    
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - deltaSec);
    }
    
    if (this.variableJumpTimer > 0) {
      this.variableJumpTimer = Math.max(0, this.variableJumpTimer - deltaSec);
    }
    
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer = Math.max(0, this.invulnerabilityTimer - deltaSec);
      // Flash sprite when invulnerable
      if (Math.floor(this.invulnerabilityTimer * 10) % 2 === 0) {
        this.sprite.setAlpha(0.5);
      } else {
        this.sprite.setAlpha(1);
      }
    } else {
      this.sprite.setAlpha(1);
    }
  }

  private handleInput(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    // Horizontal movement
    const left = cursors.left.isDown || this.scene.input.keyboard.checkDown(this.scene.input.keyboard.addKey('A'));
    const right = cursors.right.isDown || this.scene.input.keyboard.checkDown(this.scene.input.keyboard.addKey('D'));
    
    if (left) {
      this.facingRight = false;
    } else if (right) {
      this.facingRight = true;
    }
    
    // Sprint
    this.isSprinting = this.shiftKey.isDown;
    
    // Jump input
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
        Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard.addKey('W')) ||
        Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard.addKey('UP'))) {
      this.jumpBufferTimer = PLAYER_JUMP_BUFFER_TIME;
    }
    
    // Variable jump height - release jump button to cut jump short
    if (Phaser.Input.Keyboard.JustUp(this.spaceKey) || 
        Phaser.Input.Keyboard.JustUp(this.scene.input.keyboard.addKey('W')) ||
        Phaser.Input.Keyboard.JustUp(this.scene.input.keyboard.addKey('UP'))) {
      if (this.isJumping && this.variableJumpTimer > 0) {
        this.variableJumpTimer = 0; // Cut off jump early
        // Apply downward force for variable jump height
        if (this.sprite.body.velocity.y < -PLAYER_JUMP_SPEED * PLAYER_VARIABLE_JUMP_HEIGHT_MULTIPLIER) {
          this.sprite.body.velocity.y = -PLAYER_JUMP_SPEED * PLAYER_VARIABLE_JUMP_HEIGHT_MULTIPLIER;
        }
      }
    }
    
    // Crouch
    const down = cursors.down.isDown || this.scene.input.keyboard.checkDown(this.scene.input.keyboard.addKey('S'));
    this.isCrouching = down && this.isOnGround;
  }

  private updateMovement(delta: number): void {
    const deltaSec = delta / 1000;
    const speed = this.isSprinting ? PLAYER_SPRINT_SPEED : PLAYER_SPEED;
    const acceleration = this.isOnGround ? PLAYER_ACCELERATION : PLAYER_ACCELERATION * PLAYER_AIR_CONTROL_FACTOR;
    const deceleration = this.isOnGround ? PLAYER_DECELERATION : PLAYER_ACCELERATION * PLAYER_AIR_CONTROL_FACTOR;
    
    // Apply horizontal movement
    const left = this.scene.input.keyboard.checkDown(this.scene.input.keyboard.addKey('A')) || 
                 this.cursors.left.isDown;
    const right = this.scene.input.keyboard.checkDown(this.scene.input.keyboard.addKey('D')) || 
                  this.cursors.right.isDown;
    
    if (left && !right) {
      this.sprite.setAccelerationX(-acceleration);
      this.sprite.setMaxSpeed(speed);
    } else if (right && !left) {
      this.sprite.setAccelerationX(acceleration);
      this.sprite.setMaxSpeed(speed);
    } else {
      // Deceleration when no input
      this.sprite.setAccelerationX(0);
      this.sprite.setDragX(deceleration);
      this.sprite.setMaxSpeed(speed);
    }
    
    // Handle jump
    this.handleJump();
    
    // Update ground state
    this.wasOnGround = this.isOnGround;
    this.isOnGround = this.sprite.body.touching.down || this.sprite.body.blocked.down;
    
    // Coyote time - reset when leaving ground
    if (this.wasOnGround && !this.isOnGround) {
      this.coyoteTimer = PLAYER_COYOTE_TIME;
    }
    
    // Reset coyote timer when landing
    if (!this.wasOnGround && this.isOnGround) {
      this.coyoteTimer = 0;
      this.isJumping = false;
      this.variableJumpTimer = 0;
    }
  }

  private handleJump(): void {
    // Check if we can jump (coyote time or on ground)
    const canJump = this.isOnGround || this.coyoteTimer > 0;
    
    // Check jump buffer
    if (this.jumpBufferTimer > 0 && canJump && !this.isJumping) {
      this.performJump();
      this.jumpBufferTimer = 0;
    }
    
    // Variable jump height - maintain upward velocity while button held
    if (this.isJumping && this.variableJumpTimer > 0) {
      // Maintain jump velocity for variable jump height
      if (this.sprite.body.velocity.y < -PLAYER_JUMP_SPEED * PLAYER_VARIABLE_JUMP_HEIGHT_MULTIPLIER) {
        this.sprite.body.velocity.y = -PLAYER_JUMP_SPEED * PLAYER_VARIABLE_JUMP_HEIGHT_MULTIPLIER;
      }
    }
  }

  private performJump(): void {
    this.isJumping = true;
    this.sprite.setVelocityY(-PLAYER_JUMP_SPEED);
    this.variableJumpTimer = PLAYER_VARIABLE_JUMP_HEIGHT_MULTIPLIER * 0.3; // Time for variable jump control
    // Play jump sound if available
    // this.scene.sound.play('jump');
  }

  private updateAnimations(): void {
    let animationKey = '';
    
    if (this.deathTimer > 0) {
      animationKey = 'death';
    } else if (!this.isOnGround) {
      if (this.sprite.body.velocity.y < 0) {
        animationKey = 'jump';
      } else {
        animationKey = 'fall';
      }
    } else if (this.isCrouching) {
      animationKey = 'crouch';
    } else {
      const speed = Math.abs(this.sprite.body.velocity.x);
      if (speed > 0) {
        if (this.isSprinting && speed > PLAYER_SPRINT_SPEED * 0.8) {
          animationKey = 'sprint';
        } else {
          animationKey = 'run';
        }
      } else {
        animationKey = 'idle';
      }
      
      // Skid when changing direction quickly
      if (this.wasOnGround && this.isOnGround) {
        // We could add skid detection here based on acceleration vs velocity
        // For simplicity, we'll skip for now
      }
    }
    
    this.playAnimation(animationKey);
  }

  private playAnimation(key: string): void {
    if (key === this.currentAnimation) return;
    
    this.sprite.anims.play(key, true);
    this.currentAnimation = key;
    
    // Set flip based on facing direction
    this.sprite.setFlipX(!this.facingRight);
  }

  private updateState(delta: number): void {
    // Death state
    if (this.health <= 0 && this.deathTimer === 0) {
      this.die();
    }
    
    if (this.deathTimer > 0) {
      this.deathTimer -= delta / 1000;
      if (this.deathTimer <= 0) {
        this.respawn();
      }
    }
  }

  public takeDamage(): void {
    if (this.invulnerabilityTimer > 0) return;
    
    this.health--;
    this.invulnerabilityTimer = PLAYER_INVULNERABILITY_TIME;
    
    if (this.health <= 0) {
      this.lives--;
      if (this.lives <= 0) {
        // Game over
        this.die();
      } else {
        this.health = PLAYER_MAX_HEALTH;
      }
    }
  }

  private die(): void {
    this.deathTimer = 1.0; // Death animation duration
    this.sprite.setVelocity(0, 0);
    this.sprite.setAcceleration(0);
    this.playAnimation('death');
  }

  private respawn(): void {
    // Reset position to checkpoint or start
    // For now, just reset to initial position
    this.sprite.setPosition(100, 450);
    this.health = PLAYER_MAX_HEALTH;
    this.deathTimer = 0;
    this.invulnerabilityTimer = PLAYER_INVULNERABILITY_TIME;
    this.isJumping = false;
    this.variableJumpTimer = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.playAnimation('idle');
  }

  // Power-up methods
  public collectCoin(): void {
    this.coins++;
    this.score += 200;
    // Play coin sound
    // this.scene.sound.play('coin');
  }

  public collectMushroom(): void {
    if (this.powerLevel < 1) {
      this.powerLevel = 1;
      // Grow animation/scale
      this.sprite.setScale(1.5);
      // Adjust hitbox
      this.sprite.setSize(18, 24);
      this.sprite.setOffset(0, 0);
    }
  }

  public collectFireFlower(): void {
    if (this.powerLevel < 2) {
      this.powerLevel = 2;
      // Change color scheme
      this.sprite.setTint(0xff0000);
    }
  }

  // Stomp mechanic - call when player lands on enemy
  public stompEnemy(): void {
    this.sprite.setVelocityY(-PLAYER_JUMP_SPEED * 0.7); // Bounce upward
    this.score += 100;
    // Play stomp sound
    // this.scene.sound.play('stomp');
  }

  // Getters for UI/scene
  public getPosition(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
  }

  public getHealth(): number {
    return this.health;
  }

  public getLives(): number {
    return this.lives;
  }

  public getCoins(): number {
    return this.coins;
  }

  public getScore(): number {
    return this.score;
  }

  public getPowerLevel(): number {
    return this.powerLevel;
  }

  public isInvulnerable(): boolean {
    return this.invulnerabilityTimer > 0;
  }
}