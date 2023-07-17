import React from 'react';
import { Hyperlink } from '@edx/paragon';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const HelpCenterButton = ({
  variant,
  url,
  children,
  ...rest
}) => {
  const destinationUrl = url;

  return (
    <Hyperlink
      {...rest}
      target="_blank"
      className={classNames('btn', `btn-${variant}`)}
      destination={destinationUrl}
    >
      {children}
    </Hyperlink>
  );
};

HelpCenterButton.defaultProps = {
  children: 'Help Center',
  variant: 'outline-primary',
};

HelpCenterButton.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.string,
  url: PropTypes.string,
};

export default HelpCenterButton;
