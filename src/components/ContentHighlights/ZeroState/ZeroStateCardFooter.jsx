import React from 'react';
import { Card } from '@openedx/paragon';
import PropTypes from 'prop-types';

const ZeroStateCardFooter = ({ footerClassName, children }) => (
  <Card.Footer className={footerClassName}>
    {children}
  </Card.Footer>
);

ZeroStateCardFooter.propTypes = {
  footerClassName: PropTypes.string,
  children: PropTypes.node,
};

ZeroStateCardFooter.defaultProps = {
  footerClassName: undefined,
  children: null,
};

export default ZeroStateCardFooter;
