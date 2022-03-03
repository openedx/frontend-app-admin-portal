import React, { useState } from 'react';
import { Alert, Button } from '@edx/paragon';
import Cookies from 'universal-cookie';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { useHistory } from 'react-router-dom';
import { features } from '../../../config';
import {
  BROWSE_AND_REQUEST_ALERT_COOKIE_PREFIX,
  BROWSE_AND_REQUEST_ALERT_TEXT,
} from '../data/constants';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';
import { SETTINGS_TABS_VALUES } from '../../settings/data/constants';

const cookies = new Cookies();

/**
 * Generates string use to identify cookie
 * @param {string} enterpriseId
 * @returns {string} cookie name
 */
const generateBrowseAndRequestAlertCookieName = (enterpriseId) => `${BROWSE_AND_REQUEST_ALERT_COOKIE_PREFIX}-${enterpriseId}`;

const BrowseAndRequestAlert = ({ enterpriseId, enterpriseSlug }) => {
  const browseAndRequestAlertCookieName = generateBrowseAndRequestAlertCookieName(enterpriseId);
  const foundCookie = cookies.get(browseAndRequestAlertCookieName);

  const hideAlert = !features.FEATURE_BROWSE_AND_REQUEST || foundCookie;

  const [showAlert, setShowAlert] = useState(!hideAlert);

  /**
   * Closes alert and adds cookie
   */
  const handleClose = () => {
    setShowAlert(false);
    cookies.set(
      browseAndRequestAlertCookieName,
      true,
      { sameSite: 'strict' },
    );
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
          Go to settings
        </Button>,
      ]}
      dismissible
    >
      {BROWSE_AND_REQUEST_ALERT_TEXT}
    </Alert>
  );
};

BrowseAndRequestAlert.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(BrowseAndRequestAlert);
