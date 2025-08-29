import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { RemoveCircle } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
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
        <FormattedMessage
          id="learnerCreditManagement.budgetDetail.membersTab.membersTable.remove"
          defaultMessage="Remove ({totalToRemove})"
          description="Remove button text in the Members table"
          values={{ totalToRemove }}
        />
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
