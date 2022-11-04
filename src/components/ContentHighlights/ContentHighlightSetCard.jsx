import React from 'react';
import { Card } from '@edx/paragon';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';

const ContentHighlightSetCard = ({
  title, highlightUUID, enterpriseSlug,
}) => {
  const history = useHistory();
  return (
    <Card
      isClickable
      onClick={() => history.push(`/${enterpriseSlug}/admin/${ROUTE_NAMES.contentHighlights}/${highlightUUID}`)}
    >
      <Card.Header
        className="pt-5 pb-3"
        title={title}
      />
    </Card>
  );
};

ContentHighlightSetCard.propTypes = {
  title: PropTypes.string.isRequired,
  highlightUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ContentHighlightSetCard);
