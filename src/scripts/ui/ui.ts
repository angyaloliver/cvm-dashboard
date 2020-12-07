import { OverallStatistics } from "./overall-statistics";
import { Chart } from "./chart";
import { handleFullScreen } from "./handle-full-screen";
import { CvmValue, OverlayGradients } from "./overlay-gradients";
import { vec2 } from "gl-matrix";

export class UI {
  private outputVideo = document.querySelector(
    "#output-video"
  ) as HTMLVideoElement;
  private overallStats: OverallStatistics;
  private chart: Chart;
  private overlay: OverlayGradients;
  private canvas = document.querySelector("#overlay") as HTMLCanvasElement;

  constructor(onInputStreamEnded: () => unknown = () => null) {
    const chartElement = document.querySelector("#chart") as HTMLElement;
    const napiAtlagElem = document.querySelector("#napi-atlag") as HTMLElement;
    const jelenlegiElem = document.querySelector("#jelenlegi") as HTMLElement;
    const tendenciaElem = document.querySelector("#tendencia") as HTMLElement;
    const minimize = document.querySelector("#minimize") as HTMLElement;
    const maximize = document.querySelector("#maximize") as HTMLElement;

    handleFullScreen(minimize, maximize, document.body);

    this.overallStats = new OverallStatistics(
      napiAtlagElem,
      jelenlegiElem,
      tendenciaElem
    );

    this.chart = new Chart(chartElement);
    this.overlay = new OverlayGradients(this.canvas, this);
    this.outputVideo.addEventListener("ended", () => {
      this._hasActiveStream = false;
      onInputStreamEnded();
    });
  }

  public addTimeFrame(time: Date, value: number): void {
    this.chart.addTimeFrame(time, value);
  }

  public hideLoadingIcon(): void {
    const parent = document.querySelector(".video-container") as HTMLElement;
    parent.classList.add("loaded");
  }

  private _hasActiveStream = false;
  public get hasActiveStream(): boolean {
    return this._hasActiveStream;
  }

  public updateOverallStatistics(values: {
    napiAtlag?: number;
    jelenlegi?: number;
    tendencia?: number;
  }): void {
    this.overallStats.updateOverallStatistics(values);
  }

  public setCvmValuesForGradient(values: Array<CvmValue>) {
    this.overlay.setValues(values);
  }

  public getChartCvmValues() {
    return this.chart.getCvmValues();
  }

  public async giveVideoStream(stream: MediaStream): Promise<void> {
    this.outputVideo.muted = true;
    this.outputVideo.srcObject = stream;

    await this.outputVideo.play();
    this.setSize();

    this._hasActiveStream = true;
  }

  public clearGradients() {
    this.setCvmValuesForGradient([]);
    this.overlay.clear();
  }

  private setSize() {
    const video = document.querySelector("video") as HTMLVideoElement;
    this.size = [video.videoWidth, video.videoHeight];
  }

  private size = vec2.create();
  public get outputSize(): vec2 {
    return vec2.clone(this.size);
  }
}
