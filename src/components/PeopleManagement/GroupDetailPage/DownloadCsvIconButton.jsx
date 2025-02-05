import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { connect } from 'react-redux';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import {
  Icon, IconButtonWithTooltip, Toast, useToggle,
} from '@openedx/paragon';
import { Download } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import GeneralErrorModal from '../GeneralErrorModal';
import { downloadCsv, getTimeStampedFilename } from '../../../utils';
import EVENT_NAMES from '../../../eventTracking';

const csvHeaders = ['Name', 'Email', 'Recent action', 'Enrollments'];

const DownloadCsvIconButton = ({
  enterpriseUUID,
  fetchAllData,
  dataCount,
  testId,
  tableInstance: { state },
  groupName,
}) => {
  const [isToastOpen, openToast, closeToast] = useToggle(false);
  const [isErrorModalOpen, openErrorModal, closeErrorModal] = useToggle(false);
  const selectedRowsCount = Object.keys(state.selectedRowIds).length;
  const downloadHoverTextMessage = selectedRowsCount === dataCount || !selectedRowsCount ? `Download all (${dataCount})` : `Download (${selectedRowsCount})`;
  const intl = useIntl();
  const messages = defineMessages({
    downloadToastText: {
      id: 'adminPortal.peopleManagement.groupDetail.downloadCsv.toast',
      defaultMessage: 'Downloaded group members',
      description: 'Toast message for the download button on the group detail page.',
    },
    downloadHoverText: {
      id: 'adminPortal.peopleManagement.groupDetail.downloadCsv.hoverTooltip',
      defaultMessage: downloadHoverTextMessage,
      description: 'Tooltip message for the download button on the group detail page.',
    },
  });

  const dataEntryToRow = (entry) => {
    const { memberDetails: { userEmail, userName }, recentAction, enrollments } = entry;
    return [userName, userEmail, recentAction, enrollments];
  };

  const handleClick = async () => {
    fetchAllData().then((response) => {
      const fileName = getTimeStampedFilename(`${groupName}.csv`);
      const selectedRowIdsToDownload = selectedRowsCount ? (response.results.filter(result => (
        state.selectedRowIds[result.memberDetails.userEmail]
      ))) : response.results;
      downloadCsv(fileName, selectedRowIdsToDownload, csvHeaders, dataEntryToRow);
      openToast();
      sendEnterpriseTrackEvent(
        enterpriseUUID,
        EVENT_NAMES.PEOPLE_MANAGEMENT.DOWNLOAD_GROUP_MEMBERS,
        { status: 'success' },
      );
    }).catch((err) => {
      logError(err);
      openErrorModal();
      sendEnterpriseTrackEvent(
        enterpriseUUID,
        EVENT_NAMES.PEOPLE_MANAGEMENT.DOWNLOAD_GROUP_MEMBERS,
        {
          status: 'error',
          message: err,
        },
      );
    });
  };

  return (
    <>
      {isToastOpen
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
  enterpriseUUID: PropTypes.string,
  fetchAllData: PropTypes.func.isRequired,
  dataCount: PropTypes.number.isRequired,
  testId: PropTypes.string,
  groupName: PropTypes.string,
  tableInstance: PropTypes.shape({
    state: PropTypes.shape(),
  }),
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(DownloadCsvIconButton);
