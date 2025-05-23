// import React from "react";
import { Link } from "react-router-dom";

export default function Nav(): JSX.Element {
  return (
    <>
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-justify-content-center">
        <a className="navbar-brand " href="\">
          Home
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link active" to="/linechart">
                LayoutTimeSeriesChart
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link className="nav-link" to="/multichart">
                Multi Temp
              </Link>
            </li> */}

            <li className="nav-item">
              <Link className="nav-link" to="/LayoutLineChart">
                LayoutLineChart
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/LayoutBarChart">
                LayoutBarChart
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/LayoutTimeSeriesChart">
                TimeSeriesChartWithValue
              </Link>
              <li className="nav-item">
              <Link className="nav-link" to="/Tailwind">
                Tailwind
              </Link>
            </li>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    </>
  );
}
