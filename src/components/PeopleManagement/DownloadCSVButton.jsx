import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { connect } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  Icon, Spinner, StatefulButton, Toast, useToggle,
} from '@openedx/paragon';
import { Download, Check } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import { downloadCsv, getTimeStampedFilename } from '../../utils';
import EVENT_NAMES from '../../eventTracking';

const csvHeaders = ['Name', 'Email', 'Joined Organization', 'Enrollments'];

const dataEntryToRow = (entry) => {
  const { enterpriseCustomerUser: { name, email, joinedOrg }, enrollments } = entry;
  return [name, email, joinedOrg, enrollments];
};

const DownloadCsvButton = ({
  enterpriseUUID,
  testId,
  fetchData,
  totalCt,
}) => {
  const [buttonState, setButtonState] = useState('pageLoading');
  const [isToastOpen, openToast, closeToast] = useToggle(false);
  const intl = useIntl();

  useEffect(() => {
    if (fetchData) {
      setButtonState('default');
    }
  }, [fetchData]);

  const handleClick = async () => {
    setButtonState('pending');
    fetchData().then((response) => {
      const fileName = getTimeStampedFilename('people-report.csv');
      downloadCsv(fileName, response.results, csvHeaders, dataEntryToRow);
      openToast();
      setButtonState('complete');
      sendEnterpriseTrackEvent(
        enterpriseUUID,
        EVENT_NAMES.PEOPLE_MANAGEMENT.DOWNLOAD_ALL_ORG_MEMBERS,
        {
          status: 'success',
        },
      );
    }).catch((err) => {
      logError(err);
      sendEnterpriseTrackEvent(
        enterpriseUUID,
        EVENT_NAMES.PEOPLE_MANAGEMENT.DOWNLOAD_ALL_ORG_MEMBERS,
        {
          status: 'error',
          message: err,
        },
      );
    });
  };

  const toastText = intl.formatMessage({
    id: 'adminPortal.peopleManagement.dataTable.download.toast',
    defaultMessage: 'Successfully downloaded',
    description: 'Toast message for the people management download button.',
  });
  return (
    <>
      { isToastOpen
     && (
     <Toast onClose={closeToast} show={isToastOpen}>
       {toastText}
     </Toast>
     )}
      <StatefulButton
        state={buttonState}
        className="download-button"
        data-testid={testId}
        labels={{
          default: intl.formatMessage({
            id: 'adminPortal.peopleManagement.dataTable.download.button',
            defaultMessage: `Download all (${totalCt})`,
            description: 'Label for the people management download button',
          }),
          pending: intl.formatMessage({
            id: 'adminPortal.peopleManagement.dataTable.download.button.pending',
            defaultMessage: 'Downloading',
            description: 'Label for the people management download button when the download is in progress.',
          }),
          complete: intl.formatMessage({
            id: 'adminPortal.peopleManagement.dataTable.download.button.complete',
            defaultMessage: 'Downloaded',
            description: 'Label for the people management download button when the download is complete.',
          }),
          pageLoading: intl.formatMessage({
            id: 'adminPortal.peopleManagement.dataTable.download.button.loading',
            defaultMessage: 'Download module activity',
            description: 'Label for the people management download button when the page is loading.',
          }),
        }}
        icons={{
          default: <Icon src={Download} />,
          pending: <Spinner animation="border" variant="light" size="sm" />,
          complete: <Icon src={Check} />,
          pageLoading: <Icon src={Download} variant="light" />,
        }}
        disabledStates={['pending', 'pageLoading']}
        onClick={handleClick}
        variant="outline-primary"
      />
    </>
  );
};

DownloadCsvButton.defaultProps = {
  testId: 'download-csv-button',
};

DownloadCsvButton.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  fetchData: PropTypes.func.isRequired,
  totalCt: PropTypes.number,
  testId: PropTypes.string,
  enterpriseUUID: PropTypes.string,
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(DownloadCsvButton);
