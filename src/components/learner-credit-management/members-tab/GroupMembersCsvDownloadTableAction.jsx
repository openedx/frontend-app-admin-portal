import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ActionRow, AlertModal, Button } from '@openedx/paragon';
import { Download } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import snakeCase from 'lodash/snakeCase';
import { saveAs } from 'file-saver';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import { useBudgetId, useSubsidyAccessPolicy } from '../data';

const GroupMembersCsvDownloadTableAction = ({
  isEntireTableSelected,
  tableInstance,
}) => {
  const intl = useIntl();
  const selectedEmails = Object.keys(tableInstance.state.selectedRowIds);
  const selectedEmailCount = selectedEmails.length;
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalExc, setAlertModalException] = useState('');
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const groupId = subsidyAccessPolicy.groupAssociations[0];

  const getCsvFileName = () => {
    const titleNoWhitespace = subsidyAccessPolicy.displayName.replace(/\s+/g, '');
    const currentDate = new Date();
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth() + 1;
    const day = currentDate.getUTCDate();
    return `${titleNoWhitespace}-${year}-${month}-${day}.csv`;
  };

  const csvDownloadOnClick = () => {
    const options = {
      format_csv: true,
      traverse_pagination: true,
      group_uuid: groupId,
    };
    // Apply the table state to the request args
    // sortBy can support multiple values, the members table will only ever have one applied
    // so we can grab the data from the first index should it exist
    if (tableInstance.state.sortBy[0]) {
      options.sort_by = snakeCase(tableInstance.state.sortBy[0].id);
      // IFF we're doing sorting, check if it's in reverse order
      if (!tableInstance.state.sortBy[0].desc) {
        options.is_reversed = !tableInstance.state.sortBy[0].desc;
      }
    }
    tableInstance.state.filters.forEach((filter) => {
      if (filter.id === 'status') {
        options.show_removed = filter.value;
      } else if (filter.id === 'memberDetails') {
        options.user_query = snakeCase(filter.value);
      }
    });

    EnterpriseAccessApiService.fetchSubsidyHydratedGroupMembersData(
      subsidyAccessPolicyId,
      options,
      isEntireTableSelected ? null : selectedEmails,
    ).then(response => {
      // download CSV
      const blob = new Blob([response.data], {
        type: 'text/csv',
      });
      saveAs(blob, getCsvFileName());
    }).catch(err => {
      logError(err);
      setAlertModalOpen(true);
      setAlertModalException(err.message);
    });
  };

  let buttonSelectedNumber = 0;
  if (selectedEmailCount > 0) {
    buttonSelectedNumber = isEntireTableSelected ? `(${tableInstance.itemCount})` : `(${selectedEmailCount})`;
  } else {
    buttonSelectedNumber = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.all',
      defaultMessage: 'all ({itemCounts})',
      description: 'All members selected in the Members table',
    }, { itemCounts: tableInstance.itemCount });
  }

  return (
    <>
      <AlertModal
        title={intl.formatMessage({
          id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.error',
          defaultMessage: 'Something went wrong',
          description: 'Error title in the Members table',
        })}
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        footerNode={(
          <ActionRow>
            <Button
              variant="tertiary"
              onClick={() => setAlertModalOpen(false)}
            >
              <FormattedMessage
                id="learnerCreditManagement.budgetDetail.membersTab.membersTable.close"
                defaultMessage="Close"
                description="Close button text in the Members table"
              />
            </Button>
          </ActionRow>
        )}
      >
        <p>
          <FormattedMessage
            id="learnerCreditManagement.budgetDetail.membersTab.membersTable.errorDownload"
            defaultMessage="We're sorry but something went wrong while downloading your CSV. Please refer to the error below and try again later."
            description="Error message when downloading CSV in the Members table"
          />
        </p>
        <p>{alertModalExc}</p>
      </AlertModal>
      <Button
        onClick={csvDownloadOnClick}
        iconBefore={Download}
        variant="inverse-primary"
        className="border rounded-0 border-dark-500"
        disabled={tableInstance.itemCount === 0}
      >
        <FormattedMessage
          id="learnerCreditManagement.budgetDetail.membersTab.membersTable.download"
          defaultMessage="Download {buttonSelectedNumber}"
          description="Download button text in the Members table"
          values={{ buttonSelectedNumber }}
        />
      </Button>
    </>
  );
};

GroupMembersCsvDownloadTableAction.propTypes = {
  isEntireTableSelected: PropTypes.bool,
  tableInstance: PropTypes.shape({
    itemCount: PropTypes.number,
    state: PropTypes.shape({
      filters: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        // Can be a string for user queries or bool for show removed toggle
        value: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.bool,
        ]),
      })),
      sortBy: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        desc: PropTypes.bool,
      })),
      selectedRowIds: PropTypes.shape(),
    }),
  }),
};

GroupMembersCsvDownloadTableAction.defaultProps = {
  tableInstance: {
    itemCount: 0,
    state: {},
  },
  isEntireTableSelected: false,
};

export default GroupMembersCsvDownloadTableAction;
