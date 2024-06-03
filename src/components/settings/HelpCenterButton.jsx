import React from 'react';
import { Hyperlink } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

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
  children: (
    <FormattedMessage
      id="adminPortal.settings.learningPlatformTab.helpCenter.button"
      defaultMessage="Help Center"
      description="Default text for the Help Center button"
    />
  ),
};

HelpCenterButton.propTypes = {
  children: PropTypes.node,
  url: PropTypes.string,
};

export default HelpCenterButton;
