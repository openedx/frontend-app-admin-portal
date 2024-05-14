import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ActionRow, AlertModal, Button } from '@openedx/paragon';
import { Download } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import snakeCase from 'lodash/snakeCase';
import { saveAs } from 'file-saver';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import { useBudgetId, useSubsidyAccessPolicy } from '../data';

const GroupMembersCsvDownloadTableAction = ({
  tableInstance,
}) => {
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

  return (
    <>
      <AlertModal
        title="Something went wrong"
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        footerNode={(
          <ActionRow>
            <Button
              variant="tertiary"
              onClick={() => setAlertModalOpen(false)}
            >
              Close
            </Button>
          </ActionRow>
        )}
      >
        <p>
          We&apos;re sorry but something went wrong while downloading your CSV.
          Please refer to the error below and try again later.
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
        Download all ({tableInstance.itemCount})
      </Button>
    </>
  );
};

GroupMembersCsvDownloadTableAction.propTypes = {
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
    }),
  }),
};

GroupMembersCsvDownloadTableAction.defaultProps = {
  tableInstance: {
    itemCount: 0,
    state: {},
  },
};

export default GroupMembersCsvDownloadTableAction;
