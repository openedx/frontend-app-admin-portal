import React from 'react';
import PropTypes from 'prop-types';

const SettingsSSOTab = ({ enterpriseId }) => (
  <div className="d-flex">
    SSO Configuration for {enterpriseId}
  </div>
);

SettingsSSOTab.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default SettingsSSOTab;
