import { ReadonlyVec2, vec2 } from "gl-matrix";
import { Texture } from "../texture/texture";
import { UniversalRenderingContext } from "../universal-rendering-context";

/** @internal */
export abstract class FrameBuffer {
  public renderScale = 1;
  public enableHighDpiRendering!: boolean;

  protected size = vec2.create();

  // null means the default framebuffer
  protected frameBuffer: WebGLFramebuffer | null = null;

  constructor(protected readonly gl: UniversalRenderingContext) {}

  public bindAndClear(inputTextures: Array<Texture>) {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);

    inputTextures.forEach((t) => t.bind());

    this.gl.viewport(0, 0, this.size[0], this.size[1]);
  }

  public destroy(): void {
    this.gl.deleteFramebuffer(this.frameBuffer);
  }

  public setSize(canvasSize: ReadonlyVec2): boolean {
    const realToCssPixels =
      (this.enableHighDpiRendering ? devicePixelRatio : 1) * this.renderScale;

    const displayWidth = Math.floor(canvasSize[0] * realToCssPixels);
    const displayHeight = Math.floor(canvasSize[1] * realToCssPixels);

    const oldSize = vec2.clone(this.getSize());
    this.size = vec2.fromValues(displayWidth, displayHeight);

    return this.size[0] != oldSize[0] || this.size[1] != oldSize[1];
  }

  public getSize(): vec2 {
    return this.size;
  }
}
