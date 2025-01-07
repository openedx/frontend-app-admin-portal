import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

import {
  Icon, IconButtonWithTooltip, Toast, useToggle,
} from '@openedx/paragon';
import { Download } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import GeneralErrorModal from '../GeneralErrorModal';
import { downloadCsv, getTimeStampedFilename } from '../../../utils';

const csvHeaders = ['Name', 'Email', 'Recent action', 'Enrollments'];

const DownloadCsvIconButton = ({ fetchAllData, dataCount, testId }) => {
  const [isToastOpen, openToast, closeToast] = useToggle(false);
  const [isErrorModalOpen, openErrorModal, closeErrorModal] = useToggle(false);
  const intl = useIntl();
  const messages = defineMessages({
    downloadToastText: {
      id: 'adminPortal.peopleManagement.groupDetail.downloadCsv.toast',
      defaultMessage: 'Downloaded group members',
      description: 'Toast message for the download button on the group detail page.',
    },
    downloadHoverText: {
      id: 'adminPortal.peopleManagement.groupDetail.downloadCsv.hoverTooltip',
      defaultMessage: `Download (${dataCount})`,
      description: 'Tooltip message for the download button on the group detail page.',
    },
  });

  const dataEntryToRow = (entry) => {
    const { memberDetails: { userEmail, userName }, recentAction, enrollments } = entry;
    return [userName, userEmail, recentAction, enrollments];
  };

  const handleClick = async () => {
    fetchAllData().then((response) => {
      const fileName = getTimeStampedFilename('group-report.csv');
      downloadCsv(fileName, response.results, csvHeaders, dataEntryToRow);
      openToast();
    }).catch((err) => {
      logError(err);
      openErrorModal();
    });
  };

  return (
    <>
      { isToastOpen
     && (
     <Toast onClose={closeToast} show={isToastOpen}>
       {intl.formatMessage(messages.downloadToastText)}
     </Toast>
     )}
      <GeneralErrorModal
        isOpen={isErrorModalOpen}
        close={closeErrorModal}
      />
      <IconButtonWithTooltip
        data-testid={testId}
        tooltipContent={intl.formatMessage(messages.downloadHoverText)}
        src={Download}
        iconAs={Icon}
        alt="Download group members"
        variant="primary"
        onClick={handleClick}
      />
    </>
  );
};

DownloadCsvIconButton.defaultProps = {
  testId: 'download-csv-icon-button',
};

DownloadCsvIconButton.propTypes = {
  fetchAllData: PropTypes.func.isRequired,
  dataCount: PropTypes.number.isRequired,
  testId: PropTypes.string,
};

export default DownloadCsvIconButton;
