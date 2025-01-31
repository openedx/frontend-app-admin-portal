import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  CheckboxControl, DataTable, TextFilter,
} from '@openedx/paragon';
import {
  GROUP_MEMBERS_TABLE_DEFAULT_PAGE, GROUP_MEMBERS_TABLE_PAGE_SIZE,
} from './constants';
import MemberDetailsCell from './MemberDetailsCell';
import AddMembersBulkAction from './GroupDetailPage/AddMembersBulkAction';
import RemoveMembersBulkAction from './RemoveMembersBulkAction';
import MemberJoinedDateCell from './MemberJoinedDateCell';
import { useEnterpriseMembersTableData } from './data/hooks';

export const BaseSelectWithContext = ({ row, enterpriseGroupLearners }) => {
  const {
    indeterminate,
    checked,
    ...toggleRowSelectedProps
  } = row.getToggleRowSelectedProps();
  const isAddedMember = enterpriseGroupLearners.find(learner => learner.lmsUserId === Number(row.id));
  return (
    <div>
      <CheckboxControl
        {...toggleRowSelectedProps}
        title="Toggle row selected"
        checked={isAddedMember || checked}
        isIndeterminate={false}
        disabled={isAddedMember}
        style={{ cursor: isAddedMember ? null : 'pointer' }}
      />
    </div>
  );
};
const FilterStatus = (rest) => <DataTable.FilterStatus showFilteredFields={false} {...rest} />;

const EnterpriseCustomerUserDataTable = ({
  enterpriseId,
  learnerEmails,
  onHandleAddMembersBulkAction,
  onHandleRemoveMembersBulkAction,
  enterpriseGroupLearners,
}) => {
  const {
    isLoading,
    enterpriseMembersTableData,
    fetchEnterpriseMembersTableData,
  } = useEnterpriseMembersTableData({ enterpriseId });

  const selectColumn = {
    id: 'selection',
    Header: DataTable.ControlledSelectHeader,
    Cell: DataTable.ControlledSelect,
    disableSortBy: true,
  };
  return (
    <DataTable
      bulkActions={[
        <AddMembersBulkAction
          onHandleAddMembersBulkAction={onHandleAddMembersBulkAction}
          enterpriseId={enterpriseId}
          enterpriseGroupLearners={enterpriseGroupLearners}
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
          accessor: 'name',
          Cell: MemberDetailsCell,
        },
        {
          Header: 'Joined organization',
          accessor: 'joinedOrg',
          Cell: MemberJoinedDateCell,
          disableFilters: true,
        },
      ]}
      initialState={{
        pageIndex: GROUP_MEMBERS_TABLE_DEFAULT_PAGE,
        pageSize: GROUP_MEMBERS_TABLE_PAGE_SIZE,
        sortBy: [
          { id: 'name', desc: true },
        ],
        filters: [],
      }}
      data={enterpriseMembersTableData.results}
      defaultColumnValues={{ Filter: TextFilter }}
      FilterStatusComponent={FilterStatus}
      fetchData={fetchEnterpriseMembersTableData}
      isFilterable
      isLoading={isLoading}
      isPaginated
      isSelectable
      itemCount={enterpriseMembersTableData.itemCount}
      manualFilters
      manualPagination
      isSortable
      manualSortBy
      initialTableOptions={{
        getRowId: row => row.enterpriseCustomerUser.userId.toString(),
      }}
      pageCount={enterpriseMembersTableData.pageCount}
      manualSelectColumn={selectColumn}
      SelectionStatusComponent={DataTable.ControlledSelectionStatus}
    />
  );
};

EnterpriseCustomerUserDataTable.defaultProps = {
  enterpriseGroupLearners: [],
};

EnterpriseCustomerUserDataTable.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  learnerEmails: PropTypes.arrayOf(PropTypes.string).isRequired,
  onHandleRemoveMembersBulkAction: PropTypes.func.isRequired,
  onHandleAddMembersBulkAction: PropTypes.func.isRequired,
  enterpriseGroupLearners: PropTypes.arrayOf(PropTypes.shape({})),
};

BaseSelectWithContext.propTypes = {
  row: PropTypes.shape({
    getToggleRowSelectedProps: PropTypes.func.isRequired,
    id: PropTypes.string,
  }).isRequired,
  enterpriseGroupLearners: PropTypes.arrayOf(PropTypes.shape({})),
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(EnterpriseCustomerUserDataTable);
