
import './App.css'
import LayoutBarChart from './Charts/LayoutBarChart';
import LineChart from './Charts/LayoutTimeSeriesChartt';
import MultipleLineChart from './Charts/MultipleLineChart'

import Nav from './Charts/Nav'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LayoutLineChart from './Charts/LayoutLineChart';
import LayoutTimeSeriesChart from './Charts/LayoutTimeSeriesChartWithValue';





function App() {
  

  return (
    <>
    <Router>
        <div className='container'><Nav /> {/* Correctly use Nav component here */}
        </div>
        <Routes>
          <Route path="/linechart" element={<LineChart/>} />
          <Route path="/multichart" element={<MultipleLineChart />} />
          <Route path="/LayoutBarChart" element={<LayoutBarChart />} />
          <Route path="/LayoutLineChart" element={<LayoutLineChart/>} />
          <Route path="/LayoutTimeSeriesChart" element={<LayoutTimeSeriesChart/>} />
       
          
        
        </Routes>
      </Router>
      
    
    </>
  )
}

export default App
