import {
  useCallback, useContext, useEffect, useMemo,
} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  CheckboxControl, DataTable, DataTableContext, Icon, TextFilter,
} from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';

import {
  GROUP_MEMBERS_TABLE_PAGE_SIZE, GROUP_MEMBERS_TABLE_DEFAULT_PAGE,
} from './constants';
import MemberDetailsCell from './MemberDetailsCell';
import MemberJoinedDateCell from './MemberJoinedDateCell';
import { useEnterpriseMembersTableData } from './data/hooks';
import { addEmailsAction, removeEmailsAction } from './data/actions';
import { useValidatedEmailsContext } from './data/ValidatedEmailsContext';

const FilterStatus = (rest) => <DataTable.FilterStatus showFilteredFields={false} {...rest} />;

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
  type: 'ADD ROW', row, itemCount,
});

const deleteSelectedRowAction = (rowId) => ({
  type: 'DELETE ROW', rowId,
});

const CustomSelectColumnCell = ({ row }) => {
  const { isSelected: isTableSelected } = row;
  const selectedEmail = row?.original?.enterpriseCustomerUser?.email;
  const dataTableContext = useContext(DataTableContext);
  const {
    itemCount,
    controlledTableSelections: [, dataTableDispatch],
  } = dataTableContext;
  const { dispatch: validateEmailsDispatch, lowerCasedEmails, groupEnterpriseLearners } = useValidatedEmailsContext();
  const isAddedMember = groupEnterpriseLearners.includes(selectedEmail);
  const isValidated = lowerCasedEmails.includes(selectedEmail);

  const toggleSelected = useCallback(
    () => {
      if (isTableSelected) {
        dataTableDispatch(deleteSelectedRowAction(row.id));
        validateEmailsDispatch(removeEmailsAction({ emails: [selectedEmail] }));
      } else {
        dataTableDispatch(addSelectedRowAction(row, itemCount));
        validateEmailsDispatch(addEmailsAction({ emails: [selectedEmail], actionType: 'CLICK_ACTION' }));
      }
    },
    [row, selectedEmail, itemCount, isTableSelected, dataTableDispatch, validateEmailsDispatch],
  );

  useEffect(() => {
    // If checkbox is out of sync with validated state (as after a csv upload), toggle accordingly
    if (isValidated && !isTableSelected) {
      dataTableDispatch(addSelectedRowAction(row, itemCount));
    } else if (!isValidated && isTableSelected) {
      dataTableDispatch(deleteSelectedRowAction(row.id));
    }
  }, [dataTableDispatch, itemCount, row, isTableSelected, isValidated]);

  const checkboxControlProps = useCheckboxControlProps(
    row.getToggleRowSelectedProps(),
  );

  if (isAddedMember) {
    return (<Icon src={Check} />);
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

CustomSelectColumnCell.propTypes = {
  row: PropTypes.shape({
    getToggleRowSelectedProps: PropTypes.func.isRequired,
    id: PropTypes.string,
    isSelected: PropTypes.bool,
    original: PropTypes.shape({
      enterpriseCustomerUser: PropTypes.shape({
        email: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

const EnterpriseCustomerUserDataTable = ({
  enterpriseId,
}) => {
  const enterpriseMembersTableDataContext = useEnterpriseMembersTableData({ enterpriseId });
  const {
    isLoading,
    enterpriseMembersTableData,
    fetchEnterpriseMembersTableData,
  } = enterpriseMembersTableDataContext;

  return (
    <DataTable
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
      manualSelectColumn={
        {
          id: 'selection',
          // Don't show select all checkbox
          /* eslint-disable react/jsx-no-useless-fragment */
          Header: <></>,
          /* eslint-disable react/no-unstable-nested-components */
          Cell: (row) => <CustomSelectColumnCell enterpriseId={enterpriseId} {...row} />,
          disableSortBy: true,
        }
      }
      // Don't show selection status, since we don't support selecting all
      SelectionStatusComponent={DataTable.RowStatus}
    />
  );
};

EnterpriseCustomerUserDataTable.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(EnterpriseCustomerUserDataTable);
