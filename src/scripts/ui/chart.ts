import { chartOptions } from "./chart-options";
import ApexCharts from "apexcharts";

/**
 * @internal
 */
export class Chart {
  private chart: ApexCharts;
  private values: Array<[number, number]> = [];

  constructor(parent: HTMLElement, private maxValueCount = 120) {
    this.chart = new ApexCharts(parent, chartOptions);
    void this.chart.render();
  }

  public addTimeFrame(time: Date, value: number): void {
    this.values.push([time.getTime(), value]);
    this.values = this.values.slice(-this.maxValueCount);
    this.chart.updateSeries([
      {
        name: "CVM rate",
        data: this.values,
      },
    ]);
  }
}
