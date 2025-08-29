import React from 'react';
import PropTypes from 'prop-types';
import { PageBanner, Icon } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';

const SystemWideWarningBanner = ({ children }) => (
  <PageBanner variant="warning">
    <Icon src={WarningFilled} className="mr-2" />
    {children}
  </PageBanner>
);

SystemWideWarningBanner.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SystemWideWarningBanner;
