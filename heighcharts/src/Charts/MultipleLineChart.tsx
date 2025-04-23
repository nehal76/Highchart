import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
// import LineChartTable from "../Tables/LineChartTable"; // Correct path to your table component
import MultipleLineChartTable from '../Tables/MultipleLineChartTable'
// import "../CSS/LineChart.css";
import "../Tables/MultipleLineChartTable.css"

// Type definitions for sensor data and alarm data
interface SensorPoint {
  x: number;
  y: number;
}

interface AlarmPoint extends SensorPoint {
  color: string;
  name: string;
}

const SensorDataChart: React.FC = () => {
  const [sensorData1, setSensorData1] = useState<SensorPoint[]>([]);
  const [sensorData2, setSensorData2] = useState<SensorPoint[]>([]); // Second sensor
  const [alarmData, setAlarmData] = useState<AlarmPoint[]>([]);
  const [chartDimensions, setChartDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [chartType, setChartType] = useState<"line" | "area">("line");
  const [showTable, setShowTable] = useState<boolean>(false);

  const fullScreenHandle = useFullScreenHandle();

  useEffect(() => {
    const handleResize = () => {
      setChartDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const generateDummyData = () => {
      const now = new Date();
      const newValue1 = Math.floor(Math.random() * (100 - 20 + 1)) + 20; // Sensor 1 value
      const newValue2 = Math.floor(Math.random() * (100 - 20 + 1)) + 20; // Sensor 2 value

      const newSensorPoint1: SensorPoint = { x: now.getTime(), y: newValue1 };
      const newSensorPoint2: SensorPoint = { x: now.getTime(), y: newValue2 };

      setSensorData1((prevData) => [...prevData, newSensorPoint1]);
      setSensorData2((prevData) => [...prevData, newSensorPoint2]);

      if (newValue1 > 70) {
        const newAlarmPoint: AlarmPoint = {
          x: now.getTime(),
          y: newValue1,
          color: "red",
          name: `Alarm Triggered by Sensor 1: ${newValue1}°C`,
        };
        setAlarmData((prevData) => [...prevData, newAlarmPoint]);
      }

      if (newValue2 > 70) {
        const newAlarmPoint: AlarmPoint = {
          x: now.getTime(),
          y: newValue2,
          color: "red",
          name: `Alarm Triggered by Sensor 2: ${newValue2}°C`,
        };
        setAlarmData((prevData) => [...prevData, newAlarmPoint]);
      }
    };

    const interval = setInterval(generateDummyData, 2000);
    return () => clearInterval(interval);
  }, []);

  const options = {
    chart: {
      type: chartType,
      zoomType: "x",
      backgroundColor: "white",
      borderRadius: 10,
      shadow: true,
      width: chartDimensions.width,
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
      title: {
        text: "Time",
        style: {
          color: "#666",
        },
      },
      gridLineWidth: 1,
      gridLineColor: "#eaeaea",
    },
    yAxis: {
      title: {
        text: "Temperature (°C)",
        style: {
          color: "#666",
        },
      },
      min: 0,
      max: 100,
      labels: {
        formatter: function (
          this: Highcharts.AxisLabelsFormatterContextObject
        ) {
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
      style: {
        color: "#333",
      },
      formatter: function (
        this: Highcharts.Point & { point: { name?: string } }
      ) {
        if (this.series.name === "Alarms") {
          return `<b>${this.point.name}</b><br/>Time: ${Highcharts.dateFormat(
            "%Y-%m-%d, %H:%M:%S",
            this.x
          )}<br/>Temperature: ${this.y}°C`;
        }
        return `Time: ${Highcharts.dateFormat(
          "%Y-%m-%d, %H:%M:%S",
          this.x
        )}<br/>Temperature: ${this.y}°C`;
      },
    },
    plotOptions: {
      series: {
        animation: {
          duration: 1000,
        },
        shadow: true,
      },
    },
    series: [
      {
        name: "Sensor 1 Data",
        data: sensorData1,
        color: "blue",
        lineWidth: 3,
        fillOpacity: chartType === "area" ? 0.3 : 0,
        marker: {
          enabled: true,
          radius: 4,
          symbol: "circle",
        },
      },
      {
        name: "Sensor 2 Data",
        data: sensorData2,
        color: "green",
        lineWidth: 3,
        fillOpacity: chartType === "area" ? 0.3 : 0,
        marker: {
          enabled: true,
          radius: 4,
          symbol: "circle",
        },
      },
      {
        name: "Alarms",
        type: "scatter",
        data: alarmData,
        color: "red",
        marker: { symbol: "circle", radius: 6 },
      },
    ],
    credits: {
      enabled: false,
    },
    legend: {
      align: "center",
      verticalAlign: "top",
      layout: "horizontal",
      itemStyle: {
        color: "#666",
        fontWeight: "bold",
      },
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 600,
          },
          chartOptions: {
            legend: {
              align: "center",
              verticalAlign: "bottom",
            },
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
        <button
          className="showtable-button"
          onClick={() => setShowTable(!showTable)}
        >
          {showTable ? "Show Chart" : "Show Table"}
        </button>
      </div>
      {showTable ? (
        <MultipleLineChartTable
        sensorData1={sensorData1} sensorData2={sensorData2}
        />
      ) : (
        <FullScreen handle={fullScreenHandle}>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </FullScreen>
      )}
    </div>
  );
};

export default SensorDataChart;
