import React, { useState, useEffect } from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';

import { useCustomBrandColors } from '../settings/data/hooks';

const BrandStyles = ({
  enterpriseBranding,
  children,
}) => {
  const [isLoadingBrandStyles, setIsLoadingBrandStyles] = useState(true);
  const [brandStyles, setBrandStyles] = useState();

  const brandColors = useCustomBrandColors(enterpriseBranding);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        setIsLoadingBrandStyles(true);
        const response = await fetch('http://localhost:3000/tokens', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            color: {
              primary: {
                base: {
                  value: brandColors.primary.regular.hex(),
                },
              },
              hero: {
                bg: {
                  value: brandColors.secondary.regular.hex(),
                },
                text: {
                  color: {
                    value: '{color.hero.bg}',
                    modify: [{ type: 'color-yiq' }],
                  },
                },
                border: {
                  color: {
                    value: brandColors.tertiary.regular.hex(),
                  },
                },
              },
            },
          }),
        });
        const {
          success,
          cssOutput,
        } = await response.json();
        if (success) {
          setBrandStyles(cssOutput);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingBrandStyles(false);
      }
    };
    fetchTheme();
  }, [brandColors]);

  return (
    <>
      {brandStyles && (
        <Helmet>
          <style type="text/css">{brandStyles}</style>
        </Helmet>
      )}
      {children}
    </>
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
