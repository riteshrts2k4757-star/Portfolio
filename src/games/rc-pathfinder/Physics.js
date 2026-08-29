// ─────────────────────────────────────────────────────────────
//  Physics.js – RC car physics simulation
// ─────────────────────────────────────────────────────────────

export class Physics {
  /**
   * @param {number} x - initial world X (pixels)
   * @param {number} y - initial world Y (pixels)
   */
  constructor(x, y) {
    this.x        = x;
    this.y        = y;
    this.rotation = -Math.PI / 2; // facing up at spawn

    // Scalar speed along heading vector (px/s)
    this.speed = 0;

    // ── Tuning constants ──────────────────────────────────
    this.maxSpeed    = 280;  // px/s forward max (increased from 200)
    this.maxReverse  = 120;  // px/s reverse max (increased from 80)
    this.accel       = 400;  // px/s² throttle acceleration (increased from 280)
    this.friction    = 160;  // px/s² natural deceleration
    this.turnSpeed   = 2.6;  // rad/s steering rate at full speed (increased slightly)

    // Collision bounding box (half-dimensions match car art)
    this.halfW = 17; // front-back half (pixels)
    this.halfH = 11; // side-to-side half (pixels)
  }

  /**
   * Teleport car to a new position and heading (for reset / new map).
   */
  reset(x, y, rotation = -Math.PI / 2) {
    this.x        = x;
    this.y        = y;
    this.rotation = rotation;
    this.speed    = 0;
  }

  /**
   * Advance physics by one frame.
   *
   * @param {number}   dt          - delta time in seconds
   * @param {number}   throttle    - -1 (reverse) → 0 → +1 (forward)
   * @param {number}   steering    - -1 (left)    → 0 → +1 (right)
   * @param {Function} collisionFn - (x,y,rot,hw,hh) → boolean
   * @param {Function} onCollision - called when collision occurs
   */
  update(dt, throttle, steering, collisionFn, onCollision) {
    // ── Throttle / friction ───────────────────────────────
    const targetSpeed = throttle > 0 ? throttle * this.maxSpeed : throttle * this.maxReverse;

    if (throttle !== 0) {
      if (this.speed < targetSpeed) {
        this.speed = Math.min(targetSpeed, this.speed + this.accel * dt);
      } else if (this.speed > targetSpeed) {
        this.speed = Math.max(targetSpeed, this.speed - this.accel * dt);
      }
    } else {
      const dec = this.friction * dt;
      if (Math.abs(this.speed) <= dec) {
        this.speed = 0;
      } else {
        this.speed -= Math.sign(this.speed) * dec;
      }
    }

    // Clamp to max speeds
    this.speed = Math.max(-this.maxReverse, Math.min(this.maxSpeed, this.speed));

    // ── Steering (instant turn independent of speed) ──
    if (steering !== 0) {
      const prevRot = this.rotation;
      this.rotation += steering * this.turnSpeed * dt;
      
      // Prevent turning into walls
      if (collisionFn && collisionFn(this.x, this.y, this.rotation, this.halfW, this.halfH)) {
        this.rotation = prevRot;
      }
    }

    // ── Position update with collision ───────────────────
    const nx = this.x + Math.cos(this.rotation) * this.speed * dt;
    const ny = this.y + Math.sin(this.rotation) * this.speed * dt;

    if (collisionFn && collisionFn(nx, ny, this.rotation, this.halfW, this.halfH)) {
      // Bounce: reverse speed at reduced magnitude
      this.speed *= -0.30;
      
      // Stop completely if the bounce speed is very small to prevent jitter trapping
      if (Math.abs(this.speed) < 5) {
        this.speed = 0;
      }
      
      if (onCollision) onCollision();
    } else {
      this.x = nx;
      this.y = ny;
    }
  }

  /**
   * Speed in "metres per second" for HUD display.
   * Convention: 40 px == 1 m.
   */
  get speedMs() {
    return (Math.abs(this.speed) / 40).toFixed(1);
  }
}
