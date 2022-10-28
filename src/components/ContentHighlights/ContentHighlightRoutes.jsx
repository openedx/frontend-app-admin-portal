import React from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Container } from '@edx/paragon';
import Hero from '../Hero';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import ContentHighlightSet from './ContentHighlightSet';
import ContentHighlightsDashboard from './ContentHighlightsDashboard';

const ContentHighlightRoutes = ({ enterpriseSlug }) => {
  const baseContentHighlightPath = `/${enterpriseSlug}/admin/${ROUTE_NAMES.contentHighlights}`;
  return (
    <>
      <Hero title="Highlights" />
      <Container fluid className="pr-4 mt-5">
        <Route
          path={baseContentHighlightPath}
          component={ContentHighlightsDashboard}
          exact
        />
        <Route
          path={`${baseContentHighlightPath}/:highlightUUID/`}
          component={ContentHighlightSet}
          exact
        />
      </Container>
    </>
  );
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

ContentHighlightRoutes.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(ContentHighlightRoutes);
