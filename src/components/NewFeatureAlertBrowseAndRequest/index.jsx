import React, { useState } from 'react';
import { Alert, Button } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import {
  BROWSE_AND_REQUEST_ALERT_COOKIE_PREFIX,
} from '../subscriptions/data/constants';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { ACCESS_TAB } from '../settings/data/constants';

/**
 * Generates string use to identify cookie
 * @param {string} enterpriseId
 * @returns {string} cookie name
 */
export const generateBrowseAndRequestAlertCookieName = (enterpriseId) => `${BROWSE_AND_REQUEST_ALERT_COOKIE_PREFIX}-${enterpriseId}`;

const NewFeatureAlertBrowseAndRequest = ({ enterpriseId, enterpriseSlug, intl }) => {
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

  const navigate = useNavigate();
  /**
   * Redirects user to settings page, access tab
   */
  const handleGoToSettings = () => {
    navigate(`/${enterpriseSlug}/admin/${ROUTE_NAMES.settings}/${ACCESS_TAB}`);
  };

  return (
    <Alert
      show={showAlert}
      onClose={handleClose}
      variant="info"
      actions={[
        <Button onClick={handleGoToSettings} variant="outline-primary">
          {intl.formatMessage({
            id: 'admin.portal.new.feature.alert.go.to.settings.button',
            defaultMessage: 'Go to settings',
            description: 'Button text to navigate to settings page.',
          })}
        </Button>,
      ]}
      dismissible={intl.formatMessage({
        id: 'admin.portal.new.feature.alert.dismissible.text',
        defaultMessage: 'Dismiss',
        description: 'Text for dismissible alert.',
      })}
    >
      {intl.formatMessage({
        id: 'admin.portal.new.feature.alert.text',
        defaultMessage: 'New! You can now allow all learners to browse your catalog and request enrollment to courses.',
        description: 'Text for the new feature alert allowing learners to browse and request enrollment.',
      })}
    </Alert>
  );
};

NewFeatureAlertBrowseAndRequest.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(injectIntl(NewFeatureAlertBrowseAndRequest));
