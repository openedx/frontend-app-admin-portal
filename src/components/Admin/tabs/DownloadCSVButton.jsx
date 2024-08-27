import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import {
  Toast, StatefulButton, Icon, Spinner, useToggle,
} from '@openedx/paragon';
import { Download, Check } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';

const DownloadCsvButton = ({ data, testId, fetchData }) => {
  const [buttonState, setButtonState] = useState('pageLoading');
  const [isOpen, open, close] = useToggle(false);
  const intl = useIntl();

  useEffect(() => {
    if (data && data.length) {
      setButtonState('default');
    }
  }, [data]);

  const getCsvFileName = () => {
    const currentDate = new Date();
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth() + 1;
    const day = currentDate.getUTCDate();
    return `${year}-${month}-${day}-module-activity-report.csv`;
  };

  const handleClick = async () => {
    fetchData().then((response) => {
      setButtonState('pending');
      const blob = new Blob([response.data], {
        type: 'text/csv',
      });
      saveAs(blob, getCsvFileName());
      open();
      setButtonState('complete');
    }).catch((err) => {
      logError(err);
    });
  };

  const toastText = intl.formatMessage({
    id: 'adminPortal.LPR.moduleActivityReport.download.toast',
    defaultMessage: 'Downloaded module activity report of your learners.',
    description: 'Toast message for the download button in the module activity report page.',
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
            id: 'adminPortal.LPR.moduleActivityReport.download.button',
            defaultMessage: 'Download module activity',
            description: 'Label for the download button in the module activity report page.',
          }),
          pending: intl.formatMessage({
            id: 'adminPortal.LPR.moduleActivityReport.download.button.pending',
            defaultMessage: 'Downloading',
            description: 'Label for the download button in the module activity report page when the download is in progress.',
          }),
          complete: intl.formatMessage({
            id: 'adminPortal.LPR.moduleActivityReport.download.button.complete',
            defaultMessage: 'Downloaded',
            description: 'Label for the download button in the module activity report page when the download is complete.',
          }),
          pageLoading: intl.formatMessage({
            id: 'adminPortal.LPR.moduleActivityReport.download.button.loading',
            defaultMessage: 'Download module activity',
            description: 'Label for the download button in the module activity report page when the page is loading.',
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
  data: PropTypes.arrayOf(
    PropTypes.object,
  ),
  fetchData: PropTypes.func.isRequired,
  testId: PropTypes.string,
};

export default DownloadCsvButton;
