import React from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';

import { useStylesForCustomBrandColors } from '../settings/data/hooks';

function BrandStyles({
  enterpriseBranding,
}) {
  const brandStyles = useStylesForCustomBrandColors(enterpriseBranding);

  return (
    <Helmet>
      <style key={brandStyles.key} type="text/css">{brandStyles.styles}</style>
    </Helmet>
  );
}

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
