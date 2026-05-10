import { MapSchema } from './MapSchema';
import { LayerData } from 'phaser';

export class TileCollisionSystem {
  private scene: Phaser.Scene;
  private tilemap: Phaser.Tilemaps.Tilemap | null = null;
  private collisionLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private chunkLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Set the tilemap for collision detection
   */
  public setTilemap(tilemap: Phaser.Tilemaps.Tilemap): void {
    this.tilemap = tilemap;
    // Extract all layers that are set to collide
    this.collisionLayers = this.tilemap.layers.filter(layer => 
      layer.properties && layer.properties.collides === true
    ).map(layer => layer);
  }

  /**
   * Add a chunk layer to the collision system
   */
  public addChunkLayer(layer: Phaser.Tilemaps.TilemapLayer): void {
    // We assume the chunk layer is set to collide by default, or we can check a property
    if (layer.properties && layer.properties.collides !== false) {
      this.chunkLayers.push(layer);
    }
  }

  /**
   * Remove a chunk layer from the collision system
   */
  public removeChunkLayer(layer: Phaser.Tilemaps.TilemapLayer): void {
    const index = this.chunkLayers.indexOf(layer);
    if (index > -1) {
      this.chunkLayers.splice(index, 1);
    }
    layer.destroy();
  }

  /**
   * Check if a point collides with any tile in the collision layers
   */
  public collidesAtWorldPosition(x: number, y: number): boolean {
    if (!this.tilemap) return false;

    // Convert world coordinates to tile coordinates
    const tileX = this.tilemap.worldToTileX(x);
    const tileY = this.tilemap.worldToTileY(y);

    // Check collision layers
    for (const layer of this.collisionLayers) {
      const tile = layer.getTileAt(tileX, tileY);
      if (tile && tile.collides) {
        return true;
      }
    }

    // Check chunk layers
    for (const layer of this.chunkLayers) {
      const tile = layer.getTileAt(tileX, tileY);
      if (tile && tile.collides) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get the tile at a world position
   */
  public getTileAtWorldPosition(x: number, y: number): any {
    if (!this.tilemap) return null;

    const tileX = this.tilemap.worldToTileX(x);
    const tileY = this.tilemap.worldToTileY(y);

    // Check collision layers
    for (const layer of this.collisionLayers) {
      const tile = layer.getTileAt(tileX, tileY);
      if (tile) {
        return tile;
      }
    }

    // Check chunk layers
    for (const layer of this.chunkLayers) {
      const tile = layer.getTileAt(tileX, tileY);
      if (tile) {
        return tile;
      }
    }

    return null;
  }

  /**
   * Get all tiles that overlap with a rectangle (for broadphase)
   */
  public getTilesWithin(worldX: number, worldY: number, worldWidth: number, worldHeight: number): any[] {
    if (!this.tilemap) return [];

    const tileX = this.tilemap.worldToTileX(worldX);
    const tileY = this.tilemap.worldToTileY(worldY);
    const tileWidth = this.tilemap.worldToTileWidth(worldWidth);
    const tileHeight = this.tilemap.worldToTileHeight(worldHeight);

    const tiles: any[] = [];

    // Check collision layers
    for (const layer of this.collisionLayers) {
      const layerTiles = layer.getTilesWithin(tileX, tileY, tileWidth, tileHeight);
      tiles.push(...layerTiles);
    }

    // Check chunk layers
    for (const layer of this.chunkLayers) {
      const layerTiles = layer.getTilesWithin(tileX, tileY, tileWidth, tileHeight);
      tiles.push(...layerTiles);
    }

    return tiles;
  }

  /**
   * Set a tile's collision property
   */
  public setTileCollision(tileIndex: number, collides: boolean): void {
    if (!this.tilemap) return;

    this.tilemap.layers.forEach(layer => {
      const tile = layer.getTileAt(tileIndex % layer.width, Math.floor(tileIndex / layer.width));
      if (tile) {
        tile.setCollision(collides);
      }
    });
  }

  /**
   * Clear all chunk layers (used when unloading)
   */
  public clearChunkLayers(): void {
    this.chunkLayers.forEach(layer => layer.destroy());
    this.chunkLayers = [];
  }
}