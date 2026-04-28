import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { sendEnterpriseTrackEvent } from '@2uinc/frontend-enterprise-utils';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import {
  Icon, IconButtonWithTooltip, Toast, useToggle,
} from '@openedx/paragon';
import { Download } from '@openedx/paragon/icons';

import GeneralErrorModal from './GeneralErrorModal';
import { downloadCsv, getTimeStampedFilename } from '../../utils';
import EVENT_NAMES from '../../eventTracking';

const csvHeaders = ['Name', 'Email', 'Joined Org', 'Invited Date', 'Role'];

const dataEntryToRow = (entry) => {
  const {
    name, email, joinedDate, invitedDate, status,
  } = entry;
  return [name || '', email, joinedDate || '', invitedDate || '', status];
};

const DownloadAdminsCsvIconButton = ({
  enterpriseUUID,
  testId,
  fetchData,
  dataCount,
}) => {
  const [isToastOpen, openToast, closeToast] = useToggle(false);
  const [isErrorModalOpen, openErrorModal, closeErrorModal] = useToggle(false);
  const intl = useIntl();
  const downloadHoverTextMessage = `Download all (${dataCount})`;

  const messages = defineMessages({
    downloadToastText: {
      id: 'adminPortal.peopleManagement.admins.dataTable.download.toast',
      defaultMessage: 'Successfully downloaded',
      description: 'Toast message for successful csv download of admin users.',
    },
    downloadHoverText: {
      id: 'adminPortal.peopleManagement.admins.dataTable.download.tooltip',
      defaultMessage: downloadHoverTextMessage,
      description: 'Tooltip content for the download icon button.',
    },
  });

  const handleClick = async () => {
    fetchData().then((response) => {
      const fileName = getTimeStampedFilename('admin-report.csv');
      downloadCsv(fileName, response.results, csvHeaders, dataEntryToRow);
      openToast();
      sendEnterpriseTrackEvent(
        enterpriseUUID,
        EVENT_NAMES.PEOPLE_MANAGEMENT.DOWNLOAD_ALL_ADMINS,
        { status: 'success' },
      );
    }).catch((err) => {
      logError(err);
      openErrorModal();
      sendEnterpriseTrackEvent(
        enterpriseUUID,
        EVENT_NAMES.PEOPLE_MANAGEMENT.DOWNLOAD_ALL_ADMINS,
        { status: 'error', message: err },
      );
    });
  };

  return (
    <>
      {isToastOpen && (
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
        alt="Download csv of admin users"
        variant="primary"
        onClick={handleClick}
        disabled={!dataCount}
      />
    </>
  );
};

DownloadAdminsCsvIconButton.defaultProps = {
  testId: 'download-csv-icon-button',
  enterpriseUUID: null,
  dataCount: 0,
};

DownloadAdminsCsvIconButton.propTypes = {
  fetchData: PropTypes.func.isRequired,
  testId: PropTypes.string,
  enterpriseUUID: PropTypes.string,
  dataCount: PropTypes.number,
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(DownloadAdminsCsvIconButton);
