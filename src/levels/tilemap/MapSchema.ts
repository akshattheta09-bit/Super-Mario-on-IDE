export interface LevelData {
  name: string;
  width: number; // in tiles
  height: number; // in tiles
  tileWidth: number;
  tileHeight: number;
  layers: LevelLayer[];
  tilesets: Tileset[];
  objectGroups: ObjectGroup[];
}

export interface LevelLayer {
  id: number;
  name: string;
  type: 'tilelayer' | 'objectgroup' | 'imagelayer';
  data?: number[]; // For tilelayers: array of tile IDs (0 for empty)
  objects?: LevelObject[];
  opacity: number;
  visible: boolean;
  offsetX?: number;
  offsetY?: number;
  parallaxFactor?: number; // For parallax backgrounds
}

export interface Tileset {
  firstgid: number;
  name: string;
  tileWidth: number;
  tileHeight: number;
  columns: number;
  image: string;
  imageWidth: number;
  imageHeight: number;
  tileCount: number;
}

export interface LevelObject {
  id: number;
  name: string;
  type: string; // e.g., 'player', 'enemy', 'coin', 'powerup', 'pipe', 'flag'
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  gid?: number; // Global tile ID if the object is a tile
  properties?: Record<string, any>;
}

export interface ObjectGroup {
  id: number;
  name: string;
  objects: LevelObject[];
}