import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ProductTour } from '@edx/paragon';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import Cookies from 'universal-cookie';

import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import { SETTINGS_TABS_VALUES } from '../settings/data/constants';
import { features } from '../../config';
import {
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  TOUR_TARGETS,
} from './constants';

const cookies = new Cookies();

const BrowseAndRequestTour = ({ enterpriseSlug, enableBrowseAndRequest }) => {
  const isFeatureEnabled = features.FEATURE_BROWSE_AND_REQUEST && enableBrowseAndRequest;

  const history = useHistory();
  const inSettingsPage = history.location.pathname.split('/')[3] === ROUTE_NAMES.settings;

  const dismissedTourCookie = cookies.get(BROWSE_AND_REQUEST_TOUR_COOKIE_NAME);

  // only show tour if feature is enabled, hide cookie is undefined or false and not in settings page
  const showTour = isFeatureEnabled && !dismissedTourCookie && !inSettingsPage;

  if (!showTour) {
    return null;
  }

  const [tourEnabled, setTourEnabled] = useState(showTour);

  const disableTour = () => {
    cookies.set(
      BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
      true,
      { sameSite: 'strict' },
    );
  };

  const handleDismissTour = () => {
    disableTour();
    setTourEnabled(false);
  };

  const handleGoToSettings = () => {
    disableTour();
    history.push({ pathname: `/${enterpriseSlug}/admin/${ROUTE_NAMES.settings}/${SETTINGS_TABS_VALUES.access}` });
  };

  const tour = {
    tourId: 'BrowseAndRequestTour',
    endButtonText: 'Continue To Settings',
    dismissButtonText: 'Dismiss',
    enabled: tourEnabled,
    onDismiss: handleDismissTour,
    onEnd: handleGoToSettings,
    checkpoints: [
      {
        placement: 'right',
        body: 'We’ve recently added a Settings feature where you can manage on-demand '
          + 'browsing for the learners and configurations. Continue to Settings to learn more.',
        target: `#${TOUR_TARGETS.SETTINGS_SIDEBAR}`,
        title: 'New Feature',
        showDismissButton: true,
      },
    ],
  };

  return (
    <ProductTour
      tours={[tour]}
    />
  );
};

BrowseAndRequestTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  enableBrowseAndRequest: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableBrowseAndRequest: state.portalConfiguration.enableBrowseAndRequest,
});

export default connect(mapStateToProps)(BrowseAndRequestTour);
