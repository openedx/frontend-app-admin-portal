import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  DataTable,
  TextFilter,
  CheckboxControl,
} from '@openedx/paragon';
import { useEnterpriseLearnersTableData } from './data/hooks/useEnterpriseLearnersTableData';
import { GROUP_MEMBERS_TABLE_DEFAULT_PAGE, GROUP_MEMBERS_TABLE_PAGE_SIZE } from './constants';
import MemberDetailsCell from './MemberDetailsCell';
import AddMembersBulkAction from './GroupDetailPage/AddMembersBulkAction';
import RemoveMembersBulkAction from './RemoveMembersBulkAction';
import MemberJoinedDateCell from './MemberJoinedDateCell';

export const BaseSelectWithContext = ({ row, enterpriseGroupLearners }) => {
  const {
    indeterminate,
    checked,
    ...toggleRowSelectedProps
  } = row.getToggleRowSelectedProps();
  const isAddedMember = enterpriseGroupLearners.find(learner => learner.enterpriseCustomerUserId === Number(row.id));
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

// TO-DO: add search functionality on member details once the learner endpoint is updated
// to support search
const EnterpriseCustomerUserDatatable = ({
  enterpriseId,
  learnerEmails,
  onHandleAddMembersBulkAction,
  onHandleRemoveMembersBulkAction,
  enterpriseGroupLearners,
}) => {
  const {
    isLoading,
    enterpriseCustomerUserTableData,
    fetchEnterpriseLearnersData,
  } = useEnterpriseLearnersTableData(enterpriseId, enterpriseGroupLearners);

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
        pageIndex: GROUP_MEMBERS_TABLE_DEFAULT_PAGE,
        pageSize: GROUP_MEMBERS_TABLE_PAGE_SIZE,
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
      manualSelectColumn={
        {
          id: 'selection',
          Header: DataTable.ControlledSelectHeader,
          /* eslint-disable react/no-unstable-nested-components */
          Cell: (props) => <BaseSelectWithContext enterpriseGroupLearners={enterpriseGroupLearners} {...props} />,
          disableSortBy: true,
        }
      }
    />
  );
};

EnterpriseCustomerUserDatatable.defaultProps = {
  enterpriseGroupLearners: [],
};

EnterpriseCustomerUserDatatable.propTypes = {
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
  contextKey: PropTypes.string.isRequired,
  enterpriseGroupLearners: PropTypes.arrayOf(PropTypes.shape({})),
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(EnterpriseCustomerUserDatatable);
