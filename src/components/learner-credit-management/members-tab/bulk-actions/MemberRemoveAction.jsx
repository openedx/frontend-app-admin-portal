import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { RemoveCircle } from '@edx/paragon/icons';

import {
  useLicenseManagementModalState,
  licenseManagementModalZeroState as modalZeroState,
} from '../../../subscriptions/licenses/LicenseManagementModals/LicenseManagementModalHook';
import MemberRemoveModal from './MemberRemoveModal';
import { BudgetDetailPageContext } from '../../BudgetDetailPageWrapper';

const MemberRemoveAction = ({
  selectedFlatRows,
  isEntireTableSelected,
  tableInstance,
  setRefresh,
  groupUuid,
}) => {
  const [removeModal, setRemoveModal] = useLicenseManagementModalState();
  const selectedRows = selectedFlatRows.map(selectedRow => selectedRow.original);
  const tableItemCount = tableInstance.itemCount;

  const totalToRemove = isEntireTableSelected ? tableItemCount : selectedRows.length;
  const {
    successfulRemovalToast: { displayToastForRemoval },
  } = useContext(BudgetDetailPageContext);

  const handleRemoveClick = () => {
    setRemoveModal({
      isOpen: true,
      users: selectedRows,
      allUsersSelected: isEntireTableSelected,
    });
  };

  const handleRemoveCancel = () => {
    setRemoveModal(modalZeroState);
  };

  const handleRemoveSuccess = () => {
    setRemoveModal(modalZeroState);
    tableInstance.clearSelection();
    displayToastForRemoval(totalToRemove);
    setRefresh(true);
  };

  return (
    <>
      <Button
        variant="danger"
        iconBefore={RemoveCircle}
        onClick={handleRemoveClick}
        disabled={!totalToRemove}
      >
        Remove ({totalToRemove})
      </Button>
      <MemberRemoveModal
        isOpen={removeModal.isOpen}
        usersToRemove={removeModal.users}
        onClose={handleRemoveCancel}
        onSuccess={handleRemoveSuccess}
        removeAllUsers={removeModal.allUsersSelected}
        totalToRemove={totalToRemove}
        groupUuid={groupUuid}
      />
    </>
  );
};

MemberRemoveAction.defaultProps = {
  selectedFlatRows: [],
  tableInstance: {
    itemCount: 0,
    columns: [],
    clearSelection: () => {},
  },
  isEntireTableSelected: false,
};

MemberRemoveAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(
    PropTypes.shape({ original: PropTypes.shape() }),
  ),
  tableInstance: PropTypes.shape({
    itemCount: PropTypes.number.isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    clearSelection: PropTypes.func.isRequired,
  }),
  isEntireTableSelected: PropTypes.bool,
  setRefresh: PropTypes.func.isRequired,
  groupUuid: PropTypes.string.isRequired,
};

export default MemberRemoveAction;
