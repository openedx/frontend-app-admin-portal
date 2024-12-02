import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button,
  DataTable,
  Stack,
  StatefulButton,
  TextFilter,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useGetAllEnterpriseLearnerEmails, useEnterpriseLearnersTableData } from '../data/hooks/useEnterpriseLearnersTableData';
import { formatTimestamp } from '../../../utils';
import { DEFAULT_PAGE, MEMBERS_TABLE_PAGE_SIZE } from '../data';

const getSelectedEmailsByRow = (selectedFlatRows) => {
  const emails = [];
  Object.keys(selectedFlatRows).forEach(key => {
    const { original } = selectedFlatRows[key];
    if (original.user !== null) {
      emails.push(original.user.email);
    }
  });
  return emails;
};

const MemberDetailsCell = ({ row }) => (
  <Stack gap={1}>
    <div className="font-weight-bold">
      {row.original?.user?.username}
    </div>
    <div>
      {row.original?.user?.email}
    </div>
  </Stack>
);

const MemberJoinedDateCell = ({ row }) => (
  <div>
    {formatTimestamp({ timestamp: row.original.created, format: 'MMM DD, YYYY' })}
  </div>
);

const AddMembersBulkAction = ({
  isEntireTableSelected,
  selectedFlatRows,
  onHandleAddMembersBulkAction,
  enterpriseId,
}) => {
  const intl = useIntl();
  const { fetchLearnerEmails, addButtonState } = useGetAllEnterpriseLearnerEmails({
    enterpriseId,
    isEntireTableSelected,
    onHandleAddMembersBulkAction,
  });
  const handleOnClick = () => {
    if (isEntireTableSelected) {
      fetchLearnerEmails();
      return;
    }
    const emails = getSelectedEmailsByRow(selectedFlatRows);
    onHandleAddMembersBulkAction(emails);
  };

  return (
    <StatefulButton
      labels={{
        default: intl.formatMessage({
          id: 'people.management.add.new.group.modal.button',
          defaultMessage: 'Add',
          description: 'Button state text for adding members from datatable',
        }),
        pending: intl.formatMessage({
          id: 'people.management.add.new.group.modal.pending',
          defaultMessage: 'Adding...',
          description: 'Button state text for adding members from datatable',
        }),
        complete: intl.formatMessage({
          id: 'people.management.add.new.group.modal.complete',
          defaultMessage: 'Add',
          description: 'Button state text for adding members from datatable',
        }),
        error: intl.formatMessage({
          id: 'people.management.add.new.group.modal.try.again',
          defaultMessage: 'Try again',
          description: 'Button state text for trying to add members again',
        }),
      }}
      state={addButtonState}
      onClick={handleOnClick}
      disabledStates={['pending']}
    />
  );
};

const RemoveMembersBulkAction = ({
  isEntireTableSelected,
  selectedFlatRows,
  onHandleRemoveMembersBulkAction,
  learnerEmails,
}) => {
  const handleOnClick = async () => {
    if (isEntireTableSelected) {
      onHandleRemoveMembersBulkAction(learnerEmails);
    }
    const emails = getSelectedEmailsByRow(selectedFlatRows);
    onHandleRemoveMembersBulkAction(emails);
  };

  return (
    <Button variant="brand" onClick={handleOnClick}>
      Remove
    </Button>
  );
};

const selectColumn = {
  id: 'selection',
  Header: DataTable.ControlledSelectHeader,
  Cell: DataTable.ControlledSelect,
};

// TO-DO: add search functionality on member details once the learner endpoint is updated
// to support search
const EnterpriseCustomerUserDatatable = ({
  enterpriseId,
  learnerEmails,
  onHandleAddMembersBulkAction,
  onHandleRemoveMembersBulkAction,
}) => {
  const {
    isLoading,
    enterpriseCustomerUserTableData,
    fetchEnterpriseLearnersData,
  } = useEnterpriseLearnersTableData(enterpriseId);

  return (
    <DataTable
      bulkActions={[
        <AddMembersBulkAction
          onHandleAddMembersBulkAction={onHandleAddMembersBulkAction}
          enterpriseId={enterpriseId}
        />,
        <RemoveMembersBulkAction
          enterpriseId={enterpriseId}
          learnerEmails={learnerEmails}
          onHandleRemoveMembersBulkAction={onHandleRemoveMembersBulkAction}
        />,
      ]}
      columns={[
        {
          Header: 'Member details',
          accessor: 'user.email',
          Cell: MemberDetailsCell,
        },
        {
          Header: 'Joined organization',
          accessor: 'created',
          Cell: MemberJoinedDateCell,
          disableFilters: true,
        },
      ]}
      initialState={{
        pageIndex: DEFAULT_PAGE,
        pageSize: MEMBERS_TABLE_PAGE_SIZE,
      }}
      data={enterpriseCustomerUserTableData.results}
      defaultColumnValues={{ Filter: TextFilter }}
      fetchData={fetchEnterpriseLearnersData}
      isFilterable
      isLoading={isLoading}
      isPaginated
      isSelectable
      itemCount={enterpriseCustomerUserTableData.itemCount}
      manualFilters
      manualPagination
      initialTableOptions={{
        getRowId: row => row.id.toString(),
      }}
      pageCount={enterpriseCustomerUserTableData.pageCount}
      SelectionStatusComponent={DataTable.ControlledSelectionStatus}
      manualSelectColumn={selectColumn}
    />
  );
};

MemberDetailsCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      user: PropTypes.shape({
        email: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

MemberJoinedDateCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      created: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

AddMembersBulkAction.propTypes = {
  isEntireTableSelected: PropTypes.bool.isRequired,
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  enterpriseId: PropTypes.string.isRequired,
  onHandleAddMembersBulkAction: PropTypes.func.isRequired,
};

RemoveMembersBulkAction.propTypes = {
  isEntireTableSelected: PropTypes.bool.isRequired,
  learnerEmails: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  onHandleRemoveMembersBulkAction: PropTypes.func.isRequired,
};

EnterpriseCustomerUserDatatable.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  learnerEmails: PropTypes.arrayOf(PropTypes.string).isRequired,
  onHandleRemoveMembersBulkAction: PropTypes.func.isRequired,
  onHandleAddMembersBulkAction: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(EnterpriseCustomerUserDatatable);
