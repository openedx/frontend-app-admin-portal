import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform';
import { Toast } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';
import LicenseManagerApiService from '../../data/services/LicenseManagerAPIService';

const BulkEnrollmentResultsDownloadPage = ({ enterpriseId }) => {
  const { enterpriseSlug, bulkEnrollmentJobId } = useParams();
  const [isLoading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [error, setError] = useState(null);
  const [notReady, setNotReady] = useState(false);
  const [showToast, setShowToast] = useState(false);
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
  }, [bulkEnrollmentJobId, enterpriseId, isLoading]);

  useEffect(() => {
    if (notReady || error) {
      setShowToast(true);
    }
  }, [notReady, error]);

  if (isLoading) {
    return <EnterpriseAppSkeleton />;
  }
  if (notReady) {
    return (
      <>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
        >
          <FormattedMessage
            id="admin.portal.bulk.enrollment.download.not.ready.message"
            defaultMessage="Your download is not ready yet."
            description="Message shown when the bulk enrollment job is not yet ready for download"
          />
        </Toast>
        <Navigate to={`/${enterpriseSlug}/admin/learners`} replace />
      </>
    );
  }
  if (error) {
    return (
      <>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
        >
          <FormattedMessage
            id="admin.portal.bulk.enrollment.download.error.label"
            defaultMessage="There was a problem with your request."
            description="Error shown when there is an error fetching the bulk enrollment job"
          />
        </Toast>
        <Navigate to={`/${enterpriseSlug}/admin/learners`} replace />
      </>
    );
  }
  global.location.href = redirectUrl;
  return (
    <h1>
      <FormattedMessage
        id="admin.portal.bulk.enrollment.download.redirecting.message"
        defaultMessage="Redirecting..."
        description="Message displayed while the user is being redirected to the download URL"
      />
    </h1>
  );
};

BulkEnrollmentResultsDownloadPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(BulkEnrollmentResultsDownloadPage);
