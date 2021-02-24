import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Hero from '../Hero';

import CourseSearch from './CourseSearch';

function BulkEnrollmentPage({ enterpriseId }) {
  return (
    <div className="container-fluid bulk-enrollment">
      <Hero title="Catalog Management" />
      <CourseSearch enterpriseId={enterpriseId} />
    </div>
  );
}

BulkEnrollmentPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(BulkEnrollmentPage);
