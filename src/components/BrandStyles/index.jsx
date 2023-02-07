import React from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';

import {
  useEnterpriseThemeVariables,
} from '../settings/data/hooks';

const BrandStyles = ({
  enterpriseBranding,
}) => {
  const {
    isLoadingThemeCSS,
    themeCSS,
  } = useEnterpriseThemeVariables(enterpriseBranding);

  if (isLoadingThemeCSS) {
    return null;
  }

  return (
    <Helmet>
      <style>{themeCSS}</style>
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
