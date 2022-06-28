import React from 'react';
import { Hyperlink } from '@edx/paragon';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { configuration } from '../../config';

const ContactCustomerSupportButton = ({
  variant,
  children,
  onClick,
  ...rest
}) => {
  const destinationUrl = configuration.ENTERPRISE_SUPPORT_URL;

  // intercept click behavior, if provided, to give enough time for event
  // to dispatch since the hyperlink is to an external URL.
  const handleClick = (e) => {
    if (!onClick) {
      return;
    }
    e.preventDefault();
    onClick();
    setTimeout(() => {
      global.location.href = destinationUrl;
    }, 300);
  };
  return (
    <Hyperlink
      {...rest}
      target="_blank"
      className={classNames('btn', `btn-${variant}`)}
      destination={destinationUrl}
      onClick={handleClick}
    >
      {children}
    </Hyperlink>
  );
};

ContactCustomerSupportButton.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.string,
  onClick: PropTypes.func,
};

ContactCustomerSupportButton.defaultProps = {
  children: 'Contact support',
  variant: 'outline-primary',
  onClick: undefined,
};

export default ContactCustomerSupportButton;
