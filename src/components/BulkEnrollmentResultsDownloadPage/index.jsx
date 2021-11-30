import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Redirect, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { logError } from '@edx/frontend-platform/logging';
import { ToastsContext } from '../Toasts';
import LicenseManagerApiService from '../../data/services/LicenseManagerAPIService';

const BulkEnrollmentResultsDownloadPage = ({ enterpriseId }) => {
  const { enterpriseSlug, bulkEnrollmentJobId } = useParams();
  const { addToast } = useContext(ToastsContext);
  const [isLoading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (enterpriseId && isLoading) {
      LicenseManagerApiService.fetchBulkEnrollmentJob(enterpriseId, bulkEnrollmentJobId)
        .then((response) => {
          if (response.data.download_url) {
            setRedirectUrl(response.data.download_url);
          } else {
            throw new Error('Your download is not ready yet.');
          }
        })
        .catch((err) => {
          logError(err);
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  });

  if (isLoading) {
    return <h1>loading...</h1>;
  }
  if (error) {
    addToast('There was a problem with your request.');
    return <Redirect to={`/${enterpriseSlug}/admin/learners`} />;
  }
  window.location.href = redirectUrl;
  return <h1>redirecting...</h1>;
};

BulkEnrollmentResultsDownloadPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(BulkEnrollmentResultsDownloadPage);
