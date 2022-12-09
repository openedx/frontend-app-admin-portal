import React from 'react';
import { Card } from '@edx/paragon';
import Truncate from 'react-truncate';
import PropTypes from 'prop-types';
import { getContentHighlightCardFooter } from './data/constants';

const ContentHighlightCardItem = ({
  isLoading,
  title,
  contentType,
  partners,
  cardImageUrl,
  price,
}) => {
  const cardLogoSrc = partners?.length === 1 ? partners[0].logoImageUrl : undefined;
  const cardLogoAlt = partners?.length === 1 ? `${partners[0].name}'s logo` : undefined;
  const cardSubtitle = partners?.map(p => p.name).join(', ');
  const cardFooter = getContentHighlightCardFooter(price, contentType);
  return (
    <Card isLoading={isLoading}>
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
  isLoading: PropTypes.bool,
  cardImageUrl: PropTypes.string,
  title: PropTypes.string.isRequired,
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
  cardImageUrl: undefined,
  price: undefined,
};

export default ContentHighlightCardItem;
