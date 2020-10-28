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

  constructor(onInputStreamEnded: () => unknown = () => null) {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    const chartElement = document.querySelector("#chart") as HTMLElement;
    const napiAtlagElem = document.querySelector("#napi-atlag") as HTMLElement;
    const jelenlegiElem = document.querySelector("#jelenlegi") as HTMLElement;
    const tendenciaElem = document.querySelector("#tendencia") as HTMLElement;
    const minimize = document.querySelector("#minimize") as HTMLElement;
    const maximize = document.querySelector("#maximize") as HTMLElement;
    const videoContainer = document.querySelector(
      ".video-container"
    ) as HTMLElement;

    handleFullScreen(minimize, maximize, videoContainer);

    this.overallStats = new OverallStatistics(
      napiAtlagElem,
      jelenlegiElem,
      tendenciaElem
    );

    this.chart = new Chart(chartElement);
    this.overlay = new OverlayGradients(canvas);
    this.outputVideo.addEventListener("suspend", onInputStreamEnded);
  }

  public addTimeFrame(time: Date, value: number): void {
    this.chart.addTimeFrame(time, value);
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

  public async giveVideoStream(stream: MediaStream): Promise<void> {
    this.outputVideo.muted = true;
    this.outputVideo.srcObject = stream;

    this.setSize(stream);
    this.outputVideo.onprogress = () => this.setSize(stream);

    await this.outputVideo.play();
  }

  private setSize(stream: MediaStream) {
    const trackSettings = stream.getVideoTracks()[0].getSettings();
    this.size = [trackSettings.width!, trackSettings.height!];
    this.overlay.setSize(this.outputSize);
  }

  private size = vec2.create();
  public get outputSize(): vec2 {
    return vec2.clone(this.size);
  }
}
