export const WORLD_W = 22
export const WORLD_H = 14

export function worldX(canvasW: number, x: number): number {
  return (x / canvasW - 0.5) * WORLD_W
}

export function worldY(canvasH: number, y: number): number {
  return -(y / canvasH - 0.5) * WORLD_H
}
