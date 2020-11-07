import { formatNumber } from "./format-number";

/**
 * @internal
 */
export const chartOptions = {
  chart: {
    type: "line",
    height: "100%",
    toolbar: {
      show: false,
    },
  },
  yaxis: {
    min: 0,
    max: 1,
    tickAmount: 5,
    labels: {
      align: "right",
      minWidth: 20,
      maxWidth: 20,
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
    axisBorder: {
      height: 0,
    },
    labels: {
      show: true,
      minHeight: 25,
      maxHeight: 25,
      format: "HH:mm",
      style: {
        colors: "#999999",
      },
    },
  },
};
