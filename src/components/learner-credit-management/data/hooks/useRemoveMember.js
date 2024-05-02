import { useCallback, useContext } from 'react';
import {
  useLicenseManagementModalState, licenseManagementModalZeroState as modalZeroState,
} from '../../../subscriptions/licenses/LicenseManagementModals/LicenseManagementModalHook';
import { BudgetDetailPageContext } from '../../BudgetDetailPageWrapper';

const useRemoveMember = (
  selectedFlatRows,
  isEntireTableSelected,
  tableInstance,
  refreshMembersTab,
  setRefreshMembersTab,
) => {
  const [removeModal, setRemoveModal] = useLicenseManagementModalState();

  const selectedRows = selectedFlatRows.filter(row => row.original.status !== 'removed');
  // if we're removing through the kabob menu, just one row is selected
  let tableItemCount = 1;
  let totalToRemove = 1;
  if (tableInstance !== null) {
    tableItemCount = tableInstance.itemCount;
    totalToRemove = isEntireTableSelected ? tableItemCount : selectedRows.length;
  }
  const {
    successfulRemovalToast: { displayToastForRemoval },
  } = useContext(BudgetDetailPageContext);

  const handleRemoveClick = useCallback(async () => {
    setRemoveModal({
      isOpen: true,
      users: selectedRows,
      allUsersSelected: isEntireTableSelected,
    });
  }, [isEntireTableSelected, selectedRows, setRemoveModal]);

  const handleRemoveCancel = useCallback(async () => {
    setRemoveModal(modalZeroState);
  }, [setRemoveModal]);

  const handleRemoveSuccess = useCallback(async () => {
    setRemoveModal(modalZeroState);
    if (tableInstance !== null) {
      tableInstance.clearSelection();
    }
    displayToastForRemoval({ totalLearnersRemoved: totalToRemove });
    setRefreshMembersTab(!refreshMembersTab);
  }, [displayToastForRemoval, refreshMembersTab, setRefreshMembersTab, setRemoveModal, tableInstance, totalToRemove]);

  return {
    totalToRemove,
    removeModal,
    handleRemoveClick,
    handleRemoveCancel,
    handleRemoveSuccess,
  };
};

export default useRemoveMember;
