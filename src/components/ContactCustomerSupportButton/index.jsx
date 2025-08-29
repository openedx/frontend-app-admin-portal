import React from 'react';
import { Hyperlink } from '@openedx/paragon';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { configuration } from '../../config';

const ContactCustomerSupportButton = ({
  variant,
  children,
  ...rest
}) => {
  const destinationUrl = configuration.ENTERPRISE_SUPPORT_URL;

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

ContactCustomerSupportButton.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.string,
};

ContactCustomerSupportButton.defaultProps = {
  children: (
    <FormattedMessage
      id="admin.portal.contact.support.button.label"
      defaultMessage="Contact support"
      description="Label for the 'Contact support' button in the admin portal."
    />
  ),
  variant: 'outline-primary',
};

export default ContactCustomerSupportButton;
