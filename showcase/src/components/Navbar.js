// components/Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Styles
import '../styles/Navbar.css';

const Navbar = () => {
  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  return (
    <>
      <nav className='navbar'>
        <div className='navbar-container'>
          <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
            <p class="navbar-text">Epidemiology of malnutrition</p>
            <i className='fab fa-typo3' />
          </Link>
          <div className='menu-icon' onClick={handleClick}>
            <i className={click ? 'fa fa-times' : 'fa fa-bars'} />
          </div>
          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            <li className='nav-item'>
              <Link to='/' className='nav-links' onClick={closeMobileMenu}>
                Home
              </Link>
              </li>
            <li className='nav-item'>
              <Link to='/firstpage' className='nav-links' onClick={closeMobileMenu}>
                Page 1
              </Link>
            </li>
            <li className='nav-item'>
              <Link to='/secondpage' className='nav-links' onClick={closeMobileMenu}>
                Page 2
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
