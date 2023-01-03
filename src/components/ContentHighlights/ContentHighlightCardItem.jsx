import React from 'react';
import { Card, Hyperlink } from '@edx/paragon';
import Truncate from 'react-truncate';
import PropTypes from 'prop-types';
import { getContentHighlightCardFooter } from './data/utils';

const ContentHighlightCardItem = ({
  isLoading,
  title,
  href,
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
  if (href) {
    cardInfo.cardTitle = (
      <Hyperlink onClick={() => href.onClick()} destination={href.destination} target={href.target} data-testid="hyperlink-title">
        <Truncate lines={3} title={title}>{title}</Truncate>
      </Hyperlink>
    );
  }
  return (
    <Card variant={contentType !== 'course' && 'dark'} isLoading={isLoading}>
      <Card.ImageCap
        src={cardInfo.cardImgSrc}
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
  href: PropTypes.shape({
    destination: PropTypes.string,
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
  href: undefined,
  cardImageUrl: undefined,
  price: undefined,
};

export default ContentHighlightCardItem;
