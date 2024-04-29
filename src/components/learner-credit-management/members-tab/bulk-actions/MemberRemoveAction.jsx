import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { RemoveCircle } from '@edx/paragon/icons';
import MemberRemoveModal from './MemberRemoveModal';
import useRemoveMember from '../../data/hooks/useRemoveMember';

const MemberRemoveAction = ({
  selectedFlatRows,
  isEntireTableSelected,
  tableInstance,
  refresh,
  setRefresh,
  groupUuid,
}) => {
  const {
    totalToRemove, removeModal, handleRemoveClick, handleRemoveCancel, handleRemoveSuccess,
  } = useRemoveMember(selectedFlatRows, isEntireTableSelected, tableInstance, refresh, setRefresh);

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
  refresh: PropTypes.bool.isRequired,
  setRefresh: PropTypes.func.isRequired,
  groupUuid: PropTypes.string.isRequired,
};

export default MemberRemoveAction;
