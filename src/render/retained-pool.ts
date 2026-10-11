// Only retired objects are bounded; active visuals never share a budget.
export class RetainedPool<T> {
  private free: T[] = [];
  created = 0;
  constructor(
    private create: () => T,
    private reset: (value: T) => void,
    private dispose: (value: T) => void,
    private keep: number,
  ) {}
  get retained() {
    return this.free.length;
  }
  take() {
    const value = this.free.pop();
    if (value) return value;
    this.created++;
    return this.create();
  }
  release(value: T) {
    this.reset(value);
    if (this.free.length < this.keep) this.free.push(value);
    else this.dispose(value);
  }
  clear() {
    for (const value of this.free) this.dispose(value);
    this.free = [];
  }
}
