import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ProductTour } from '@edx/paragon';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
// import { getConfig } from '@edx/frontend-platform/config';
import Cookies from 'universal-cookie';
import browseAndRequestTour from './browseAndRequestTour';
// import { features } from '../../config';
import portalAppearanceTour from './portalAppearanceTour';
import learnerCreditTour from './learnerCreditTour';
import highlightsTour from './highlightsTour';
// import {
//   useBrowseAndRequestTour, usePortalAppearanceTour, useLearnerCreditTour, useHighlightsTour,
// } from './data/hooks';
import {
  PORTAL_APPEARANCE_TOUR_COOKIE_NAME,
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  LEARNER_CREDIT_COOKIE_NAME,
  HIGHLIGHTS_COOKIE_NAME,
} from './constants';
/**
 * All the logic here is for determining what ProductTours we should show.
 * All actual tour specific logic/content should live within the separate tour files.
 */
const ProductTours = ({
  enterpriseSlug,
  // enableLearnerPortal,
}) => {
  // Commented out while determining how to handle multiple tours in current implementation
  // const { FEATURE_CONTENT_HIGHLIGHTS } = getConfig();
  // const [browseAndRequestTourEnabled] = useBrowseAndRequestTour({
  //   enableLearnerPortal,
  // });
  // const [learnerCreditTourEnabled] = useLearnerCreditTour();
  // const enablePortalAppearance = features.SETTINGS_PAGE_APPEARANCE_TAB;
  // const [portalAppearanceTourEnabled] = usePortalAppearanceTour({
  //   enablePortalAppearance,
  // });
  // const [highlightsTourEnabled] = useHighlightsTour(
  //   FEATURE_CONTENT_HIGHLIGHTS,
  // );
  const [isTourOpen] = useState(true);
  const history = useHistory();
  const test = new Cookies().getAll();

  const filterRegex = new RegExp(`(?:${PORTAL_APPEARANCE_TOUR_COOKIE_NAME}|${BROWSE_AND_REQUEST_TOUR_COOKIE_NAME}|${LEARNER_CREDIT_COOKIE_NAME}|${HIGHLIGHTS_COOKIE_NAME})`, 'g');
  const checkpoint = {
    [PORTAL_APPEARANCE_TOUR_COOKIE_NAME]: portalAppearanceTour({
      enterpriseSlug,
      tourEnabled: false,
      history,
    }),
    [BROWSE_AND_REQUEST_TOUR_COOKIE_NAME]: browseAndRequestTour({
      enterpriseSlug,
      tourEnabled: false,
      history,
    }),
    [LEARNER_CREDIT_COOKIE_NAME]: learnerCreditTour({
      enterpriseSlug,
      tourEnabled: false,
      history,
    }),
    [HIGHLIGHTS_COOKIE_NAME]: highlightsTour({
      enterpriseSlug,
      tourEnabled: false,
      history,
    }),
  };
  const x = Object.entries(test).filter(item => item[0].match(filterRegex)).map(item => item[0]);
  let xx = 0;
  const y = Object.keys(checkpoint).filter(item => item !== x[xx++]).map(item => checkpoint[item]);

  const tours = [{
    tourID: 'a',
    advanceButtonText: 'Next',
    dismissButtonText: 'Dismiss',
    endButtonText: 'End',
    enabled: isTourOpen,
    checkpoints: y,
  }];
  return (
    <ProductTour
      tours={tours}
    />
  );
};

ProductTours.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  // enableLearnerPortal: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  // enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
});

export default connect(mapStateToProps)(ProductTours);
