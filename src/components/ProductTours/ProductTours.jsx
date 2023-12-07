import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { ProductTour } from '@edx/paragon';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { getConfig } from '@edx/frontend-platform/config';
import browseAndRequestTour from './browseAndRequestTour';
import { features } from '../../config';
import portalAppearanceTour from './portalAppearanceTour';
import learnerCreditTour from './learnerCreditTour';
import highlightsTour from './highlightsTour';
import { disableAll, filterCheckpoints } from './data/utils';

import {
  useBrowseAndRequestTour, usePortalAppearanceTour, useLearnerCreditTour, useHighlightsTour,
} from './data/hooks';
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
  enableLearnerPortal,
}) => {
  const { FEATURE_CONTENT_HIGHLIGHTS } = getConfig();
  const [tours, setTours] = useState([]);
  const enablePortalAppearance = features.SETTINGS_PAGE_APPEARANCE_TAB;
  const history = useHistory();
  const enabledFeatures = {
    [PORTAL_APPEARANCE_TOUR_COOKIE_NAME]: usePortalAppearanceTour({ enablePortalAppearance })[0],
    [BROWSE_AND_REQUEST_TOUR_COOKIE_NAME]: useBrowseAndRequestTour({ enableLearnerPortal })[0],
    [LEARNER_CREDIT_COOKIE_NAME]: useLearnerCreditTour()[0],
    [HIGHLIGHTS_COOKIE_NAME]: useHighlightsTour(FEATURE_CONTENT_HIGHLIGHTS)[0],
  };
  console.log(enabledFeatures, 'step 1 product tour, enabledFeatures')
  const newFeatureTourCheckpoints = {
    [PORTAL_APPEARANCE_TOUR_COOKIE_NAME]: portalAppearanceTour({
      enterpriseSlug,
      history,
    }),
    [BROWSE_AND_REQUEST_TOUR_COOKIE_NAME]: browseAndRequestTour({
      enterpriseSlug,
      history,
    }),
    [LEARNER_CREDIT_COOKIE_NAME]: learnerCreditTour({
      enterpriseSlug,
      history,
    }),
    [HIGHLIGHTS_COOKIE_NAME]: highlightsTour({
      enterpriseSlug,
      history,
    }),
  };
  console.log(newFeatureTourCheckpoints, 'step 2 product tour, newFeatureTourCheckpoints')

  useEffect(() => {
    if (tours.length === 0) {
      const checkpointsArray = filterCheckpoints(newFeatureTourCheckpoints, enabledFeatures);
      setTours([{
        tourId: 'newFeatureTour',
        advanceButtonText: 'Next',
        dismissButtonText: 'Dismiss',
        endButtonText: 'End',
        enabled: checkpointsArray?.length > 0,
        onEnd: () => disableAll(),
        checkpoints: checkpointsArray,
      }]);
    }
  }, [enabledFeatures, newFeatureTourCheckpoints, tours.length]);

  return (
    <ProductTour
      tours={tours}
    />
  );
};

ProductTours.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
});

export default connect(mapStateToProps)(ProductTours);
