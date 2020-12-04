import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

const CourseSearch = ({ enterpriseId }) => {
  const PAGE_TITLE = `Search courses - ${enterpriseId}`;

  useEffect(() => {

  }, []);

  return (
    <>
      <Helmet title={PAGE_TITLE} />

    </>
  );
};

CourseSearch.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(CourseSearch);
