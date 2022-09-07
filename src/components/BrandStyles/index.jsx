import React from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';

import { useStylesForCustomBrandColors } from '../settings/data/hooks';

const BrandStyles = ({
  enterpriseBranding,
}) => {
  const brandStyles = useStylesForCustomBrandColors(enterpriseBranding);

  return (
    <Helmet>
      {brandStyles.map(({ key, styles }) => (
        <style key={key} type="text/css">{styles}</style>
      ))}
    </Helmet>
  );
};

BrandStyles.defaultProps = {
  enterpriseBranding: null,
};

BrandStyles.propTypes = {
  enterpriseBranding: PropTypes.shape({
    enterpriseId: PropTypes.string,
    logo: PropTypes.string,
    primary_color: PropTypes.string,
    secondary_color: PropTypes.string,
    tertiary_color: PropTypes.string,
  }),
};

export default BrandStyles;
