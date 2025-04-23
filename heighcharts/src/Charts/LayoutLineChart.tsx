// import React, { useState, useEffect } from "react";
// import Highcharts from "highcharts";
// import HighchartsReact from "highcharts-react-official";
// import { Container, Typography } from "@mui/material";

// // Define TypeScript interfaces

// interface ChartData {
//   title: string;
//   rtus: string[];
//   sensors: Sensor[];
//   date: DateRange;
//   showValues: ValueRange;
// }

// interface DateRange {
//   startDate: string;
//   endDate: string;
// }

// interface ValueRange {
//   showMax: boolean;
//   showMin: boolean;
// }

// interface Sensor {
//   sensorType: string;
//   sensorId: string;
//   yAxis: string;
//   color: string;
//   sensorValues: { timestamp: string; value: number }[];
// }

// const SensorDataChart: React.FC = () => {
//   const [chartTitle, setChartTitle] = useState<string>("Sensor Data Chart");
//   const [chartSeries, setChartSeries] = useState<
//     Highcharts.SeriesOptionsType[]
//   >([]);
//   const [yAxisConfig, setYAxisConfig] = useState<Highcharts.YAxisOptions[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [chartStartDate, setChartStartDate] = useState<string | null>(null);
//   const [chartEndDate, setChartEndDate] = useState<string | null>(null);
//   const [showMin, setShowMin] = useState<boolean>(false);
//   const [showMax, setShowMax] = useState<boolean>(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         console.log("Fetching API data...");
//         const response = await fetch("http://localhost:5000/chart");
//         if (!response.ok)
//           throw new Error(`HTTP error! Status: ${response.status}`);

//         const responseData: ChartData = await response.json();
//         console.log("API Raw Response:", responseData);

//         if (!responseData || !responseData) {
//           console.error(
//             " API Response is missing 'data' property!",
//             responseData
//           );
//           throw new Error("No data found");
//         }

//         setChartTitle(responseData.title);
//         setChartStartDate(responseData.date?.startDate || null);
//         setChartEndDate(responseData.date?.endDate || null);
//         setShowMin(responseData.showValues.showMin);
//         setShowMax(responseData.showValues.showMax);

//         const dateFromTimestamp = new Date(
//           responseData.date.startDate
//         ).getTime();
//         const dateToTimestamp = new Date(responseData.date.endDate).getTime();

//         const newSeries: Highcharts.SeriesOptionsType[] = [];
//         const yAxisMapping: Record<string, number> = {};
//         const newYAxisConfig: Highcharts.YAxisOptions[] = [];

//         responseData.sensors.forEach((sensor) => {
//           if (!sensor.sensorValues || sensor.sensorValues.length === 0) {
//             console.warn(`Skipping empty data for sensor: ${sensor.sensorId}`);
//             return;
//           }

//           const filteredSensorData = sensor.sensorValues
//             .filter((point) => {
//               const timestamp = new Date(point.timestamp).getTime();
//               console.log(`Timestamp for ${sensor.sensorId}:`, timestamp);
//               return (
//                 timestamp >= dateFromTimestamp && timestamp <= dateToTimestamp
//               );
//             })
//             .map((point) => [new Date(point.timestamp).getTime(), point.value]);

//           if (filteredSensorData.length === 0) {
//             console.warn(
//               `No valid data for sensor: ${sensor.sensorId} in selected range`
//             );
//             return;
//           }

//           const yAxisIndex =
//             yAxisMapping[sensor.sensorType] ?? newYAxisConfig.length;

//           if (yAxisMapping[sensor.sensorType] === undefined) {
//             yAxisMapping[sensor.sensorType] = yAxisIndex;
//             newYAxisConfig.push({
//               title: {
//                 text:
//                   sensor.sensorType === "Temperature"
//                     ? "Temperature (°C)"
//                     : sensor.sensorType === "Humidity"
//                     ? "Humidity (%)"
//                     : "Pressure (Pa)",

//                 style: { color: sensor.color },
//               },
//               labels: {
//                 formatter: function () {
//                   return `${this.value} ${
//                     sensor.sensorType === "Temperature"
//                       ? "°C"
//                       : sensor.sensorType === "Humidity"
//                       ? "%"
//                       : "Pa"
//                   }`;
//                 },

//                 style: { color: sensor.color },
//               },
//               opposite: sensor.yAxis === "right",
//             });
//           }

//           // Find Min and Max Points
//           let minPoint = filteredSensorData.reduce(
//             (min, p) => (p[1] < min[1] ? p : min),
//             filteredSensorData[0]
//           );
//           let maxPoint = filteredSensorData.reduce(
//             (max, p) => (p[1] > max[1] ? p : max),
//             filteredSensorData[0]
//           );

//           // Add Min and Max markers inside the main series
//           newSeries.push({
//             name: `${sensor.sensorType} - ${sensor.sensorId}`,
//             data: filteredSensorData,
//             color: sensor.color,
//             type: "line",
//             yAxis: yAxisIndex,
//             marker: { enabled: true, symbol: "circle" },
//             dataLabels: {
//               enabled: true,
//               formatter: function (this: Highcharts.Point) {
//                 if (showMin && this.x === minPoint[0]) {
//                   return `⬇ Min: ${this.y}`;
//                 }
//                 if (showMax && this.x === maxPoint[0]) {
//                   return `⬆ Max: ${this.y}`;
//                 }
//                 return null;
//               },
//               style: { fontWeight: "bold", color: "black" },
//             },
//           });
//         });

//         setChartSeries(newSeries);
//         setYAxisConfig(newYAxisConfig);
//         setLoading(false);
//       } catch (error: any) {
//         console.error("Error fetching data:", error);
//         setError(error.message);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const options: Highcharts.Options = {
//     chart: { type: "line", zooming: { type: "x" }, backgroundColor: "white" },
//     title: { text: chartTitle },
//     xAxis: {
//       type: "datetime",
//       title: { text: "Time" },
//       labels: {
//         formatter: function (
//           this: Highcharts.AxisLabelsFormatterContextObject
//         ) {
//           return Highcharts.dateFormat("%Y-%m-%d", Number(this.value));
//         },
//       },
//       min: chartStartDate ? new Date(chartStartDate).getTime() : undefined,
//       max: chartEndDate ? new Date(chartEndDate).getTime() : undefined,
//     },
//     yAxis: yAxisConfig,
//     series: chartSeries,
//     plotOptions: {
//       line: {
//         marker: { enabled: true, radius: 4 },
//         enableMouseTracking: true,
//       },
//     },
//     credits: { enabled: false },
//   };

//   return (
//     <Container maxWidth="md">
//       {loading ? (
//         <Typography variant="h6" align="center">
//           Loading chart data...
//         </Typography>
//       ) : error ? (
//         <Typography variant="h6" color="error" align="center">
//           {error}
//         </Typography>
//       ) : (
//         <HighchartsReact highcharts={Highcharts} options={options} />
//       )}
//     </Container>
//   );
// };

// export default SensorDataChart;

import React, { useState, useEffect, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Container, Typography } from "@mui/material";

const loadHighchartsModules = async () => {
  const exporting = await import("highcharts/modules/exporting");
  const fullscreen = await import("highcharts/modules/full-screen");
  exporting.default(Highcharts);
  fullscreen.default(Highcharts);
};

loadHighchartsModules();

// Define TypeScript interfaces
interface ChartData {
  title: string;
  rtus: string[];
  sensors: Sensor[];
  date: DateRange;
  showValues: ValueRange;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ValueRange {
  showMax: boolean;
  showMin: boolean;
}

interface Sensor {
  sensorType: string;
  sensorId: string;
  yAxis: string;
  color: string;
  sensorValues: { timestamp: string; value: number }[];
}

interface LineHighChartProps {
  reportId: string | undefined;
  widgetId: number | undefined;
}

const LineHighChart: React.FC<LineHighChartProps> = ({}) => {
  const [chartTitle, setChartTitle] = useState<string>("Sensor Data Chart");
  const [chartSeries, setChartSeries] = useState<
    Highcharts.SeriesOptionsType[]
  >([]);
  const [yAxisConfig, setYAxisConfig] = useState<Highcharts.YAxisOptions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartStartDate, setChartStartDate] = useState<string | null>(null);
  const [chartEndDate, setChartEndDate] = useState<string | null>(null);
  const [showMin, setShowMin] = useState<boolean>(false);
  const [showMax, setShowMax] = useState<boolean>(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/chart`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const res = await response.json();
        const responseData: ChartData = res.data;

        setChartTitle(responseData.title);
        setChartStartDate(responseData.date?.startDate || null);
        setChartEndDate(responseData.date?.endDate || null);
        setShowMin(responseData.showValues.showMin);
        setShowMax(responseData.showValues.showMax);

        const dateFromTimestamp = new Date(
          responseData.date.startDate
        ).getTime();
        const dateToTimestamp = new Date(responseData.date.endDate).getTime();

        const newSeries: Highcharts.SeriesOptionsType[] = [];
        const yAxisMapping: Record<string, number> = {};
        const newYAxisConfig: Highcharts.YAxisOptions[] = [];

        responseData.sensors.forEach((sensor) => {
          if (!sensor.sensorValues || sensor.sensorValues.length === 0) {
            return;
          }

          const filteredSensorData = sensor.sensorValues
            .filter((point) => {
              const timestamp = new Date(point.timestamp).getTime();
              return (
                timestamp >= dateFromTimestamp && timestamp <= dateToTimestamp
              );
            })
            .map((point) => [new Date(point.timestamp).getTime(), point.value]);

          if (filteredSensorData.length === 0) {
            return;
          }

          const yAxisIndex =
            yAxisMapping[sensor.sensorType] ?? newYAxisConfig.length;

          if (yAxisMapping[sensor.sensorType] === undefined) {
            yAxisMapping[sensor.sensorType] = yAxisIndex;
            newYAxisConfig.push({
              title: {
                text:
                  sensor.sensorType === "Temperature"
                    ? "Temperature (°C)"
                    : sensor.sensorType === "Humidity"
                    ? "Humidity (%)"
                    : "Pressure (Pa)",
                style: { color: sensor.color },
              },
              labels: {
                formatter: function () {
                  return `${this.value} ${
                    sensor.sensorType === "Temperature"
                      ? "°C"
                      : sensor.sensorType === "Humidity"
                      ? "%"
                      : "Pa"
                  }`;
                },
                style: { color: sensor.color },
              },
              opposite: sensor.yAxis === "right",
            });
          }

          const minPoint = filteredSensorData.reduce(
            (min, p) => (p[1] < min[1] ? p : min),
            filteredSensorData[0]
          );
          const maxPoint = filteredSensorData.reduce(
            (max, p) => (p[1] > max[1] ? p : max),
            filteredSensorData[0]
          );

          newSeries.push({
            name: `${sensor.sensorType} - ${sensor.sensorId}`,
            data: filteredSensorData,
            color: sensor.color,
            type: "line",
            yAxis: yAxisIndex,
            marker: { enabled: true, symbol: "circle" },
            dataLabels: {
              enabled: true,
              formatter: function (this: Highcharts.Point) {
                if (showMin && this.x === minPoint[0]) {
                  return `⬇ Min: ${this.y}`;
                }
                if (showMax && this.x === maxPoint[0]) {
                  return `⬆ Max: ${this.y}`;
                }
                return null;
              },
              style: { fontWeight: "bold", color: "black" },
            },
          });
        });

        setChartSeries([...newSeries]);
        setYAxisConfig([...newYAxisConfig]);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options: Highcharts.Options = {
    chart: { type: "line", zooming: { type: "x" }, backgroundColor: "white" },
    title: { text: chartTitle },
    xAxis: {
      type: "datetime",
      title: { text: "Time" },
      labels: {
        formatter: function (
          this: Highcharts.AxisLabelsFormatterContextObject
        ) {
          return Highcharts.dateFormat("%Y-%m-%d", Number(this.value));
        },
      },
      min: chartStartDate ? new Date(chartStartDate).getTime() : undefined,
      max: chartEndDate ? new Date(chartEndDate).getTime() : undefined,
    },
    yAxis: yAxisConfig,
    series: chartSeries,
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: ["viewFullscreen"],
        },
      },
    },
    plotOptions: {
      line: {
        marker: { enabled: true, radius: 4 },
        enableMouseTracking: true,
      },
    },
    credits: { enabled: false },
  };

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={chartRef}
      />
    </div>
  );
};

export default LineHighChart;
