import React from 'react';
import { Link } from 'react-router-dom';

import H1 from '../../components/H1';

const HomePage = () => (
  <div className="container">
    <H1>Rockin&apos; the Home Page!</H1>
    <p>Blah blah blah blah</p>
    <Link to="/admin">Admin Dashboard</Link>
  </div>
);

export default HomePage;
