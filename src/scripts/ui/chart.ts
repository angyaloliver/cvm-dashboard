import { chartOptions } from './chart-options';
import ApexCharts from 'apexcharts';

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

  public getCvmValues(): Array<number> {
    return this.values.map((v) => v[1]);
  }

  public getValues(): Array<[number, number]> {
    return this.values;
  }

  public addTimeFrame(time: Date, value: number): void {
    this.values.push([time.getTime(), value]);
    const shouldScroll = this.values.length >= this.maxValueCount;
    if (shouldScroll) {
      this.values = this.values.slice(-this.maxValueCount);
    }

    this.chart.updateSeries(
      [
        {
          name: 'CVM rate',
          data: this.values,
        },
      ],
      !shouldScroll
    );
  }
}
