import React from 'react';

import PropTypes from 'prop-types';
import {
  IconButton, Icon, ProductTour, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import { Question } from '@openedx/paragon/icons';
import { connect } from 'react-redux';
import { getConfig } from '@edx/frontend-platform/config';
import { useIntl } from '@edx/frontend-platform/i18n';
import { features } from '../../config';
import portalAppearanceTour from './portalAppearanceTour';
import learnerCreditTour from './learnerCreditTour';
import learnerDetailPageTour from './learnerDetailPageTour';
import highlightsTour from './highlightsTour';
import browseAndRequestTour from './browseAndRequestTour';
import { disableAll, filterCheckpoints } from './data/utils';
import highlightsTour from './highlightsTour';
import messages from './messages';
import learnerCreditTour from './learnerCreditTour';
import portalAppearanceTour from './portalAppearanceTour';

import {
  useBrowseAndRequestTour, usePortalAppearanceTour, useLearnerCreditTour, useHighlightsTour,
  useLearnerDetailPageTour,
} from './data/hooks';
import {
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  HIGHLIGHTS_COOKIE_NAME,
  LEARNER_CREDIT_COOKIE_NAME,
  LEARNER_DETAIL_PAGE_COOKIE_NAME,
  PORTAL_APPEARANCE_TOUR_COOKIE_NAME,
} from './constants';
/**
 * All the logic here is for determining what ProductTours we should show.
 * All actual tour specific logic/content should live within the separate tour files.
 */
const ProductTours = ({
  enableLearnerPortal,
  enterpriseSlug,
  enterpriseFeatures,
}) => {
  const intl = useIntl();
  const { FEATURE_CONTENT_HIGHLIGHTS } = getConfig();
  const enablePortalAppearance = features.SETTINGS_PAGE_APPEARANCE_TAB;
  const enabledFeatures = {
    [BROWSE_AND_REQUEST_TOUR_COOKIE_NAME]: useBrowseAndRequestTour(enableLearnerPortal),
    [HIGHLIGHTS_COOKIE_NAME]: useHighlightsTour(FEATURE_CONTENT_HIGHLIGHTS),
    [LEARNER_CREDIT_COOKIE_NAME]: useLearnerCreditTour(),
    [LEARNER_DETAIL_PAGE_COOKIE_NAME]: useLearnerDetailPageTour(enterpriseFeatures),
    [PORTAL_APPEARANCE_TOUR_COOKIE_NAME]: usePortalAppearanceTour(enablePortalAppearance),
  };
  const newFeatureTourCheckpoints = {
    [BROWSE_AND_REQUEST_TOUR_COOKIE_NAME]: browseAndRequestTour({ enterpriseSlug }),
    [HIGHLIGHTS_COOKIE_NAME]: highlightsTour({ enterpriseSlug }),
    [LEARNER_CREDIT_COOKIE_NAME]: learnerCreditTour({ enterpriseSlug }),
    [LEARNER_DETAIL_PAGE_COOKIE_NAME]: learnerDetailPageTour({ enterpriseSlug }),
    [PORTAL_APPEARANCE_TOUR_COOKIE_NAME]: portalAppearanceTour({ enterpriseSlug }),
  };
  const checkpointsArray = filterCheckpoints(newFeatureTourCheckpoints, enabledFeatures);
  const tours = [{
    tourId: 'newFeatureTour',
    dismissButtonText: 'Dismiss',
    enabled: checkpointsArray?.length > 0,
    onEnd: () => disableAll(),
    checkpoints: checkpointsArray,
  }];

  return (
    <div className="product-tours">
      <ProductTour
        tours={tours}
      />
      {/* <FloatingOverlay minimizable draggable>
        <ProductToursChecklist tours={tours} />
      </FloatingOverlay> */}
      <OverlayTrigger
        placement="left"
        overlay={(
          <Tooltip id="product-tours-question-icon-tooltip">
            {/* TODO: Translate */}
            {intl.formatMessage(messages.questionIconTooltip)}
          </Tooltip>
      )}
      >
        <IconButton
          src={Question}
          className="info-button bottom-right-fixed"
          iconAs={Icon}
          alt="More details"
          size="lg"
        />
      </OverlayTrigger>
    </div>
  );
};

ProductTours.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  enterpriseFeatures: PropTypes.shape({
    enableGroupsV2: PropTypes.bool,
  }).isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ProductTours);
