import React from 'react';
import { Card } from '@openedx/paragon';
import PropTypes from 'prop-types';

const ZeroStateCardText = ({ textContainerClassName, children }) => (
  <Card.Section className={textContainerClassName}>
    {children}
  </Card.Section>
);

ZeroStateCardText.propTypes = {
  textContainerClassName: PropTypes.string,
  children: PropTypes.node,
};

ZeroStateCardText.defaultProps = {
  textContainerClassName: 'text-center',
  children: null,
};

export default ZeroStateCardText;
