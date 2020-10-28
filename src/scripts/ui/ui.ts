import { OverallStatistics } from "./overall-statistics";
import { Chart } from "./chart";
import { handleFullScreen } from "./handle-full-screen";

export class UI {
  private outputVideo = document.querySelector(
    "#output-video"
  ) as HTMLVideoElement;
  private overallStats: OverallStatistics;
  private chart: Chart;

  constructor() {
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

  public giveVideoStream(stream: MediaStream): void {
    this.outputVideo.muted = true;
    this.outputVideo.srcObject = stream;
    void this.outputVideo.play();
  }
}
