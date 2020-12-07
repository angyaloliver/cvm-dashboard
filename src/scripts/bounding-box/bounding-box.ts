import { vec2 } from "gl-matrix";
import { Vec2Extrapolator } from "../helper/vec2-extrapolator";
import { exponentialDecay } from "../helper/exponential-decay";

// x=0,y=0 is the middle of screen
// -1=<y<=1; y=1 is the top of screen;
// x=1,y=1 is the same distance on screen from axes x=0 and y=0
// y represents the bottom of the bounding box
// all three in camera view space
export class BoundingBox {
  public timeSinceLastMerge = 0;
  private velocity = vec2.create();
  private extrapolator: Vec2Extrapolator;

  constructor(public bottom: vec2, public height: number) {
    this.extrapolator = new Vec2Extrapolator(bottom);
  }

  public get centerInUICoordinates(): vec2 {
    const bottomUI: vec2 = [this.bottom.x / 2 + 0.5, this.bottom.y / 2 + 0.5];

    return [bottomUI.x, bottomUI.y + this.height / 2];
  }

  public distance(other: BoundingBox): number {
    return vec2.dist(this.bottom, other.bottom);
  }

  public merge(other: BoundingBox) {
    if (this.timeSinceLastMerge > 0) {
      const delta = vec2.subtract(vec2.create(), other.bottom, this.bottom);
      const currentVelocity = vec2.scale(
        delta,
        delta,
        1 / this.timeSinceLastMerge
      );

      vec2.scale(this.velocity, this.velocity, 7 / 8);
      vec2.scale(currentVelocity, currentVelocity, 1 / 8);
      vec2.add(this.velocity, this.velocity, currentVelocity);
    }

    this.extrapolator.addFrame(other.bottom, this.velocity);

    this.timeSinceLastMerge = 0;
    this.height = exponentialDecay(this.height, other.height, 4);
  }

  public update(deltaTime: number) {
    this.timeSinceLastMerge += deltaTime;
    this.bottom = this.extrapolator.getValue(deltaTime);
  }
}
