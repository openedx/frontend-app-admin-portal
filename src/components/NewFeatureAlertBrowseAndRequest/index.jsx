import React, { useState } from 'react';
import { Alert, Button } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import {
  BROWSE_AND_REQUEST_ALERT_COOKIE_PREFIX,
  BROWSE_AND_REQUEST_ALERT_TEXT,
  REDIRECT_SETTINGS_BUTTON_TEXT,
} from '../subscriptions/data/constants';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { SETTINGS_TABS_VALUES } from '../settings/data/constants';

/**
 * Generates string use to identify cookie
 * @param {string} enterpriseId
 * @returns {string} cookie name
 */
export const generateBrowseAndRequestAlertCookieName = (enterpriseId) => `${BROWSE_AND_REQUEST_ALERT_COOKIE_PREFIX}-${enterpriseId}`;

const NewFeatureAlertBrowseAndRequest = ({ enterpriseId, enterpriseSlug }) => {
  const browseAndRequestAlertCookieName = generateBrowseAndRequestAlertCookieName(enterpriseId);
  const hideAlert = global.localStorage.getItem(browseAndRequestAlertCookieName);

  const [showAlert, setShowAlert] = useState(!hideAlert);

  /**
   * Closes alert and adds cookie
   */
  const handleClose = () => {
    setShowAlert(false);
    global.localStorage.setItem(browseAndRequestAlertCookieName, true);
  };

  const history = useHistory();
  /**
   * Redirects user to settings page, access tab
   */
  const handleGoToSettings = () => {
    history.push({ pathname: `/${enterpriseSlug}/admin/${ROUTE_NAMES.settings}/${SETTINGS_TABS_VALUES.access}` });
  };

  return (
    <Alert
      show={showAlert}
      onClose={handleClose}
      variant="info"
      actions={[
        <Button onClick={handleGoToSettings} variant="outline-primary">
          {REDIRECT_SETTINGS_BUTTON_TEXT}
        </Button>,
      ]}
      dismissible
    >
      {BROWSE_AND_REQUEST_ALERT_TEXT}
    </Alert>
  );
};

NewFeatureAlertBrowseAndRequest.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(NewFeatureAlertBrowseAndRequest);
