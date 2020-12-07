import { ReadonlyVec2, vec2 } from "gl-matrix";
import { DefaultFrameBuffer } from "./graphics-library/frame-buffer/default-frame-buffer";
import { ParallelCompiler } from "./graphics-library/parallel-compiler";
import { FragmentShaderOnlyProgram } from "./graphics-library/program/fragment-shader-only-program";
import Program from "./graphics-library/program/program";
import {
  getUniversalRenderingContext,
  UniversalRenderingContext,
} from "./graphics-library/universal-rendering-context";
import { UI } from "./ui";

export type CvmValue = {
  center: vec2;
  value: number;
};

export class OverlayGradients {
  public static blendFactor = 0.52;
  public static alphaBlendFactor = 0.1;
  public static gradientBaseSize = 120;
  public static readonly gradientCount = 20;

  private gl: UniversalRenderingContext;
  private compiler: ParallelCompiler;
  private program: Program;
  private frameBuffer: DefaultFrameBuffer;
  private cvmValues: Array<CvmValue> = [];

  constructor(canvas: HTMLCanvasElement, private readonly ui: UI) {
    this.gl = getUniversalRenderingContext(canvas, true);
    this.program = new FragmentShaderOnlyProgram(this.gl);
    this.compiler = new ParallelCompiler(this.gl);
    this.frameBuffer = new DefaultFrameBuffer(this.gl, [1, 1]);
    this.frameBuffer.renderScale = 0.1;
    this.frameBuffer.enableHighDpiRendering = true;
    void this.initialize();
  }

  private shouldClear = false;
  public clear() {
    this.shouldClear = true;
  }

  public draw() {
    this.frameBuffer.bindAndClear([]);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.CONSTANT_COLOR, this.gl.ONE_MINUS_CONSTANT_COLOR);
    this.gl.blendColor(
      this.shouldClear ? 1 : OverlayGradients.blendFactor,
      this.shouldClear ? 1 : OverlayGradients.blendFactor,
      this.shouldClear ? 1 : OverlayGradients.blendFactor,
      this.shouldClear ? 1 : OverlayGradients.alphaBlendFactor
    );
    this.shouldClear = false;
    this.program.draw({
      cvmCenters: [
        ...this.cvmValues.map((v) => v.center),
        ...new Array(
          Math.max(0, OverlayGradients.gradientCount - this.cvmValues.length)
        ).fill(vec2.fromValues(-20000, -20000)),
      ],
      cvmValues: this.cvmValues.map((v) => v.value * 2 - 1),
      cvmMaxDistance:
        (vec2.length(this.ui.outputSize) / 1000) *
        OverlayGradients.gradientBaseSize,
      screenSize: this.ui.outputSize,
    });

    requestAnimationFrame(this.draw.bind(this));
  }

  public setSize(size: ReadonlyVec2) {
    this.frameBuffer.setSize(size);
  }

  public setValues(values: Array<CvmValue>) {
    this.cvmValues = values;
  }

  private async initialize(): Promise<void> {
    const init = this.program.initialize(
      [
        `#version 100
        precision lowp float;
        
        attribute vec4 vertexPosition;
        varying vec2 position;
        uniform vec2 screenSize;
        
        void main() {
            gl_Position = vec4(vertexPosition.xy, 0.0, 1.0);
        
            position = (
                vec3(vertexPosition.xy, 1.0) 
              * mat3(
                0.5, 0.0, 0.5,
                0.0, 0.5, 0.5,
                0.0, 0.0, 1.0
              )
            ).xy * screenSize;
        }`,
        `#version 100
        #ifdef GL_FRAGMENT_PRECISION_HIGH
          precision highp float;
        #else
          precision mediump float;
        #endif
      
        varying vec2 position;
        uniform vec2 cvmCenters[${OverlayGradients.gradientCount}];
        uniform float cvmValues[${OverlayGradients.gradientCount}];
        uniform float cvmMaxDistance;
  
        vec3 colorFromCvmValue(float value) {
          return mix(
            vec3(29.0/255.0, 189.0/255.0, 230.0/255.0),
            vec3(241.0/255.0, 81.0/255.0, 94.0/255.0),
            clamp(value, -1.0, 1.0) / 2.0 + 0.5
          );
        }
  
        void main() {
          float cvmValue = 0.0;
          float dist = 10000.0;
  
          for (int i = 0; i < ${OverlayGradients.gradientCount}; i++) {
            float centerDist = distance(cvmCenters[i], position);
            float circleDist = centerDist - cvmMaxDistance;
            cvmValue += mix(cvmValues[i], 0.0, min(1.0, centerDist / cvmMaxDistance));
            dist = min(dist, circleDist);
          }

          float q = (1.0 - dist / cvmMaxDistance) / 2.0;
  
          gl_FragColor = vec4(
            colorFromCvmValue(cvmValue),
            clamp(q * q * q, 0.0, 1.0)
          );
        }`,
      ],
      this.compiler
    );

    await this.compiler.compilePrograms();
    await init;
    this.gl.clearColor(255, 255, 255, 0);

    requestAnimationFrame(this.draw.bind(this));
  }
}
