import { vec2 } from "gl-matrix";

// x=0,y=0 is the middle of screen
// -1=<y<=1; y=1 is the top of screen;
// x=1,y=1 is the same distance on screen from axes x=0 and y=0
// y represents the bottom of the bounding box
// all three in camera view space
export class BoundingBox {
  constructor(
    public readonly bottom: vec2,
    public readonly height: number,
    public timeToLive: number = 10
  ) {}

  public get centerInUICoordinates(): vec2 {
    const bottomUI: vec2 = [this.bottom.x / 2 + 0.5, this.bottom.y / 2 + 0.5];

    return [bottomUI.x, bottomUI.y + this.height / 2];
  }

  isCloseToEdge(): boolean {
    const threshold = 0.1;

    return (
      Math.abs(this.bottom.x) + threshold > 1 ||
      Math.abs(this.bottom.y) + threshold > 1
    );
  }

  isCloseTo(otherBox: BoundingBox) {
    const threshold = 0.3;
    const distance = vec2.dist(this.bottom, otherBox.bottom);

    return distance < threshold;
  }
}
