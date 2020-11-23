import React from 'react';
import PropTypes from 'prop-types';

import './Hero.scss';

import { configuration } from '../../config';

const edxWhiteSemiTransparentLogo = configuration.LOGO_WHITE_URL;

const Hero = props => (
  <div className="hero py-4 pt-md-5 pb-md-0">
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 col-md-9 mb-2 mb-md-1">
          <h1>{props.title}</h1>
        </div>
        <div className="col-12 col-md-3 text-md-right mt-2">
          <img src={edxWhiteSemiTransparentLogo} alt="edX logo" />
        </div>
      </div>
    </div>
  </div>
);

Hero.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Hero;
