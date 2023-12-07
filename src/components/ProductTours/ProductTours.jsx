import React, { useEffect, useMemo, useState } from 'react';
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

  const portalAppearance = usePortalAppearanceTour({ enablePortalAppearance });
  const browseAndRequest = useBrowseAndRequestTour({ enableLearnerPortal });
  const learnerCredit = useLearnerCreditTour();
  const highlightTour = useHighlightsTour(FEATURE_CONTENT_HIGHLIGHTS);

  const enabledFeatures = useMemo(() => ({
    [PORTAL_APPEARANCE_TOUR_COOKIE_NAME]: portalAppearance,
    [BROWSE_AND_REQUEST_TOUR_COOKIE_NAME]: browseAndRequest,
    [LEARNER_CREDIT_COOKIE_NAME]: learnerCredit,
    [HIGHLIGHTS_COOKIE_NAME]: highlightTour,
  }), [browseAndRequest, highlightTour, learnerCredit, portalAppearance]);

  const newFeatureTourCheckpoints = useMemo(() => ({
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
  }), [enterpriseSlug, history]);

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
