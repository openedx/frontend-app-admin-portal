import React from 'react';
import PropTypes from 'prop-types';
import { ProductTour } from '@edx/paragon';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import browseAndRequestTour from './browseAndRequestTour';
import learnerCreditTour from './learnerCreditTour';
import { useBrowseAndRequestTour, useLearnerCreditTour } from './data/hooks';

/**
 * All the logic here is for determining what ProductTours we should show.
 * All actual tour specific logic/content should live within the separate tour files.
 */
const ProductTours = ({ enterpriseSlug }) => {
  const [browseAndRequestTourEnabled, setBrowseAndRequestTourEnabled] = useBrowseAndRequestTour();
  const [learnerCreditTourEnabled, setLearnerCreditTourEnabled] = useLearnerCreditTour();

  const history = useHistory();
  const tours = [
    browseAndRequestTour({
      enterpriseSlug,
      tourEnabled: browseAndRequestTourEnabled,
      history,
      onDismiss: () => setBrowseAndRequestTourEnabled(false),
      onEnd: () => setBrowseAndRequestTourEnabled(false),
    }),
    learnerCreditTour({
      enterpriseSlug,
      tourEnabled: learnerCreditTourEnabled,
      history,
      onDismiss: () => setLearnerCreditTourEnabled(false),
      onEnd: () => setLearnerCreditTourEnabled(false),
    }),
  ];

  return (
    <ProductTour
      tours={tours}
    />
  );
};

ProductTours.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(ProductTours);
