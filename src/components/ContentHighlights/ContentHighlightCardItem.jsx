import React from 'react';
import { Card } from '@edx/paragon';
import PropTypes from 'prop-types';

const ContentHighlightCardItem = ({ title, type, authoringOrganizations }) => (
  <Card isClickable>
    <Card.ImageCap
      src="https://source.unsplash.com/360x200/?nature,flower"
      srcAlt=""
      logoSrc={authoringOrganizations[0].logoImageUrl}
      logoAlt={`${authoringOrganizations[0].name}'s logo`}
    />
    <Card.Header title={title} subtitle={authoringOrganizations[0].name} />
    {/* footer for spacing purposes */}
    <Card.Section>
      <span />
    </Card.Section>
    <Card.Footer textElement={type}>
      <span />
    </Card.Footer>
  </Card>
);

ContentHighlightCardItem.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string,
  authoringOrganizations: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    uuid: PropTypes.string,
    logoImageUrl: PropTypes.string,
  })),
};

ContentHighlightCardItem.defaultProps = {
  type: undefined,
  authoringOrganizations: [],
};

export default ContentHighlightCardItem;
