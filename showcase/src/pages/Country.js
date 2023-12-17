import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

import * as d3 from 'd3';

import '../App.css';
import '../styles/Country.css'
import "../../node_modules/flag-icons/css/flag-icons.min.css";

export default function Country() {

  const [countryData, setCountryData] = useState(null);
  const [countryFoodUtilization, setUtilizationData] = useState(null);
  const { id } = useParams();
  let hoveredInfo = null;

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/nutritional-data-country/${id}`, { method: 'GET'} );
        if (response.ok) {
          const data = await response.json();
          setCountryData(data);
        } else {
          console.error('Profile data not found');
          setCountryData(null);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setCountryData(null);
      }
    };

    fetchCountryData();
  }, [id]);
  
  const fetchUtilizationData = async (category) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/utilization-data/${id}/${category}`, { method: 'GET'} );
      if (response.ok) {
        const data = await response.json();
        setUtilizationData(data);
        const parsedData = JSON.parse(data.data)
        const tableContainer = d3.select('#table-container');
        tableContainer.html('');
        const table = tabulate(parsedData, ["element", "item", "year", "unit", "value"]);
        tableContainer.node().appendChild(table.node());
      } else {
        console.error('Profile data not found');
        setUtilizationData(null);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setUtilizationData(null);
    }
  };

  function tabulate(data, columns) {
    var table = d3.select('body').append('table')
    var thead = table.append('thead')
    var	tbody = table.append('tbody');
  
    thead.append('tr')
      .selectAll('th')
      .data(columns).enter()
      .append('th')
        .text(function (column) { return column; });
  
    var rows = tbody.selectAll('tr')
      .data(data)
      .enter()
      .append('tr');
  
    var cells = rows.selectAll('td')
      .data(function (row) {
        return columns.map(function (column) {
          return {column: column, value: row[column]};
        });
      })
      .enter()
      .append('td')
      .text(function (d) { return d.value; });
  
    return table;
  }

  function calculateCategorySums(data) {
    const categorySums = {};
    if (data && data.country) {
      const categories = Object.keys(data.country).slice(5);

      categories.forEach(category => {
        const categoryData = data.country[category];

        if (Array.isArray(categoryData)) {
          categoryData.forEach(item => {
            const categoryValue = item[1];
            if (!categorySums[category]) {
              categorySums[category] = categoryValue;
            } else {
              categorySums[category] += categoryValue;
            }
          });
        } else {
          console.log(`Invalid data structure for category: ${category}`);
        }
      });
    } else {
      console.log("Invalid data structure. Missing 'country' property or data is null/undefined.");
    }
    const csvHeaders = ["group", "Production", "Import Quantity", "Stock Variation", "Export Quantity", "Feed", "Seed", "Losses", "Food"];
    const csvRowInput = ["Available food", categorySums.production, categorySums.import_quantity, categorySums.stock_variation, 0, 0, 0, 0, 0];
    const csvRowOutput = ["Consumed food", 0, 0, 0, categorySums.export_quantity, categorySums.feed, categorySums.seed, categorySums.losses, categorySums.food];
    const csvContent = [csvHeaders.join(",")].concat([csvRowInput.join(","), csvRowOutput.join(",")]).join("\n");
    //return categorySums;
    return csvContent;
  };

  const result = calculateCategorySums(countryData);
  
  const ChartComponent = ({ data }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        if (data && Object.keys(data).length > 0) {
            d3.select(chartRef.current).selectAll('*').remove();
            
            // Parsing data assuming it's in CSV-like format
            // If data is already in the correct format, you might not need this step
            const parsedData = d3.csvParse(data);

            var subgroups = parsedData.columns.slice(1);
            var groups = parsedData.map(row => row.group);
            var margin = { top: 45, right: 130, bottom: 20, left: 120 },
                width = 850 - margin.left - margin.right,
                height = 600 - margin.top - margin.bottom;

            // Dynamically determine Y-axis domain based on the data
            var maxY = d3.max(parsedData, d => d3.sum(subgroups, key => +d[key]));
            var y = d3.scaleLinear().domain([0, maxY]).range([height, 0]);

            var svg = d3.select(chartRef.current)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var x = d3.scaleBand()
                .domain(groups)
                .range([0, width])
                .padding([0.2]);

            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickSizeOuter(0))
                .selectAll("text")  
                .style("font-size", "14px"); 

            svg.append("g")
                .call(d3.axisLeft(y));
            
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", 0 - margin.top / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "18px")
                .style("font-weight", "bold")
                .text("Food utilization in megatonnes");
            
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - height / 2)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Weight in megatonnes (Mt)")
                .style("font-size", "16px");

            var color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(['#ff7f0e', '#2ca02c', '#377eb8', '#8c564b', '#e377c2', '#ffbb78', '#7f7f7f', '#17becf']);

            var stackedData = d3.stack().keys(subgroups)(parsedData);

            svg.append("g")
                .selectAll("g")
                .data(stackedData)
                .enter().append("g")
                .attr("fill", function (d) { return color(d.key); })
                .selectAll("rect")
                .data(function (d) { return d; })
                .enter().append("rect")
                .attr("x", function (d) { return x(d.data.group); })
                .attr("y", function (d) { return y(d[1]); })
                .attr("height", function (d) { return y(d[0]) - y(d[1]); })
                .attr("width", x.bandwidth())
                .on('mouseover', function (event, d) {
                  d3.select(this)
                      .transition()
                      .duration(100)
                      .attr('opacity', 0.7);
          
                  const columnName = d3.select(this.parentNode).datum().key; // Get the column name
                  const value = d.data[columnName];
          
                  // Convert value to number if it's a string
                  const numericValue = parseInt(value) || 0;
          
                  const text = `${columnName}: ${numericValue}`;
          
                  const xPosition = x(d.data.group) + x.bandwidth() / 2;
                  const yPosition = (y(d[0]) + y(d[1])) / 2;

                  hoveredInfo = { columnName, numericValue, xPosition, yPosition };

          
                  svg.append('text')
                      .attr('class', 'value-label')
                      .attr('x', xPosition)
                      .attr('y', yPosition)
                      .attr('text-anchor', 'middle')
                      .text(text);
              })
              .on('mouseout', function () {
                  d3.select(this)
                      .transition()
                      .duration(100)
                      .attr('opacity', 1);
          
                  svg.select('.value-label').remove();
                  hoveredInfo = null;
              })
              .on('click', function () {
                if (hoveredInfo) {
                    fetchUtilizationData(hoveredInfo.columnName);
                }
            });

            const legendSet1 = svg.selectAll('.legendSet1')
                .data(subgroups)
                .enter()
                .append('g')
                .attr('class', 'legendSet1')
                .attr('transform', (d, i) => `translate(${width - 20},${i * 22 + (i >= 3 ? 20 : 0)})`);
    
            legendSet1.append('rect')
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', d => color(d));
      
            legendSet1.append('text')
                .attr('x', 30)
                .attr('y', 9)
                .attr('dy', '.35em')
                .style('text-anchor', 'start')
                .text(d => d);
            }

    }, [data]);

    return <div ref={chartRef}></div>;
};

  return (
  <div className="page-container">
    {countryData && (
    <div className="country-container">
      <span className={`fi fi-${countryData.country.iso2.toLowerCase()}`}></span>
      <h1 className="country-name">{countryData.country.name}</h1>
    </div>
    )}
    <div className="parent-container">
      <div className="child-container">
        <div className="top-left">
          <ChartComponent data={result} />
        </div>
      </div>
      <div className="child-container">
        <div className="top-right">
          <div id="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}></div>
        </div>
      </div>
    </div>
  </div>
  );
}