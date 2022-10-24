import React from 'react';
import { Card } from '@edx/paragon';
import PropTypes from 'prop-types';

const ZeroStateCardText = ({ textContainerClassNames, children }) => (
  <Card.Section className={textContainerClassNames}>
    {children}
  </Card.Section>
);

ZeroStateCardText.propTypes = {
  textContainerClassNames: PropTypes.string,
  children: PropTypes.node,
};

ZeroStateCardText.defaultProps = {
  textContainerClassNames: 'text-center',
  children: null,
};

export default ZeroStateCardText;
