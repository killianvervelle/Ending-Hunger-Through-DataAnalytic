// components/WorldMap.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import * as d3 from 'd3';

// Styles
import '../styles/WorldMap.css';

function WorldMap() {
  const mapRef = useRef();
  const navigate = useNavigate();

  
  const [shouldZoom, setShouldZoom] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [popupData, setPopupData] = useState({ country: "", value: 0 });

  
  const zoom = d3.zoom().scaleExtent([1, 20]).on('zoom', handleZoom);

  function handleZoom(event) {
    const { transform } = event;
    const zoomLevel = transform.k;
    // Hide the popup when zooming
    

    d3.select('svg').selectAll('path').style('stroke-width', 1 / zoomLevel).attr('transform', transform);
    setSelectedCountry(null);
  }

  const ValuesArray = [];
  const lastValuesArray = [];

  const fetchData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/undernourishement-data");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      return null;
    }
  };
  
  const processCountryData = (data) => {
    for (const country in data) {
      const iso3 = data[country].iso3;
      const valueString = data[country].value;
      if (valueString !== undefined) {
        const valueArray = JSON.parse(valueString);
        const lastRate = valueArray[valueArray.length - 1];
        ValuesArray.push({ iso3, values: valueArray });
        lastValuesArray.push({ id: iso3, value: lastRate});
      }
    }
  };
  
  const fetchDataAndProcess = async () => {
    try {
      const data = await fetchData();
      if (data) {
        const ValuesArray = processCountryData(data);
        console.log(ValuesArray);
      } else {
        console.error("Data is null");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  fetchDataAndProcess();

  const mockData = [
    { id: 'FRA', value: 1.9 },
    { id: 'BEL', value: 10 },
    { id: 'ESP', value: 2.5 },
    { id: 'AGO', value: 10 },
    { id: 'DEU', value: 15 },
    { id: 'CHE', value: 350 },
    { id: 'ITA', value: 27 },
  ];

  const handleClick = (event, d) => {
    const countryId = d ? d.properties.adm0_a3_us : null;

    if (countryId) {
      // If a country is clicked, show the popup
      const countryInfo = lastValuesArray.find(country => country.id === countryId) || { id: countryId, value: 'Undefined' };
      console.log(countryInfo)
      setSelectedCountry(countryId);
      setPopupPosition({ x: event.clientX, y: event.clientY });
      setPopupData({ country: countryInfo.id, value: countryInfo.value });
      setShouldZoom(false);
    } else {
      console.log("HELLO")
      // If clicked outside any country, hide the popup
      setSelectedCountry(null);
    }
  };

  useEffect(() => {
    // Importing the JSON file
    const worldGeojson = require('../assets/worldmap.json');
  
    if (!shouldZoom) {
      drawMap(worldGeojson, lastValuesArray);
    }
  
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [shouldZoom]); // Add shouldZoom as a dependency
  

  const drawMap = (geojson, data) => {
    const width = window.innerWidth;
    const height = 600;

    const svgExists = d3.select(mapRef.current).select('svg').size() > 0;

    if (svgExists) {
      d3.select(mapRef.current).select('svg').remove();
    }

    const svg = d3.select(mapRef.current)
                  .append('svg')
                  .attr('width', width)
                  .attr('height', height)
                  .style('background-color', '#B4E2FF');

    const projection = d3.geoNaturalEarth1().fitSize([width, height], geojson);
    const path = d3.geoPath().projection(projection);

    svg.call(zoom);

    // Assuming 'id' in data corresponds to the 'id' in geojson
    const countryDataMap = new Map(data.map(entry => [entry.id, entry.value]));

    svg.selectAll('path')
       .data(geojson.features)
       .enter()
       .append('path')
       .attr('d', path)
       .style('stroke', 'white')
       .style('stroke-width', 1)
       .style('fill', d => getColor(countryDataMap.get(d.properties.adm0_a3_us)))
       .on('mouseover', handleMouseOver)
       .on('mouseout', handleMouseOut)
       .on('click', handleClick);


    function handleMouseOver(event, d) {
      const countryName = d.properties.name;
    
      // Get the current fill color
      const currentColor = d3.select(this).style('fill');
    
      // Lighten the color
      const lighterColor = d3.rgb(currentColor).brighter(0.5).toString();
    
      d3.select(this).style('fill', lighterColor);
    
      const centroid = path.centroid(d);

      // Remove existing tooltip
      svg.select('#tooltip').remove();

      // Append a new text element for the tooltip
      svg.append('text')
        .attr('id', 'tooltip')
        .attr('x', centroid[0])
        .attr('y', centroid[1])
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', 'black')
        .text(countryName);
    }
    

    function handleMouseOut(event, d) {
      d3.select(this).style('fill', d => getColor(countryDataMap.get(d.properties.adm0_a3_us)));

      svg.select('#tooltip').remove();
    }
  };

  const getColor = value => {
    var colorScale = d3.scaleThreshold()
    .domain([5, 10, 100])
    .range(["#03b082", "#fa7448", "#e63e50"]);
    return value !== undefined ? colorScale(value) : '#b1ada4';
  };

  const handleResize = () => {
    const newWidth = window.innerWidth;
    const newHeight = 600;

    d3.select(mapRef.current)
      .select('svg')
      .attr('width', newWidth)
      .attr('height', newHeight);

    drawMap(require('../assets/worldmap.json'), lastValuesArray);
  };

  const handleZoomIn = () => {
    d3.select('svg').transition().call(zoom.scaleBy, 1.5);
  };

  const handleZoomOut = () => {
    d3.select('svg').transition().call(zoom.scaleBy, 0.5);
  };

  return (
    <div className="map-container" ref={mapRef}>
      <div className="zoom-buttons" >
        <button className="zoom-button" onClick={handleZoomIn}>+</button>
        <button className="zoom-button" onClick={handleZoomOut}>-</button>
      </div>
      {selectedCountry && (
        <div className="popup" style={{ left: popupPosition.x, top: popupPosition.y }}>
          <button className="close-button" onClick={() => setSelectedCountry(null)}>X</button>
          <h3>{popupData.country}</h3>
          <p>Value: {popupData.value}</p>
          <button onClick={() => navigate(`/country/${selectedCountry}`)}>More</button>
        </div>
      )}
    </div>
  );
}

export default WorldMap;
