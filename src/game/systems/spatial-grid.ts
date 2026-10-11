import type { Vec } from "../core/primitives";
export class SpatialGrid<T extends Vec & { id: number }> {
  private cells = new Map<string, T[]>();
  constructor(private cellSize = 128) {}
  clear() {
    this.cells.clear();
  }
  insert(value: T) {
    const key = `${Math.floor(value.x / this.cellSize)}:${Math.floor(value.y / this.cellSize)}`;
    const cell = this.cells.get(key);
    if (cell) cell.push(value);
    else this.cells.set(key, [value]);
  }
  rebuild(values: readonly T[]) {
    this.clear();
    for (const v of values) this.insert(v);
  }
  query(center: Vec, radius: number): T[] {
    const result: T[] = [];
    for (
      let y = Math.floor((center.y - radius) / this.cellSize);
      y <= Math.floor((center.y + radius) / this.cellSize);
      y++
    )
      for (
        let x = Math.floor((center.x - radius) / this.cellSize);
        x <= Math.floor((center.x + radius) / this.cellSize);
        x++
      )
        for (const value of this.cells.get(`${x}:${y}`) ?? [])
          if (
            (value.x - center.x) ** 2 + (value.y - center.y) ** 2 <=
            radius * radius
          )
            result.push(value);
    return result.sort(
      (a, b) =>
        (a.x - center.x) ** 2 +
          (a.y - center.y) ** 2 -
          ((b.x - center.x) ** 2 + (b.y - center.y) ** 2) || a.id - b.id,
    );
  }
}
