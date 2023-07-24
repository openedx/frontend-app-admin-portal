import React from 'react';
import LinesEllipsis from 'react-lines-ellipsis';
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
    cardTitle:  <LinesEllipsis
    text={title}
    title={title}
    maxLine={3}
    trimWhitespace
  />,
    cardSubtitle: partners.map(p => p.name).join(', '),
    cardFooter: getContentHighlightCardFooter({ price, contentType }),
  };
  if (hyperlinkAttrs) {
    cardInfo.cardTitle = (
      <Hyperlink onClick={hyperlinkAttrs.onClick} destination={hyperlinkAttrs.href} target={hyperlinkAttrs.target} data-testid="hyperlink-title">
        <LinesEllipsis
          text={title}
          title={title}
          maxLine={3}
          trimWhitespace
        />
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
        subtitle={
        <LinesEllipsis
          text={cardInfo.cardSubtitle}
          title={cardInfo.cardSubtitle}
          maxLine={2}
        />
      }
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
