import React from 'react';
import { Card, Hyperlink } from '@edx/paragon';
import Truncate from 'react-truncate';
import PropTypes from 'prop-types';
import { getContentHighlightCardFooter } from './data/constants';

const ContentHighlightCardItem = ({
  isLoading,
  title,
  hyperlink,
  contentType,
  partners,
  cardImageUrl,
  price,
}) => {
  const cardInfo = {
    cardTitle: (<Truncate lines={3} title={title}>{title}</Truncate>),
    cardLogoAlt: partners?.length === 1 ? `${partners[0].name}'s logo` : undefined,
    cardLogoSrc: partners?.length === 1 ? partners[0].logoImageUrl : undefined,
    cardSubtitle: partners?.map(p => p.name).join(', '),
    cardFooter: getContentHighlightCardFooter(price, contentType),
  };
  if (hyperlink) {
    cardInfo.cardTitle = (
      <Hyperlink destination={hyperlink} target="_blank">
        <Truncate lines={3} title={title}>{title}</Truncate>
      </Hyperlink>
    );
  }
  return (
    <Card isLoading={isLoading}>
      <Card.ImageCap
        src={cardImageUrl}
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
  hyperlink: PropTypes.string,
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
  hyperlink: undefined,
  cardImageUrl: undefined,
  price: undefined,
};

export default ContentHighlightCardItem;
