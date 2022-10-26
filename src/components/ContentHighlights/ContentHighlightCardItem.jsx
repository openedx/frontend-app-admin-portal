import React from 'react';
import { Card } from '@edx/paragon';
import PropTypes from 'prop-types';

const ContentHighlightCardItem = ({ title, type, owners }) => (
  <Card isClickable>
    <Card.ImageCap
      src="https://source.unsplash.com/360x200/?nature,flower"
      srcAlt="Card Image"
      logoSrc={owners[0].imageUrl}
      logoAlt={`${owners[0].name}'s logo`}
    />
    <Card.Header title={title} subtitle={owners[0].name} />
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
  owners: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    imageUrl: PropTypes.string,
  })),
};

ContentHighlightCardItem.defaultProps = {
  type: undefined,
  owners: [{
    name: 'placeholder',
    imageUrl: 'https://via.placeholder.com/150',
  },
  ],
};

export default ContentHighlightCardItem;
