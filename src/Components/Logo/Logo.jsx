import React from 'react';
import logo from '../../assets/logo1.png.png'; // adjust the path to match your file structure

function Logo() {
  return (
    <img 
      src={logo} 
      alt="Logo" 
      className="w-12 h-12 rounded-full opacity-80 transition-opacity duration-300 hover:opacity-100" 
    />
  );
}

export default Logo;