import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import "../CSS/LineChart.css";

// Type definition for sensor data
interface SensorPoint {
  x: number;
  y: number;
}

const TimeSeriesChart: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorPoint[]>([]);
  const [chartDimensions, setChartDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [chartType, setChartType] = useState<"line" | "area">("line");
  // const [sensorDataColor, setSensorDataColor] = useState<string>("#007bff");

  const fullScreenHandle = useFullScreenHandle();

  useEffect(() => {
    const handleResize = () => {
      setChartDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const generateDummyData = () => {
      const now = new Date();
      const newValue = Math.floor(Math.random() * (100 - 20 + 1)) + 20;
      const newSensorPoint: SensorPoint = { x: now.getTime(), y: newValue };
      setSensorData((prevData) => [...prevData, newSensorPoint]);
    };

    const interval = setInterval(generateDummyData, 1000);
    return () => clearInterval(interval);
  }, []);

  const options = {
    chart: {
      type: chartType,
      zoomType: "x",
      backgroundColor: "white",
      borderRadius: 10,
      shadow: true,
      width: chartDimensions.width ,
      height: chartDimensions.height,
    },
    title: {
      text: "Temperature Monitoring Chart",
      style: {
        color: "#333",
        fontWeight: "bold",
        fontSize: "22px",
      },
    },
    xAxis: {
      type: "datetime",
      title: { text: "Time", style: { color: "#666" } },
      gridLineWidth: 1,
      gridLineColor: "#eaeaea",
    },
    yAxis: {
      title: { text: "Temperature (°C)", style: { color: "#666" } },
      min: 0,
      max: 100,
      labels: {
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          return `${this.value}°C`;
        },
      },
      gridLineWidth: 1,
      gridLineColor: "#eaeaea",
    },
    tooltip: {
      useHTML: true,
      backgroundColor: "#fff",
      borderColor: "#ccc",
      borderRadius: 5,
      shadow: true,
      style: { color: "#333" },
      formatter: function (this: Highcharts.Point) {
        return `Time: ${Highcharts.dateFormat("%Y-%m-%d, %H:%M:%S", this.x)}<br/>Temperature: ${this.y}°C`;
      },
    },
    plotOptions: {
      series: {
        animation: { duration: 1000 },
        shadow: true,
      },
    },
    series: [
      {
        name: "Sensor Data",
        data: sensorData,
        // color: sensorDataColor,
        lineWidth: 3,
        fillOpacity: chartType === "area" ? 0.3 : 0,
        marker: { enabled: true, radius: 4, symbol: "circle" },
      },
    ],
    credits: { enabled: false },
    legend: {
      align: "center",
      verticalAlign: "top",
      layout: "horizontal",
      itemStyle: { color: "#666", fontWeight: "bold" },
    },
    responsive: {
      rules: [
        {
          condition: { maxWidth: 600 },
          chartOptions: {
            legend: { align: "center", verticalAlign: "bottom" },
          },
        },
      ],
    },
  };

  return (
    <div className="sensor-data-chart-container">
      <div className="container">
        <button
          className="switch-button"
          onClick={() => setChartType(chartType === "line" ? "area" : "line")}
        >
          Switch to {chartType === "line" ? "Area" : "Line"} Chart
        </button>
        <button className="fullscreen-button" onClick={fullScreenHandle.enter}>
          Fullscreen
        </button>
        {/* <input
          type="color"
          value={sensorDataColor}
          onChange={(e) => setSensorDataColor(e.target.value)}
          title="Pick a color for Sensor Data"
          style={{
            marginLeft: "10px",
            padding: "5px",
            borderRadius: "5px",
            cursor: "zoom-in",
          }}
        /> */}
      </div>
      <FullScreen handle={fullScreenHandle}>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </FullScreen>
    </div>
  );
};

export default TimeSeriesChart;
