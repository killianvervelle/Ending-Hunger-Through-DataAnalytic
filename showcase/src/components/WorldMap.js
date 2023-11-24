import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import * as d3 from 'd3';

import '../styles/WorldMap.css';

function WorldMap() {

  const mapRef = useRef();
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [popupData, setPopupData] = useState({ country: "", value: 0 });

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
    const countryId = d.properties.adm0_a3_us;
    const countryInfo = mockData.find(country => country.id === countryId) || { id: countryId, value: 'Undefined' };

    // Close the previous popup
    setSelectedCountry(null);

    // Open the new popup
    setSelectedCountry(countryId);

    // Set popup position and data
    setPopupPosition({ x: event.clientX, y: event.clientY });
    setPopupData({ country: countryInfo.id, value: countryInfo.value });
  };

  useEffect(() => {
    // Importing the JSON file
    const worldGeojson = require('../assets/worldmap.json');

    drawMap(worldGeojson, mockData);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };

  }, []);

  const drawMap = (geojson, data) => {
    const width = window.innerWidth;
    const height = 600;

    const svgExists = d3.select(mapRef.current)
                        .select('svg')
                        .size() > 0;

    if (svgExists) {
      d3.select(mapRef.current)
        .select('svg')
        .remove();
    }

    const svg = d3.select(mapRef.current)
                  .append('svg')
                  .attr('width', width)
                  .attr('height', height)
                  .style('background-color', '#B4E2FF');

    const projection = d3.geoNaturalEarth1().fitSize([width, height], geojson);
    const path = d3.geoPath().projection(projection);
    const zoom = d3.zoom().scaleExtent([1, 20]).on('zoom', handleZoom);

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

    function handleZoom(event) {
      const { transform } = event;
      const zoomLevel = transform.k;

      svg.selectAll('path')
        .style('stroke-width', 1 / zoomLevel);

      svg.selectAll('path')
        .attr('transform', transform);
    }

    function handleMouseOver(event, d) {
      const countryName = d.properties.name;
  
      // Get the current fill color
      const currentColor = d3.select(this).style('fill');
      
      // Lighten the color (you can adjust the factor as needed)
      const lighterColor = d3.rgb(currentColor).brighter(0.5).toString();

      d3.select(this)
        .style('fill', lighterColor);

      const [x, y] = d3.pointer(event);

      svg.append('text')
        .attr('id', 'tooltip')
        .attr('x', x)
        .attr('y', y - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', 'black')
        .text(countryName);
    }

    function handleMouseOut(event, d) {
      d3.select(this)
        .style('fill', d => getColor(countryDataMap.get(d.properties.adm0_a3_us)));
    
      svg.select('#tooltip').remove();
    }  
  };
  
  const getColor = value => {
    var colorScale = d3.scaleThreshold()
    .domain([2.5, 5, 15, 25, 35])
    .range(["#2ab6c5", "#03b082", "#fec866", "#fa7448", "#e63e50", "#940f42"]);
    
    return value !== undefined ? colorScale(value) : '#b1ada4';
  };

  const handleResize = () => {
    const newWidth = window.innerWidth;
    const newHeight = 600;

    d3.select(mapRef.current)
      .select('svg')
      .attr('width', newWidth)
      .attr('height', newHeight);

    drawMap(require('../assets/worldmap.json'), mockData);
  };

  return (
    <div className="map-container" ref={mapRef}>
      {selectedCountry && (
        <div className="popup" style={{ left: popupPosition.x, top: popupPosition.y }}>
          <h3>{popupData.country}</h3>
          <p>Value: {popupData.value}</p>
          <button onClick={() => navigate(`/country/${selectedCountry}`)}>More</button>
        </div>
      )}
    </div>
  );
}

export default WorldMap;
