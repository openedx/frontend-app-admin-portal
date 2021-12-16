import React from 'react';
import { Button } from '@edx/paragon';
import PropTypes from 'prop-types';

import { configuration } from '../../config';

const ContactCustomerSupportButton = (props) => (
  <Button
    {...props}
    target="_blank"
    rel="noopener noreferrer"
    as="a"
    href={configuration.ENTERPRISE_SUPPORT_URL}
  >
    {props.children}
  </Button>
);

ContactCustomerSupportButton.propTypes = {
  children: PropTypes.node,
};

ContactCustomerSupportButton.defaultProps = {
  children: 'Contact customer support',
};

export default ContactCustomerSupportButton;
