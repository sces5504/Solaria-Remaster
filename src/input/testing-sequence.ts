const sequence = "WWSSADADBA".split("").map((letter) => `Key${letter}`);
/** Consecutive fresh key presses only. A wrong key cancels the entire attempt. */
export class TestingSequence {
  private index = 0;
  reset() {
    this.index = 0;
  }
  press(code: string) {
    if (code !== sequence[this.index]) {
      this.reset();
      return false;
    }
    this.index++;
    if (this.index !== sequence.length) return false;
    this.reset();
    return true;
  }
}
