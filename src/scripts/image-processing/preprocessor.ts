declare const cv: any;

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class Preprocessor {
  private readonly scaling = 1 / 8;

  private resized: any;
  private resizedSize: any;
  private mask: any;
  private backgroundSubtractor: any;
  private contours = new cv.MatVector();
  private hierarchy = new cv.Mat();
  private closingElement = cv.Mat.ones(10, 10, cv.CV_8U);
  public readonly ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private isActive = false;

  constructor(private sourceCanvasId: string, private video: HTMLVideoElement) {
    this.canvas = document.getElementById(sourceCanvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    requestAnimationFrame(this.preprocess.bind(this));
  }

  public reset() {
    const width = this.video.videoWidth;
    const height = this.video.videoHeight;

    this.canvas.width = width;
    this.canvas.height = height;

    const scaledWidth = Math.floor(width * this.scaling);
    const scaledHeight = Math.floor(height * this.scaling);

    this.mask?.delete();
    this.backgroundSubtractor?.delete();
    this.resized?.delete();

    this.mask = new cv.Mat(scaledWidth, scaledHeight, cv.CV_8UC1);
    this.backgroundSubtractor = new cv.BackgroundSubtractorMOG2(100, 16, true);
    this.resized = new cv.Mat(scaledWidth, scaledHeight, cv.CV_8UC3);
    this.resizedSize = new cv.Size(scaledWidth, scaledHeight);

    this.isActive = true;
  }

  public get height(): number {
    return this.canvas.height;
  }

  public get width(): number {
    return this.canvas.width;
  }

  public preprocess() {
    if (
      this.isActive &&
      this.video.videoWidth !== 0 &&
      this.video.videoHeight !== 0
    ) {
      this.ctx.drawImage(
        this.video,
        0,
        0,
        this.video.videoWidth,
        this.video.videoHeight
      );

      this.calculateMovingBoxes().forEach((b) => {
        this.ctx.strokeStyle = "#FFFF00";
        this.ctx.lineWidth = 8;
        this.ctx.strokeRect(b.x, b.y, b.width, b.height);
      });
    }

    requestAnimationFrame(this.preprocess.bind(this));
  }

  public calculateMovingBoxes(): Array<BoundingBox> {
    const src = cv.imread(this.sourceCanvasId);
    cv.resize(src, this.resized, this.resizedSize, 0, 0, cv.INTER_NEAREST);
    this.backgroundSubtractor.apply(this.resized, this.mask);

    cv.threshold(this.mask, this.mask, 255 / 2, 255, cv.THRESH_BINARY);
    cv.medianBlur(this.mask, this.mask, 3);
    cv.morphologyEx(this.mask, this.mask, cv.MORPH_CLOSE, this.closingElement);

    cv.findContours(
      this.mask,
      this.contours,
      this.hierarchy,
      cv.RETR_CCOMP,
      cv.CHAIN_APPROX_SIMPLE
    );

    const result: Array<BoundingBox> = [];
    for (let i = 0; i < this.contours.size(); ++i) {
      const contour = this.contours.get(i);
      if (cv.contourArea(contour, false) > 10) {
        let { x, y, width, height }: BoundingBox = cv.boundingRect(contour);
        const dilate = 50;

        x = x / this.scaling - dilate;
        y = y / this.scaling - dilate;
        width = width / this.scaling + 2 * dilate;
        height = height / this.scaling + 2 * dilate;

        result.push({ x, y, width, height });
      }
    }

    src.delete();
    return result;
  }
}
