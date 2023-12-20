// WorldCharts.js
import React, { useEffect, useState } from 'react';
import Chart from '../components/CaloryCharts';

import '../App.css';
import '../styles/WorldCharts.css';

const WorldCharts = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Fetch data from the provided API
    fetch('http://localhost:8000/food-supply')
      .then(response => response.json())
      .then(data => {
        setChartData(data);
      });
  }, []); // Empty dependency array ensures that this effect runs only once

  return (
    <>
      <div className='world-main-container'>
        <h1 className='world-title'>World explained in charts</h1>
        <div className='world-grid-container'>
          <div className='charts'>
            <Chart data={chartData} />
          </div>
          <p>It’s estimated that the average man should be eating 2,500kcals a day, or 2,000kcals for a woman, which gives us an idea of roughly where our intake of energy needs to be</p>
        </div>
        {/* Add more grid items as needed */}
      </div>
    </>
  );
};

export default WorldCharts;
