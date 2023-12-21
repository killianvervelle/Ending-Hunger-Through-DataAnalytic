import React, { useEffect } from 'react';

import { useLocation } from 'react-router-dom';
import WorldMap from '../components/WorldMap';
import Legend from '../components/Legend';

import '../App.css';

import '../styles/Legends.css'

function Home() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when the route changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <>
    <div className='home-container'>
    <div className="black-container">
      <h1>Title</h1><br/>
        <p>
          This is your context description. You can write any content here that provides additional context for your website.
        </p>
      </div>
      <div className='main-map-container'>
        <WorldMap />
        <Legend />
      </div>
    </div>
    
      
    </>
  );
}

export default Home;