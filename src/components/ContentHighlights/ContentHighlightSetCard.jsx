import React from 'react';
import { Card } from '@edx/paragon';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';

import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { useContentHighlightsContext } from './data/hooks';

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
  const intl = useIntl();
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

    const itemText = intl.formatMessage({
      id: 'highlights.highlights.tab.highlight.card.item.count.text',
      defaultMessage: '{itemCount, plural, one {# item} other {# items}}',
      description: 'Item count text for a highlight set card',
    }, { itemCount });
    const archivedText = intl.formatMessage({
      id: 'highlights.highlights.tab.highlight.card.archived.item.count.text',
      defaultMessage: '{archivedItemCount, plural, one {# archived item} other {# archived items}}',
      description: 'Archived item count text for a highlight set card',
    }, { archivedItemCount });

    returnString = itemText;
    if (archivedItemCount > 0) {
      returnString = `${itemText} : ${archivedText}`;
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
