import React from 'react';
import { Hyperlink } from '@edx/paragon';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { configuration } from '../../config';

const ContactCustomerSupportButton = ({ variant, children, ...rest }) => (
  <Hyperlink
    {...rest}
    target="_blank"
    className={classNames('btn', `btn-${variant}`)}
    destination={configuration.ENTERPRISE_SUPPORT_URL}
  >
    {children}
  </Hyperlink>
);

ContactCustomerSupportButton.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.string,
};

ContactCustomerSupportButton.defaultProps = {
  children: 'Contact support',
  variant: 'outline-primary',
};

export default ContactCustomerSupportButton;
