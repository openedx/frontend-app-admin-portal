import React from 'react';
import { Card } from '@edx/paragon';
import PropTypes from 'prop-types';

function ZeroStateCardText({ textContainerClassName, children }) {
  return (
    <Card.Section className={textContainerClassName}>
      {children}
    </Card.Section>
  );
}

ZeroStateCardText.propTypes = {
  textContainerClassName: PropTypes.string,
  children: PropTypes.node,
};

ZeroStateCardText.defaultProps = {
  textContainerClassName: 'text-center',
  children: null,
};

export default ZeroStateCardText;
