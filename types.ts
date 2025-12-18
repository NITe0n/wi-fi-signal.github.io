export interface WifiPoint {
  id: number;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  dbm: string; // Stored as string to allow empty state during typing
}

export interface ImageState {
  src: string;
  width: number;
  height: number;
  file: File | null;
}
