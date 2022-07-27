import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import BulkEnrollmentStepper from './stepper/BulkEnrollmentStepper';
import BulkEnrollContextProvider from './BulkEnrollmentContext';

/**
* @param {object} props Props
* @param {array<string>} props.learners learner email list to enroll
*/
function BulkEnrollDialog(props) {
  const { learners } = props;
  return (
    <BulkEnrollContextProvider initialEmailsList={learners}>
      <BulkEnrollmentStepper {...props} />
    </BulkEnrollContextProvider>
  );
}

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

BulkEnrollDialog.propTypes = {
  learners: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default connect(mapStateToProps)(BulkEnrollDialog);
