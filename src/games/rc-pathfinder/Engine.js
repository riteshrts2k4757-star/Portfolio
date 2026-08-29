export class Engine {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.lastTime = 0;
    this.running = false;
    this.animationFrameId = null;
    this.loop = this.loop.bind(this);
  }

  start() {
    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  }

  stop() {
    this.running = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  loop(timestamp) {
    if (!this.running) return;

    const deltaTime = (timestamp - this.lastTime) / 1000; // in seconds
    this.lastTime = timestamp;

    // Cap deltaTime to prevent huge jumps if tab was inactive
    const cappedDelta = Math.min(deltaTime, 0.1);

    this.updateFn(cappedDelta);
    this.renderFn();

    this.animationFrameId = requestAnimationFrame(this.loop);
  }
}
