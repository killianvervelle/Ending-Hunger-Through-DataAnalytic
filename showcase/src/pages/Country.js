import React, { useEffect } from 'react';

import '../App.css';
import '../styles/Country.css'
import "../../node_modules/flag-icons/css/flag-icons.min.css";

export default function Country() {

  const mockData = {
    id : "12",
    iso2 : "af",
    iso3 : 'afg',
    name : 'Afghanistan'
  }

    return (
        <div className="page-container">
          <div className="country-container">
          <span className={`fi fi-${mockData.iso2}`}></span>
            <h1 className="country-name">{mockData.name}</h1>
          </div>

          <div className="grid-container">
            <div className="top-left">
              {/* TODO: Add component for top left */}
            </div>
    
            <div className="top-right">
              {/* TODO: Add component for top right */}
            </div>
    
            <div className="bottom-left">
              {/* TODO: Add component for bottom left */}
            </div>
    
            <div className="bottom-right">
              {/* TODO: Add component for bottom right */}
            </div>
          </div>
        </div>
      );
}