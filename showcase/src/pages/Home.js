import React from 'react';

import WorldMap from '../components/WorldMap';
import Legend from '../components/Legend';

import '../App.css';

import '../styles/Legends.css'

function Home() {
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