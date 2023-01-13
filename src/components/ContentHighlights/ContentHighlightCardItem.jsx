import React from 'react';
import Truncate from 'react-truncate';
import PropTypes from 'prop-types';
import { Card, Hyperlink } from '@edx/paragon';
import cardImageCapFallbackSrc from '@edx/brand/paragon/images/card-imagecap-fallback.png';

import { getContentHighlightCardFooter } from './data/utils';

const ContentHighlightCardItem = ({
  isLoading,
  title,
  hyperlinkAttrs,
  contentType,
  partners,
  cardImageUrl,
  price,
}) => {
  const cardInfo = {
    cardImgSrc: cardImageUrl,
    cardLogoSrc: partners.length === 1 ? partners[0].logoImageUrl : undefined,
    cardLogoAlt: partners.length === 1 ? `${partners[0].name}'s logo` : undefined,
    cardTitle: <Truncate lines={3} title={title}>{title}</Truncate>,
    cardSubtitle: partners.map(p => p.name).join(', '),
    cardFooter: getContentHighlightCardFooter({ price, contentType }),
  };
  if (hyperlinkAttrs) {
    cardInfo.cardTitle = (
      <Hyperlink onClick={hyperlinkAttrs.onClick} destination={hyperlinkAttrs.href} target={hyperlinkAttrs.target} data-testid="hyperlink-title">
        <Truncate lines={3} title={title}>{title}</Truncate>
      </Hyperlink>
    );
  }
  return (
    <Card variant={contentType !== 'course' && 'dark'} isLoading={isLoading}>
      <Card.ImageCap
        src={cardInfo.cardImgSrc}
        fallbackSrc={cardImageCapFallbackSrc}
        srcAlt=""
        logoSrc={cardInfo.cardLogoSrc}
        logoAlt={cardInfo.cardLogoAlt}
      />
      <Card.Header
        title={cardInfo.cardTitle}
        subtitle={<Truncate lines={2} title={cardInfo.cardSubtitle}>{cardInfo.cardSubtitle}</Truncate>}
      />
      {contentType && (
        <>
          <Card.Section />
          <Card.Footer
            textElement={cardInfo.cardFooter}
          />
        </>
      )}
    </Card>
  );
};

ContentHighlightCardItem.propTypes = {
  isLoading: PropTypes.bool,
  cardImageUrl: PropTypes.string,
  title: PropTypes.string.isRequired,
  hyperlinkAttrs: PropTypes.shape({
    href: PropTypes.string,
    target: PropTypes.string,
    onClick: PropTypes.func,
  }),
  contentType: PropTypes.oneOf(['course', 'program', 'learnerpathway']).isRequired,
  partners: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    uuid: PropTypes.string,
    logoImageUrl: PropTypes.string,
  })).isRequired,
  price: PropTypes.number,
};

ContentHighlightCardItem.defaultProps = {
  isLoading: false,
  hyperlinkAttrs: undefined,
  cardImageUrl: undefined,
  price: undefined,
};

export default ContentHighlightCardItem;
