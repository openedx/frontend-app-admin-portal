import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import {
  Toast, StatefulButton, Icon, Spinner, useToggle,
} from '@openedx/paragon';
import { Download, Check } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import { downloadCsv } from '../../utils';

const csvHeaders = ['Name', 'Email', 'Joined Organization', 'Enrollments'];

const dataEntryToRow = (entry) => {
  const { enterpriseCustomerUser: { name, email, joinedOrg }, enrollments } = entry;
  return [name, email, joinedOrg, enrollments];
};

const getCsvFileName = () => {
  const padTwoZeros = (num) => num.toString().padStart(2, '0');
  const currentDate = new Date();
  const year = currentDate.getUTCFullYear();
  const month = padTwoZeros(currentDate.getUTCMonth() + 1);
  const day = padTwoZeros(currentDate.getUTCDate());
  return `${year}-${month}-${day}-people-report.csv`;
};

const DownloadCsvButton = ({ testId, fetchData, totalCt }) => {
  const [buttonState, setButtonState] = useState('pageLoading');
  const [isOpen, open, close] = useToggle(false);
  const intl = useIntl();

  useEffect(() => {
    if (fetchData) {
      setButtonState('default');
    }
  }, [fetchData]);

  const handleClick = async () => {
    setButtonState('pending');
    fetchData().then((response) => {
      downloadCsv(getCsvFileName(), response.results, csvHeaders, dataEntryToRow);
      open();
      setButtonState('complete');
    }).catch((err) => {
      logError(err);
    });
  };

  const toastText = intl.formatMessage({
    id: 'adminPortal.peopleManagement.dataTable.download.toast',
    defaultMessage: 'Successfully downloaded',
    description: 'Toast message for the people management download button.',
  });
  return (
    <>
      { isOpen
     && (
     <Toast onClose={close} show={isOpen}>
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
};

export default DownloadCsvButton;
