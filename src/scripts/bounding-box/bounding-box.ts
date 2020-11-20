import { vec2 } from 'gl-matrix';

export class BoundingBox {
  constructor(public center: vec2, private readonly height: number) {}

  // x=0,y=0 is the middle of screen
  // -1=<y<=1; y=1 is the top of screen;
  // x=1,y=1 is the same distance on screen from axes x=0 and y=0
  // y represents the bottom of the bounding box
  // all three in camera view space
  public getHeight(): number {
    return this.height;
  }
}
