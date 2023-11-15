// App.jsx

import '../styles/WorldMap.css';
import React, { useEffect, useRef } from "react";
import * as d3 from 'd3';

function WorldMap() {
  const mapRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Import the GeoJSON file
        const worldGeojson = require('../assets/worldmap.json');

        // Use the imported GeoJSON data directly
        drawMap(worldGeojson);
      } catch (error) {
        console.error('Error loading GeoJSON data:', error);
      }
    };

    fetchData();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array ensures the effect runs only once on mount

  const drawMap = (geojson) => {
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

    const projection = d3.geoNaturalEarth1()
      .fitSize([width, height], geojson);

    const path = d3.geoPath().projection(projection);

    const zoom = d3.zoom()
      .scaleExtent([1, 20])
      .on('zoom', handleZoom);

    svg.call(zoom);

    svg.selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .style('stroke', 'white')
      .style('stroke-width', 1) // Initial stroke width
      .style('fill', '#C2FFC2')
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

    function handleZoom(event) {
      const { transform } = event;
      const zoomLevel = transform.k; // Get the zoom level

      // Adjust the stroke width dynamically based on the zoom level
      svg.selectAll('path')
        .style('stroke-width', 1 / zoomLevel);
      
      // Apply zoom transformation to paths
      svg.selectAll('path')
        .attr('transform', transform);
    }

    function handleMouseOver(event, d) {
      // Show tooltip with country name
      const countryName = d.properties.name;
      d3.select(this)
        .style('fill', 'orange'); // Highlight the country on hover

      // Calculate tooltip position based on cursor coordinates
      const [x, y] = d3.pointer(event);

      // Append tooltip
      svg.append('text')
        .attr('id', 'tooltip')
        .attr('x', x)
        .attr('y', y - 10) // Position above the cursor
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', 'black')
        .text(countryName);
    }

    function handleMouseOut(event, d) {
      // Remove tooltip and restore fill color
      d3.select(this)
        .style('fill', '#C2FFC2'); // Restore the original fill color

      svg.select('#tooltip').remove();
    }
  };

  const handleResize = () => {
    const newWidth = window.innerWidth;
    const newHeight = 600; // You can adjust this as needed

    // Update the SVG width and height
    d3.select(mapRef.current)
      .select('svg')
      .attr('width', newWidth)
      .attr('height', newHeight);

    // Redraw the map with the updated dimensions
    drawMap(require('../assets/worldmap.json'));
  };

  return (
    <div className="map-container" ref={mapRef}>
      {/* SVG will be appended here */}
    </div>
  );
}

export default WorldMap;
