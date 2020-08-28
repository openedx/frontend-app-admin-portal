import React from 'react';
import PropTypes from 'prop-types';

import H1 from '../../components/H1';

import edXLogoForBanner from '../../images/edx-logo-for-banner.png';
import './Hero.scss';

const Hero = props => (
  <div className="hero py-4 pt-md-5 pb-md-0">
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 col-md-9 mb-2 mb-md-1">
          <H1>{props.title}</H1>
        </div>
        <div className="col-12 col-md-3 text-md-right mt-2">
          <img src={edXLogoForBanner} alt="edX logo" />
        </div>
      </div>
    </div>
  </div>
);

Hero.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Hero;
