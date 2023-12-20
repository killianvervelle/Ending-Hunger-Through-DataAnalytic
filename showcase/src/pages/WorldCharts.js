// WorldCharts.js
import React, { useEffect, useState } from 'react';
import Chart from '../components/CaloryCharts';
import TopMalnutrition from '../components/TopMalnutrition';
import ComparisonSupply from '../components/ComparisonSupply';

import '../App.css';
import '../styles/WorldCharts.css';

const WorldCharts = () => {
  const [chartData, setChartData] = useState(null);
  const [topMalnutrition, setTopMalnutrition] = useState(null);
  const [comparisonSupply, setComparisonSupply] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/food-supply')
      .then(response => response.json())
      .then(data => {
        setChartData(data);
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/compare-supply')
      .then(response => response.json())
      .then(data => {
        setComparisonSupply(data);
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/undernourishement-data')
      .then(response => response.json())
      .then(data => {
        const filteredData = Object.fromEntries(
          Object.entries(data).filter(([country, { values }]) => values.some(value => value !== 0))
        );
        setTopMalnutrition(filteredData);
      });
  }, []);

  return (
    <>
      <div className='world-main-container'>
        <h1 className='world-title'>World Hunger Facts & Statistics</h1>
        <div className='world-grid-container'>
          <div className='charts'>
            <Chart data={chartData} />
          </div>
          <p>It’s estimated that the average man should be eating 2,500kcals a day, or 2,000kcals for a woman, which gives us an idea of roughly where our intake of energy needs to be</p>
          <div className='charts'>
            <TopMalnutrition data={topMalnutrition} order="desc" color="red" id="1"/>
          </div>
          <p>TODO HERE: The analysis</p>
          <div className='charts'>
            <ComparisonSupply data={comparisonSupply} />

          </div>
          <p>TODO HERE : Also the analysis</p>
        </div>
        {/* Add more grid items as needed */}
      </div>
    </>
  );
};

export default WorldCharts;
