import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Color from 'color';
import { SCHOLAR_THEME } from '../settings/data/constants';

import { configuration } from '../../config';

const Hero = ({ title, enterpriseBranding }) => {
  const edxWhiteSemiTransparentLogo = configuration.LOGO_WHITE_URL;
  const edxLogoDark = configuration.LOGO_URL;

  const color = Color(enterpriseBranding.secondary_color);
  const logo = color.isDark() ? edxWhiteSemiTransparentLogo : edxLogoDark;

  return (
    <div
      className="hero"
      style={{
        backgroundColor: 'var(--pgn-color-hero-bg)',
        borderColor: 'var(--pgn-color-hero-border-color)',
      }}
    >
      <div>
        <h1 style={{ color: 'var(--pgn-color-hero-text-color)' }}>{title}</h1>
      </div>
      <div>
        <img src={logo} alt="edX logo" />
      </div>
    </div>
  );
};

Hero.defaultProps = {
  enterpriseBranding: {
    secondary_color: SCHOLAR_THEME.banner,
  },
};

Hero.propTypes = {
  title: PropTypes.string.isRequired,
  enterpriseBranding: PropTypes.shape({
    secondary_color: PropTypes.string,
  }),
};

const mapStateToProps = state => ({
  enterpriseBranding: state.portalConfiguration.enterpriseBranding,
});

export default connect(mapStateToProps)(Hero);
