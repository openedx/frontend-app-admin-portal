import React from 'react';
import { Card } from '@openedx/paragon';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { useContentHighlightsContext } from './data/hooks';
import { makePlural } from '../../utils';

const ContentHighlightSetCard = ({
  imageCapSrc,
  title,
  highlightSetUUID,
  isPublished,
  enterpriseSlug,
  itemCount,
  archivedItemCount,
  onClick,
}) => {
  const navigate = useNavigate();
  /* Stepper Draft Logic (See Hook) - Start */
  const { openStepperModal } = useContentHighlightsContext();
  /* Stepper Draft Logic (See Hook) - End */
  const handleHighlightSetClick = () => {
    if (isPublished) {
      onClick();
      // redirect to individual highlighted set based on uuid
      navigate(`/${enterpriseSlug}/admin/${ROUTE_NAMES.contentHighlights}/${highlightSetUUID}`);
      return;
    }
    openStepperModal();
  };

  const cardItemText = () => {
    let returnString = '';
    returnString += makePlural(itemCount, 'item');
    if (archivedItemCount > 0) {
      returnString += ` : ${makePlural(archivedItemCount, 'archived item')}`;
    }
    return returnString;
  };

  return (
    <Card
      isClickable
      onClick={handleHighlightSetClick}
      data-testid="highlight-set-card"
    >
      <Card.ImageCap src={imageCapSrc} srcAlt="" />
      <Card.Header title={title} />
      <Card.Section>
        {cardItemText()}
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
  archivedItemCount: PropTypes.number.isRequired,
  imageCapSrc: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentHighlightSetCard);
