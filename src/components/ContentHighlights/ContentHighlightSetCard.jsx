import React from 'react';
import { Card } from '@edx/paragon';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { useContentHighlightsContext } from './data/hooks';

const ContentHighlightSetCard = ({
  imageCapSrc,
  title,
  highlightSetUUID,
  isPublished,
  enterpriseSlug,
  itemCount,
  trackEvent,
}) => {
  const history = useHistory();
  /* Stepper Draft Logic (See Hook) - Start */
  const { openStepperModal } = useContentHighlightsContext();
  /* Stepper Draft Logic (See Hook) - End */
  const handleHighlightSetClick = () => {
    if (isPublished) {
      trackEvent();
      // redirect to individual highlighted set based on uuid
      history.push(`/${enterpriseSlug}/admin/${ROUTE_NAMES.contentHighlights}/${highlightSetUUID}`);
      return;
    }
    openStepperModal();
  };

  return (
    <Card
      isClickable
      onClick={handleHighlightSetClick}
    >
      <Card.ImageCap src={imageCapSrc} srcAlt="" />
      <Card.Header title={title} />
      <Card.Section>
        {itemCount} items
      </Card.Section>
    </Card>
  );
};

ContentHighlightSetCard.propTypes = {
  title: PropTypes.string.isRequired,
  highlightSetUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  isPublished: PropTypes.bool.isRequired,
  itemCount: PropTypes.number.isRequired,
  imageCapSrc: PropTypes.string.isRequired,
  trackEvent: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentHighlightSetCard);
