import React from 'react';
import { Card } from '@edx/paragon';
import PropTypes from 'prop-types';

const ContentHighlightCardItem = ({ title, type }) => (
  <Card
    isClickable
    className="h-100"
  >
    <Card.ImageCap
      className="h-100"
      src="https://source.unsplash.com/360x200/?nature,flower"
      srcAlt="Card Image"
      logoSrc="https://via.placeholder.com/150"
      logoAlt="placeholder"
    />

    <Card.Header
      className="h-100"
      title={title || 'Course Title'}
    />
    <Card.Footer textElement={
      <span className="text-muted">{type || ''}</span>
      }
    />
  </Card>
);

ContentHighlightCardItem.propTypes = {
  title: PropTypes.string,
  type: PropTypes.string,
};

ContentHighlightCardItem.defaultProps = {
  title: '',
  type: '',
};

export default ContentHighlightCardItem;
