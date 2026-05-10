import { Scene } from 'phaser';
import { LevelData, MapSchema } from './MapSchema';
import { TileCollisionSystem } from './TileCollisionSystem';
import { ProceduralGenerator } from './ProceduralGenerator';

export class LevelManager {
  private scene: Scene;
  private currentLevelData: LevelData | null = null;
  private tileCollisionSystem: TileCollisionSystem | null = null;
  private proceduralGenerator: ProceduralGenerator;
  private chunkSize: number = 16; // tiles per chunk
  private viewDistance: number = 3; // chunks to load around player
  private loadedChunks: Map<string, Phaser.Tilemaps.TilemapLayer> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
    this.proceduralGenerator = new ProceduralGenerator();
  }

  /**
   * Load a level from JSON data
   */
  public loadLevel(levelData: LevelData): void {
    this.currentLevelData = levelData;
    this.unloadAllChunks();
    
    // Create tilemap from JSON
    const tilemap = this.scene.make.tilemap({ data: levelData, tileWidth: levelData.tileWidth, tileHeight: levelData.tileHeight });
    
    // Add tilesets
    levelData.tilesets.forEach(tileset => {
      tilemap.addTilesetImage(tileset.name, tileset.name, tileset.tileWidth, tileset.tileHeight, tileset.margin, tileset.spacing, tileset.firstgid);
    });
    
    // Create layers
    levelData.layers.forEach(layer => {
      if (layer.type === 'tilelayer') {
        const tilemapLayer = tilemap.createLayer(layer.name, tilemap.tilesets, 0, 0);
        if (layer.visible === false) {
          tilemapLayer.setVisible(false);
        }
        // Set parallax factor if specified
        if (layer.parallaxFactor !== undefined) {
          // We'll handle parallax in the update method or via a separate system
          // For now, we store it in the layer's custom properties
          tilemapLayer.setParallax(layer.parallaxFactor, layer.parallaxFactor);
        }
        // Store the layer for collision and rendering
        // We'll manage chunks manually, so we might not create the full layer at once
        // Instead, we'll create chunks as needed
        // For simplicity in this example, we'll create the full layer and then use chunking for visibility
        // But for infinite scrolling, we need to load/unload chunks.
        // We'll implement chunking by splitting the layer into chunks and managing their visibility.
        // However, Phaser tilemaps don't natively support chunking in this way.
        // We'll have to create a custom solution or use a different approach.
        // Given the complexity, we'll implement a simple chunking system by creating multiple tilemap layers for each chunk.
        // But note: this is a simplified version.
        // For a production game, we might want to use a different approach or extend Phaser.
        // We'll leave the full implementation of infinite scrolling as an exercise and focus on the structure.
        // We'll create the full layer and then use a camera cutoff for rendering (which Phaser does by default) and then unload chunks that are far away by destroying and recreating them.
        // This is not efficient for very large levels, but it's a start.
        // We'll implement a basic chunk unloading based on camera position.
      }
    });
    
    // Initialize collision system
    this.tileCollisionSystem = new TileCollisionSystem(tilemap);
  }

  /**
   * Load a level procedurally
   */
  public loadProceduralLevel(options: { width?: number, height?: number, theme?: string } = {}): void {
    const levelData = this.proceduralGenerator.generate(options);
    this.loadLevel(levelData);
  }

  /**
   * Update level based on camera position (for chunk loading/unloading)
   */
  public update(): void {
    if (!this.currentLevelData || !this.tileCollisionSystem) return;
    
    const camera = this.scene.cameras.main;
    const worldPoint = camera.getWorldPoint(new Phaser.Math.Vector2(camera.scrollX + camera.width / 2, camera.scrollY + camera.height / 2));
    
    // Convert world coordinates to tile coordinates
    const tileX = Math.floor(worldPoint.x / this.currentLevelData.tileWidth);
    const tileY = Math.floor(worldPoint.y / this.currentLevelData.tileHeight);
    
    // Calculate chunk coordinates
    const chunkX = Math.floor(tileX / this.chunkSize);
    const chunkY = Math.floor(tileY / this.chunkSize);
    
    // Load chunks in view distance
    for (let cx = chunkX - this.viewDistance; cx <= chunkX + this.viewDistance; cx++) {
      for (let cy = chunkY - this.viewDistance; cy <= chunkY + this.viewDistance; cy++) {
        this.loadChunk(cx, cy);
      }
    }
    
    // Unload chunks outside view distance (with a buffer to prevent thrashing)
    const unloadDistance = this.viewDistance + 2;
    this.loadedChunks.forEach((layer, key) => {
      const [chunkXStr, chunkYStr] = key.split(',');
      const chunkX = parseInt(chunkXStr, 10);
      const chunkY = parseInt(chunkYStr, 10);
      if (Math.abs(chunkX - chunkX) > unloadDistance || Math.abs(chunkY - chunkY) > unloadDistance) {
        this.unloadChunk(chunkX, chunkY);
      }
    });
  }

  /**
   * Load a specific chunk
   */
  private loadChunk(chunkX: number, chunkY: number): void {
    const key = `${chunkX},${chunkY}`;
    if (this.loadedChunks.has(key)) return;
    
    if (!this.currentLevelData) return;
    
    // Calculate the tile range for this chunk
    const startX = chunkX * this.chunkSize;
    const startY = chunkY * this.chunkSize;
    const endX = startX + this.chunkSize;
    const endY = startY + this.chunkSize;
    
    // We need to extract the tile data for this chunk from the level data
    // This assumes we have the full level data in memory
    // For truly infinite procedural generation, we would generate the chunk on the fly
    // Here, we'll assume we have the full level data and we're just showing/hiding chunks
    
    // Create a tilemap layer for this chunk
    // Note: This is a simplified approach. In reality, we would create a tilemap for the chunk only.
    // We'll create a blank tilemap and then populate it with the chunk's tiles.
    const tilemap = this.scene.make.tilemap({ 
      tileWidth: this.currentLevelData.tileWidth, 
      tileHeight: this.currentLevelData.tileHeight,
      width: this.chunkSize,
      height: this.chunkSize 
    });
    
    // Add tilesets (same as the main tilemap)
    this.currentLevelData.tilesets.forEach(tileset => {
      tilemap.addTilesetImage(tileset.name, tileset.name, tileset.tileWidth, tileset.tileHeight, tileset.margin, tileset.spacing, tileset.firstgid);
    });
    
    // Create a layer for this chunk
    const layerName = `chunk_${chunkX}_${chunkY}`;
    const chunkLayer = tilemap.createBlankLayer(layerName, this.currentLevelData.tilesets[0].name, this.chunkSize * this.currentLevelData.tileWidth, this.chunkSize * this.currentLevelData.tileHeight);
    
    // Fill the chunk with tiles from the level data
    // We need to map the chunk's tile coordinates to the level's tile coordinates
    for (let ty = 0; ty < this.chunkSize; ty++) {
      for (let tx = 0; tx < this.chunkSize; tx++) {
        const levelTx = startX + tx;
        const levelTy = startY + ty;
        
        // Check if the level coordinates are within the level data
        if (levelTx >= 0 && levelTx < this.currentLevelData.width && levelTy >= 0 && levelTy < this.currentLevelData.height) {
          // Find the layer that contains this tile (we assume the first tilelayer for simplicity)
          // In a real game, we would have multiple layers and we'd need to check each one.
          const tilelayer = this.currentLevelData.layers.find(l => l.type === 'tilelayer' && l.data);
          if (tilelayer && tilelayer.data) {
            const tileIndex = levelTy * this.currentLevelData.width + levelTx;
            const tileId = tilelayer.data[tileIndex];
            if (tileId > 0) {
              // Put the tile at (tx, ty) in the chunk layer
              chunkLayer.putTileAt(tileId, tx, ty);
            }
          }
        }
      }
    }
    
    // Set the chunk's world position
    chunkLayer.setX(startX * this.currentLevelData.tileWidth);
    chunkLayer.setY(startY * this.currentLevelData.tileHeight);
    
    // Add to collision system
    if (this.tileCollisionSystem) {
      this.tileCollisionSystem.addChunkLayer(chunkLayer);
    }
    
    this.loadedChunks.set(key, chunkLayer);
  }

  /**
   * Unload a specific chunk
   */
  private unloadChunk(chunkX: number, chunkY: number): void {
    const key = `${chunkX},${chunkY}`;
    const layer = this.loadedChunks.get(key);
    if (layer) {
      // Remove from collision system
      if (this.tileCollisionSystem) {
        this.tileCollisionSystem.removeChunkLayer(layer);
      }
      // Destroy the layer
      layer.destroy();
      this.loadedChunks.delete(key);
    }
  }

  /**
   * Unload all chunks
   */
  private unloadAllChunks(): void {
    this.loadedChunks.forEach((layer, key) => {
      const [chunkXStr, chunkYStr] = key.split(',');
      const chunkX = parseInt(chunkXStr, 10);
      const chunkY = parseInt(chunkYStr, 10);
      this.unloadChunk(chunkX, chunkY);
    });
    this.loadedChunks.clear();
  }

  /**
   * Get tile properties at world position
   */
  public getTileAtWorldPosition(x: number, y: number): any {
    if (!this.tileCollisionSystem) return null;
    return this.tileCollisionSystem.getTileAtWorldPosition(x, y);
  }

  /**
   * Check if there is a collision at world position
   */
  public collidesAtWorldPosition(x: number, y: number): boolean {
    if (!this.tileCollisionSystem) return false;
    return this.tileCollisionSystem.collidesAtWorldPosition(x, y);
  }

  // Getters
  public getCurrentLevelData(): LevelData | null {
    return this.currentLevelData;
  }
}