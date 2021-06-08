import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
} from '@edx/paragon';
import RemindButton from '../RemindButton';
import RevokeButton from '../RevokeButton';
import { ACTION_TYPES, ACTION_LABELS, COUPON_FILTER_TYPES } from './constants';

const ActionButton = ({
  couponData: {
    id,
    errors,
    available,
    title,
  },
  selectedToggle,
  code,
  handleCodeActionSuccess,
  setModalState,
}) => {
  const {
    assigned_to: assignedTo,
    is_public: isPublic,
    redemptions,
  } = code;
  let remainingUses = redemptions.total - redemptions.used;

  // Don't show `Assign/Remind/Revoke` buttons for an unavailable coupon
  if (!available) {
    return null;
  }

  // Don't show a button if all total redemptions have been used
  if (redemptions.used === redemptions.total) {
    return null;
  }

  const codeHasError = errors.find(errorItem => errorItem.code === code.code);
  if (assignedTo) {
    return (
      <>
        {!codeHasError && (
          <>
            <RemindButton
              couponId={id}
              couponTitle={title}
              data={{
                code: code.code,
                email: code.assigned_to,
              }}
              onSuccess={response => handleCodeActionSuccess(ACTION_TYPES.remind, response)}
            />
            {' | '}
          </>
        )}
        <RevokeButton
          couponId={id}
          couponTitle={title}
          data={{
            assigned_to: code.assigned_to,
            code: code.code,
          }}
          onSuccess={response => handleCodeActionSuccess(ACTION_TYPES.revoke, response)}
        />
      </>
    );
  }

  if (isPublic) {
    return null;
  }

  // exclude existing assignments of code
  if (selectedToggle === COUPON_FILTER_TYPES.unassigned) {
    remainingUses -= redemptions.num_assignments;
  }

  return (
    <Button
      variant="link"
      className="assignment-btn btn-sm p-0"
      onClick={() => setModalState({
        key: 'assignment',
        options: {
          couponId: id,
          title,
          data: {
            code,
            remainingUses,
          },
        },
      })}
    >
      {ACTION_LABELS.assign}
    </Button>
  );
};

ActionButton.propTypes = {
  couponData: PropTypes.shape({
    id: PropTypes.number.isRequired,
    errors: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string,
    })),
    available: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  selectedToggle: PropTypes.oneOf(Object.values(COUPON_FILTER_TYPES)).isRequired,
  code: PropTypes.shape({
    assigned_to: PropTypes.string,
    is_public: PropTypes.bool.isRequired,
    redemptions: PropTypes.shape({
      total: PropTypes.number.isRequired,
      used: PropTypes.number.isRequired,
      num_assignments: PropTypes.number.isRequired,
    }),
    code: PropTypes.string.isRequired,
  }).isRequired,
  handleCodeActionSuccess: PropTypes.func.isRequired,
  setModalState: PropTypes.func.isRequired,
};

export default ActionButton;
