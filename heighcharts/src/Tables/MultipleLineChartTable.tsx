import Highcharts from "highcharts";
import "../Tables/LineChartTable.css";

interface DataPoint {
  x: number; // Timestamp in milliseconds
  y: number; // Sensor value
}

interface LineChartTableProps {
  sensorData1: DataPoint[]; // Sensor 1 data
  sensorData2: DataPoint[]; // Sensor 2 data
}

const LineChartTable: React.FC<LineChartTableProps> = ({ sensorData1, sensorData2 }) => {
  return (
    <div className="table-container">
      <table className="tablecontent">
        <thead>
          <tr>
            <th>Time</th>
            <th>Sensor 1 Value (°C)</th>
            <th>Sensor 1 Alarm</th>
            <th>Sensor 2 Value (°C)</th>
            <th>Sensor 2 Alarm</th>
          </tr>
        </thead>
        <tbody>
          {sensorData1.map((dataPoint1, index) => {
            const dataPoint2 = sensorData2[index] || { x: dataPoint1.x, y: 0 }; // Fallback for Sensor 2 data
            return (
              <tr key={index}>
                <td>
                  {Highcharts.dateFormat("%Y-%m-%d, %H:%M:%S", dataPoint1.x)}
                </td>
                <td>{dataPoint1.y}</td>
                <td>
                  {dataPoint1.y > 70 ? "Alarm Triggered" : "Alarm Not Triggered"}
                </td>
                <td>{dataPoint2.y}</td>
                <td>
                  {dataPoint2.y > 70 ? "Alarm Triggered" : "Alarm Not Triggered"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LineChartTable;
