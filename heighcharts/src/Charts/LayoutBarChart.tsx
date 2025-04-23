import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Container, Typography } from "@mui/material";



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

const SensorDataChart: React.FC = () => {
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
const [shoMax, setShowMax] = useState<boolean>(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching API data...");
        const response = await fetch("http://localhost:5000/chart");
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const responseData: APIResponse = await response.json();
        console.log("API Response:", responseData);

        if (!responseData || !responseData.data) {
          console.error(" API Response is missing 'data' property!", responseData);
          throw new Error("No data found");
        }

        const apiData = responseData.data;
        setChartTitle(apiData.title);
        setChartStartDate(apiData.date?.startDate || null);
        setChartEndDate(apiData.date?.endDate || null);
        setShowMin(apiData.showValues.showMin);
        setShowMax(apiData.showValues.showMax);

        const newSeries: Highcharts.SeriesOptionsType[] = [];
        const yAxisMapping: Record<string, number> = {};
        const newYAxisConfig: Highcharts.YAxisOptions[] = [];

        apiData.sensors.forEach((sensor) => {
          if (!sensor.sensorValues || sensor.sensorValues.length === 0) {
            console.warn(`Skipping empty data for sensor: ${sensor.sensorId}`);
            return;
          }

          const filteredSensorData = sensor.sensorValues.map((point) => [
            new Date(point.timestamp).getTime(),
            point.value,
          ]);

          if (filteredSensorData.length === 0) {
            console.warn(
              `No valid data for sensor: ${sensor.sensorId} in selected range`
            );
            return;
          }

          const yAxisIndex =
            yAxisMapping[sensor["sensorType"]] ?? newYAxisConfig.length;

          if (yAxisMapping[sensor["sensorType"]] === undefined) {
            yAxisMapping[sensor["sensorType"]] = yAxisIndex;
            newYAxisConfig.push({
              title: {
                text: sensor["sensorType"],
                style: { color: sensor.color },
              },
              labels: {
                style: { color: sensor.color },
              },
              opposite: sensor.yAxis === "right",
            });
          }

          let minPoint = filteredSensorData.reduce(
            (min, p) => (p[1] < min[1] ? p : min),
            filteredSensorData[0]
          );
          let maxPoint = filteredSensorData.reduce(
            (max, p) => (p[1] > max[1] ? p : max),
            filteredSensorData[0]
          );

          newSeries.push({
            name: `${sensor["sensorType"]} - ${sensor.sensorId}`,
            data: filteredSensorData,
            color: sensor.color,
            type: "column",
            yAxis: yAxisIndex,

            
            dataLabels:{
              enabled: true,
              formatter: function (this: Highcharts.Point){
                if(showMin && this.x ===minPoint[0]){
                  return this.y;
                }
                if(shoMax && this.x === maxPoint[0]){
                  return this.y;
                }
                return null;
              },
              style: { fontWeight: "bold", color: "black" },
            }
          });
        });

        setChartSeries(newSeries);
        setYAxisConfig(newYAxisConfig);
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options: Highcharts.Options = {
    chart: {
      type: "column",
      zooming: { type: "x" },
      backgroundColor: "white",
      // width: 800,
      // height: 600,
    },

    title: { text: chartTitle },
    xAxis: {
      type: "datetime",
      title: { text: "Time" },
      
      labels: {
        rotation: -45,
        formatter: function (
          this: Highcharts.AxisLabelsFormatterContextObject
        ) {
          return Highcharts.dateFormat("%d %b %H:%M", Number(this.value));
        },
      },
      min: chartStartDate ? new Date(chartStartDate).getTime() : undefined,
      max: chartEndDate ? new Date(chartEndDate).getTime() : undefined,
    },
    yAxis: yAxisConfig,
    series: chartSeries,
    plotOptions: {
      column: {
        pointWidth: 20,
        groupPadding: 0.2,
        borderWidth: 0,
      
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

export default SensorDataChart;
