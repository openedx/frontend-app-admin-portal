import React, {
  useMemo, useContext,
} from 'react';
import { Card, Badge, Stack } from '@edx/paragon';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import { HIGHLIGHT_CARD_BADGE_STATUS } from './data/constants';
import { ContentHighlightsContext } from './ContentHighlightsContext';

const ContentHighlightSetCard = ({
  title, highlightUUID, isPublished, enterpriseSlug,
}) => {
  const history = useHistory();
  /* Stepper Draft Logic (See Hook) - Start */
  const {
    setIsModalOpen,
  } = useContext(ContentHighlightsContext);
  /* Stepper Draft Logic (See Hook) - End */
  const handleHighlightSetClick = () => {
    if (isPublished) {
      // redirect to individual highlighted courses based on uuid
      return history.push(`/${enterpriseSlug}/admin/${ROUTE_NAMES.contentHighlights}/${highlightUUID}`);
    }
    return setIsModalOpen(true);
  };
  // TODO: Bring logic one level up to abstract different sections for draft vs published
  const badgeData = useMemo(() => ({
    variant: isPublished ? HIGHLIGHT_CARD_BADGE_STATUS.PUBLISHED.variant : HIGHLIGHT_CARD_BADGE_STATUS.DRAFT.variant,
    label: isPublished ? HIGHLIGHT_CARD_BADGE_STATUS.PUBLISHED.label : HIGHLIGHT_CARD_BADGE_STATUS.DRAFT.label,
  }), [isPublished]);
  return (
    <Card
      isClickable
      onClick={handleHighlightSetClick}
    >
      <Stack className="justify-content-between p-4" direction="horizontal">
        <Card.Header
          className="p-0"
          title={title}
        />
        <Badge className="align-self-end" variant={badgeData.variant}>
          {badgeData.label}
        </Badge>
      </Stack>
    </Card>
  );
};

ContentHighlightSetCard.propTypes = {
  title: PropTypes.string.isRequired,
  highlightUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  isPublished: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentHighlightSetCard);
