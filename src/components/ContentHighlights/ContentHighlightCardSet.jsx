import React from 'react';
import { Card } from '@edx/paragon';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
// Content Highlight Set Card Rename !!
const ContentHighlightCardSet = ({
  title, highlightUUID, index, enterpriseSlug, ...rest
}) => {
  const history = useHistory();
  return (
    <Card
      isClickable
      onClick={() => history.push(`/${enterpriseSlug}/admin/${ROUTE_NAMES.contentHighlights}/${highlightUUID}`)}
      {...rest}
    >
      <Card.Header
        className="pt-5 pb-3"
        title={`Highlight ${index}`}
      />
    </Card>
  );
};

ContentHighlightCardSet.propTypes = {
  title: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  highlightUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentHighlightCardSet);
