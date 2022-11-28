import React from 'react';
import { Card } from '@edx/paragon';
import PropTypes from 'prop-types';
import { FOOTER_TEXT_BY_CONTENT_TYPE } from './data/constants';

const ContentHighlightCardItem = ({ original }) => {
  const {
    title,
    contentType,
    partners,
    cardImageUrl,
    originalImageUrl,
  } = original;

  const cardLogoSrc = partners.length === 1 ? partners[0].logoImageUrl : undefined;
  const cardLogoAlt = partners.length === 1 ? `${partners[0].name}'s logo` : undefined;
  const cardSubtitle = partners.map(p => p.name).join(', ');

  return (
    <Card>
      <Card.ImageCap
        src={cardImageUrl || originalImageUrl}
        srcAlt=""
        logoSrc={cardLogoSrc}
        logoAlt={cardLogoAlt}
      />
      <Card.Header
        title={title}
        subtitle={cardSubtitle}
      />
      {contentType && (
        <>
          <Card.Section />
          <Card.Footer
            textElement={FOOTER_TEXT_BY_CONTENT_TYPE[contentType.toLowerCase()]}
          />
        </>
      )}
    </Card>
  );
};

ContentHighlightCardItem.propTypes = {
  original: PropTypes.shape({
    cardImageUrl: PropTypes.string,
    originalImageUrl: PropTypes.string,
    title: PropTypes.string.isRequired,
    contentType: PropTypes.oneOf(['course', 'program', 'learnerpathway']),
    partners: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      uuid: PropTypes.string,
      logoImageUrl: PropTypes.string,
    })),
  }).isRequired,
};

export default ContentHighlightCardItem;
