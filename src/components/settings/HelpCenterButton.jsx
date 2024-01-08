import React from 'react';
import { Hyperlink } from '@edx/paragon';
import PropTypes from 'prop-types';

const HelpCenterButton = ({
  url,
  children,
  ...rest
}) => {
  const destinationUrl = url;

  return (
    <Hyperlink
      {...rest}
      target="_blank"
      className="btn btn-outline-primary side-button"
      destination={destinationUrl}
    >
      {children}
    </Hyperlink>
  );
};

HelpCenterButton.defaultProps = {
  children: 'Help Center',
};

HelpCenterButton.propTypes = {
  children: PropTypes.node,
  url: PropTypes.string,
};

export default HelpCenterButton;
