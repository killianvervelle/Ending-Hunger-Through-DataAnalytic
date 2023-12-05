import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import '../App.css';
import '../styles/Country.css'
import "../../node_modules/flag-icons/css/flag-icons.min.css";

export default function Country() {

  const [countryData, setCountryData] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        // TODO : replace link with ours

        const response = await fetch(`http://127.0.0.1:8000/nutritional-data-country/${id}`, { method: 'GET'} );
        if (response.ok) {
          const data = await response.json();
          console.log(data)
          setCountryData(data);
        } else {
          // Handle error or not found case
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
          {/* TODO: Add component for top left */}
        </div>
        <div className="bottom-left">
          {/* TODO: Add component for bottom left */}
        </div>
      </div>
      <div className="child-container">
        <div className="top-right">
          {/* TODO: Add component for top right */}
        </div>
      </div>
    </div>
  </div>
  );
}