import React from 'react';
import { Card } from '@edx/paragon';
import Truncate from 'react-truncate';
import PropTypes from 'prop-types';
import { FOOTER_TEXT_BY_CONTENT_TYPE } from './data/constants';

const ContentHighlightCardItem = ({
  title,
  contentType,
  partners,
  cardImageUrl,
  extras,
}) => {
  const cardLogoSrc = partners?.length === 1 ? partners[0].logoImageUrl : undefined;
  const cardLogoAlt = partners?.length === 1 ? `${partners[0].name}'s logo` : undefined;
  const cardSubtitle = partners?.map(p => p.name).join(', ');
  const cardFooter = extras?.firstEnrollablePaidSeatPrice ? `$${extras.firstEnrollablePaidSeatPrice} · ${FOOTER_TEXT_BY_CONTENT_TYPE[contentType.toLowerCase()]}` : FOOTER_TEXT_BY_CONTENT_TYPE[contentType.toLowerCase()];
  return (
    <Card>
      <Card.ImageCap
        src={cardImageUrl}
        srcAlt=""
        logoSrc={cardLogoSrc}
        logoAlt={cardLogoAlt}
      />
      <Card.Header
        title={<Truncate lines={3} title={title}>{title}</Truncate>}
        subtitle={<Truncate lines={2} title={cardSubtitle}>{cardSubtitle}</Truncate>}
      />
      {contentType && (
        <>
          <Card.Section />
          <Card.Footer
            textElement={cardFooter}
          />
        </>
      )}
    </Card>
  );
};

ContentHighlightCardItem.propTypes = {
  cardImageUrl: PropTypes.string,
  title: PropTypes.string.isRequired,
  contentType: PropTypes.oneOf(['course', 'program', 'learnerpathway']).isRequired,
  partners: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    uuid: PropTypes.string,
    logoImageUrl: PropTypes.string,
  })).isRequired,
  extras: PropTypes.shape({
    firstEnrollablePaidSeatPrice: PropTypes.number,
  }),
};

ContentHighlightCardItem.defaultProps = {
  cardImageUrl: undefined,
  extras: undefined,
};

export default ContentHighlightCardItem;
