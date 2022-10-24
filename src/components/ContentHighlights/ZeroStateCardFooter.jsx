import React from 'react';
import { Card } from '@edx/paragon';
import PropTypes from 'prop-types';

const ZeroStateCardFooter = ({ footerClassNames, children }) => (
  <Card.Footer className={footerClassNames}>
    {children}
  </Card.Footer>
);

ZeroStateCardFooter.propTypes = {
  footerClassNames: PropTypes.string,
  children: PropTypes.node,
};

ZeroStateCardFooter.defaultProps = {
  footerClassNames: '',
  children: null,
};

export default ZeroStateCardFooter;
