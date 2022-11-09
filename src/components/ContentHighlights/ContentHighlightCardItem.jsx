import React from 'react';
import { Card } from '@edx/paragon';
import PropTypes from 'prop-types';
import { FOOTER_TEXT_BY_CONTENT_TYPE } from './data/constants';

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
    <Card.Footer textElement={FOOTER_TEXT_BY_CONTENT_TYPE[type]}>
      <span />
    </Card.Footer>
  </Card>
);

ContentHighlightCardItem.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['course', 'program', 'learnerpathway']),
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
