import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Redirect, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform';
import { ToastsContext } from '../Toasts';
import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';
import LicenseManagerApiService from '../../data/services/LicenseManagerAPIService';

const BulkEnrollmentResultsDownloadPage = ({ enterpriseId }) => {
  const { enterpriseSlug, bulkEnrollmentJobId } = useParams();
  const { addToast } = useContext(ToastsContext);
  const [isLoading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [error, setError] = useState(null);
  const [notReady, setNotReady] = useState(false);

  useEffect(() => {
    if (isLoading) {
      LicenseManagerApiService.fetchBulkEnrollmentJob(enterpriseId, bulkEnrollmentJobId)
        .then((response) => {
          const result = camelCaseObject(response.data);
          if (result.downloadUrl) {
            setRedirectUrl(result.downloadUrl);
          } else {
            setNotReady(true);
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
    return <EnterpriseAppSkeleton />;
  }
  if (notReady) {
    addToast('Your download is not ready yet.');
    return <Redirect to={`/${enterpriseSlug}/admin/learners`} />;
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
