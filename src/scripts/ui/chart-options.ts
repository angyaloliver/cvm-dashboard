import { formatNumber } from "./format-number";

/**
 * @internal
 */
export const chartOptions = {
  chart: {
    type: "line",
    toolbar: {
      show: false,
    },
  },
  yaxis: {
    min: 0,
    max: 1,
    labels: {
      style: {
        colors: "#999999",
      },
      formatter: formatNumber,
    },
  },
  series: [
    {
      name: "CVM rate",
      data: [],
    },
  ],
  stroke: {
    curve: "smooth",
    colors: "#ffffff",
    width: 3,
  },
  grid: {
    show: false,
  },
  xaxis: {
    type: "datetime",
    labels: {
      show: true,
      format: "HH:mm",
      style: {
        colors: "#999999",
      },
    },
  },
};
