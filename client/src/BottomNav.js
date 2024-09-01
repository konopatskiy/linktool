import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNav.css'; // Import the CSS file for styling

const BottomNav = () => {
  return (
    <div className="bottom-nav">
      <NavLink to="/" exact activeClassName="active">
        Home
      </NavLink>
      <NavLink to="/products" activeClassName="active">
        Products
      </NavLink>
      <NavLink to="/import" activeClassName="active">
        Import CSV
      </NavLink>
    </div>
  );
};

export default BottomNav;