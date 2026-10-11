// Transient scheduler; no queue or target reference enters a checkpoint.
export class ContactQueue<T> {
  private heap: T[] = [];
  constructor(private compare: (a: T, b: T) => number) {}
  get size() {
    return this.heap.length;
  }
  push(value: T) {
    let i = this.heap.length;
    this.heap.push(value);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(this.heap[parent], value) <= 0) break;
      this.heap[i] = this.heap[parent];
      i = parent;
    }
    this.heap[i] = value;
  }
  pop(): T | undefined {
    const first = this.heap[0],
      last = this.heap.pop();
    if (!this.heap.length) return first;
    let i = 0;
    while (i * 2 + 1 < this.heap.length) {
      let child = i * 2 + 1;
      if (
        child + 1 < this.heap.length &&
        this.compare(this.heap[child + 1], this.heap[child]) < 0
      )
        child++;
      if (this.compare(last!, this.heap[child]) <= 0) break;
      this.heap[i] = this.heap[child];
      i = child;
    }
    this.heap[i] = last!;
    return first;
  }
}
