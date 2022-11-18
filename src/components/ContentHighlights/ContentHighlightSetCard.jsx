import React, { useContext } from 'react';
import { Card } from '@edx/paragon';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { ContentHighlightsContext } from './ContentHighlightsContext';
import { toggleStepperModalAction } from './data/actions';

const ContentHighlightSetCard = ({
  imageCapSrc,
  title,
  highlightSetUUID,
  isPublished,
  enterpriseSlug,
  itemCount,
}) => {
  const history = useHistory();
  /* Stepper Draft Logic (See Hook) - Start */
  const { dispatch } = useContext(ContentHighlightsContext);
  /* Stepper Draft Logic (See Hook) - End */
  const handleHighlightSetClick = () => {
    if (isPublished) {
      // redirect to individual highlighted courses based on uuid
      return history.push(`/${enterpriseSlug}/admin/${ROUTE_NAMES.contentHighlights}/${highlightSetUUID}`);
    }
    return dispatch(toggleStepperModalAction({ isOpen: true }));
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
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentHighlightSetCard);
