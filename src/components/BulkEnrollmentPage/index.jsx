import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import CourseSearch from './CourseSearch';

function BulkEnrollmentPage({ enterpriseId }) {
  return (
    <>
      <CourseSearch
        enterpriseId={enterpriseId}
      />
    </>
  );
}

BulkEnrollmentPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(BulkEnrollmentPage);
