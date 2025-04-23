import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Container, Typography } from "@mui/material";

// Define TypeScript interfaces
interface APIResponse {
  widgetType: string;
  widgetName: string;
  data: ChartData;
}

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

const LayoutTimeSeriesChartWithValue: React.FC = () => {
  const [chartTitle, setChartTitle] = useState<string>("Sensor Data Chart");
  const [chartSeries, setChartSeries] = useState<Highcharts.SeriesOptionsType[]>([]);
  const [yAxisConfig, setYAxisConfig] = useState<Highcharts.YAxisOptions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartStartDate, setChartStartDate] = useState<string | null>(null);
  const [chartEndDate, setChartEndDate] = useState<string | null>(null);
  const [showMin, setShowMin] = useState<boolean>(false);
  const [showMax, setShowMax] = useState<boolean>(false);
  const [lastValueInfo, setLastValueInfo] = useState<string>("");
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching API data...");
        const response = await fetch("http://localhost:5000/chart");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
        const responseData: APIResponse = await response.json();
        console.log("API Raw Response:", responseData);
  
        if (!responseData || !responseData.data) {
          console.error("API Response is missing 'data' property!", responseData);
          throw new Error("No data found");
        }
  
        const apiData = responseData.data;
        console.log("Extracted API Data:", apiData);
  
        setChartTitle(apiData.title);
        setChartStartDate(apiData.date?.startDate || null);
        setChartEndDate(apiData.date?.endDate || null);
        setShowMin(apiData.showValues.showMin);
        setShowMax(apiData.showValues.showMax);
  
        const dateFromTimestamp = new Date(apiData.date.startDate).getTime();
        const dateToTimestamp = new Date(apiData.date.endDate).getTime();
  
        const newSeries: Highcharts.SeriesOptionsType[] = [];
        const yAxisMapping: Record<string, number> = {};
        const newYAxisConfig: Highcharts.YAxisOptions[] = [];
  
        // Track last values for each sensor type
        let lastValues: Record<string, { value: number; timestamp: string }> = {};
  
        apiData.sensors.forEach((sensor) => {
          if (!sensor.sensorValues || sensor.sensorValues.length === 0) {
            console.warn(`Skipping empty data for sensor: ${sensor.sensorId}`);
            return;
          }
  
          const filteredSensorData = sensor.sensorValues
            .filter((point) => {
              const timestamp = new Date(point.timestamp).getTime();
              console.log(`Timestamp for ${sensor.sensorId}:`, timestamp);
              return timestamp >= dateFromTimestamp && timestamp <= dateToTimestamp;
            })
            .map((point) => [new Date(point.timestamp).getTime(), point.value]);
  
          if (filteredSensorData.length === 0) {
            console.warn(`No valid data for sensor: ${sensor.sensorId} in selected range`);
            return;
          }
  
          const yAxisIndex = yAxisMapping[sensor.sensorType] ?? newYAxisConfig.length;
  
          if (yAxisMapping[sensor.sensorType] === undefined) {
            yAxisMapping[sensor.sensorType] = yAxisIndex;
            newYAxisConfig.push({
              title: {
                text: sensor.sensorType === "Temperature"
                  ? "Temperature (°C)"
                  : sensor.sensorType === "Humidity"
                  ? "Humidity (%)"
                  : "Pressure (Pa)",
                style: { color: sensor.color }
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
                style: { color: sensor.color }
              },
              opposite: sensor.yAxis === "right",
            });
          }
  
          // find last value for this sensor type
          const lastDataPoint = filteredSensorData[filteredSensorData.length - 1];
          if (lastDataPoint) {
            lastValues[sensor.sensorType] = {
              value: lastDataPoint[1],
              timestamp: new Date(lastDataPoint[0]).toLocaleString(),
              // timestamp: Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', lastDataPoint[0]),
            };
          }
  
          // Find Min and Max Points
          let minPoint = filteredSensorData.reduce(
            (min, p) => (p[1] < min[1] ? p : min),
            filteredSensorData[0]
          );
          let maxPoint = filteredSensorData.reduce(
            (max, p) => (p[1] > max[1] ? p : max),
            filteredSensorData[0]
          );
  
          // Add Min and Max markers inside the main series
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
  
        setChartSeries(newSeries);
        setYAxisConfig(newYAxisConfig);
        setLoading(false);
  
        // Format the last values for display
        const lastValueText = Object.entries(lastValues)
          .map(([sensorType, data]) => `${sensorType}: ${data.value} at ${data.timestamp}`)
          .join("<br/>");
  
        setLastValueInfo(lastValueText);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  const options: Highcharts.Options = {
    chart: { type: "line", zooming: { type: "x" }, backgroundColor: "white" },
    title: { text: `${chartTitle}<br/><span style="font-size: 15px; color: red;"><br/>${lastValueInfo}</span>` },
    xAxis: {
      type: "datetime",
      title: { text: "Time" },
      labels: {
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          return Highcharts.dateFormat("%Y-%m-%d", Number(this.value));
        },
      },
      min: chartStartDate ? new Date(chartStartDate).getTime() : undefined,
      max: chartEndDate ? new Date(chartEndDate).getTime() : undefined,
    },
    yAxis: yAxisConfig,
    series: chartSeries,
    plotOptions: {
      line: {
        marker: { enabled: true, radius: 4 },
        enableMouseTracking: true,
      },
    },
    credits: { enabled: false },
  };

  return (
    <Container maxWidth="md">
      {loading ? (
        <Typography variant="h6" align="center">
          Loading chart data...
        </Typography>
      ) : error ? (
        <Typography variant="h6" color="error" align="center">
          {error}
        </Typography>
      ) : (
        <HighchartsReact highcharts={Highcharts} options={options} />
      )}
    </Container>
  );
};

export default LayoutTimeSeriesChartWithValue;