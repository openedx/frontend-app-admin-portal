import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button,
  CheckboxControl, DataTable, DataTableContext, Icon, IconButtonWithTooltip, Table, TextFilter,
} from '@openedx/paragon';

import {
  GROUP_MEMBERS_TABLE_DEFAULT_PAGE, GROUP_MEMBERS_TABLE_PAGE_SIZE,
} from './constants';
import MemberDetailsCell from './MemberDetailsCell';
import AddMembersBulkAction from './GroupDetailPage/AddMembersBulkAction';
import RemoveMembersBulkAction from './RemoveMembersBulkAction';
import MemberJoinedDateCell from './MemberJoinedDateCell';
import { useEnterpriseMembersTableData } from './data/hooks';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { HelpOutline } from '@openedx/paragon/icons';

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
        checked={checked}
        disabled={isAddedMember}
        style={{ cursor: isAddedMember ? null : 'pointer' }}
      />
    </div>
  );
};
const FilterStatus = (rest) => <DataTable.FilterStatus showFilteredFields={false} {...rest} />;

const EnterpriseCustomerUserDataTableContext = createContext();

const useCheckboxControlProps = (props) => {
  const updatedProps = useMemo(
    () => {
      const { indeterminate, ...rest } = props;
      return { isIndeterminate: indeterminate, ...rest };
    },
    [props],
  );
  return updatedProps;
};

const addSelectedRowAction = (row, itemCount) => ({
  type: 'ADD ROW',
  row,
  itemCount,
});

const deleteSelectedRowAction = (rowId) => ({
  type: 'DELETE ROW',
  rowId,
});

function getSelectedRowsFromGroupLearners(enterpriseGroupLearners) {
  const selections = enterpriseGroupLearners.reduce((acc, learner) => {
    acc[learner.lmsUserId] = true;
    return acc;
  }, {});
  return selections;
}

const CustomSelectColumnCell = ({ row }) => {
  const { enterpriseGroupLearners } = useContext(EnterpriseCustomerUserDataTableContext);
  const [isAddedMember, setIsAddedMember] = useState(false);
  const {
    itemCount,
    controlledTableSelections: [, dispatch],
  } = useContext(DataTableContext);

  const toggleSelected = useCallback(
    () => {
      if (row.isSelected) {
        dispatch(deleteSelectedRowAction(row.id));
      } else {
        dispatch(addSelectedRowAction(row, itemCount));
      }
    },
    [itemCount, row, dispatch],
  );

  useEffect(() => {
    setIsAddedMember(!!enterpriseGroupLearners.find(learner => learner.lmsUserId === Number(row.id)));
  }, [enterpriseGroupLearners, row.id]);

  const checkboxControlProps = useCheckboxControlProps(
    row.getToggleRowSelectedProps(),
  );

  if (isAddedMember) {
    return (
      <IconButtonWithTooltip
        tooltipContent={<div>This learner is already a member of this group.</div>}
        src={HelpOutline}
        iconAs={Icon}
        size="inline"
      />
    );
  }

  return (
    <div className="pgn__data-table__controlled-select">
      <CheckboxControl
        {...checkboxControlProps}
        onChange={toggleSelected}
        disabled={isAddedMember}
        style={{ cursor: isAddedMember ? null : 'pointer' }}
      />
    </div>
  );
};

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
    // Cell: DataTable.ControlledSelect,
    Cell: CustomSelectColumnCell,
    disableSortBy: true,
  };

  const contextValue = useMemo(() => ({
    enterpriseGroupLearners,
  }), [enterpriseGroupLearners]);

  return (
    <EnterpriseCustomerUserDataTableContext.Provider value={contextValue}>
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
          // selectedRowIds: getSelectedRowsFromGroupLearners(enterpriseGroupLearners),
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
        // onSelectedRowsChanged={(selectedRows) => {
        //   console.log('DEBUG?! onSelectedRowsChanged selectedRows', selectedRows);
        // }}
      />
    </EnterpriseCustomerUserDataTableContext.Provider>
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
