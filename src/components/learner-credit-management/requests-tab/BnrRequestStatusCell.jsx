import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@openedx/paragon';
import { QuestionAnswerOutline, Block, Error } from '@openedx/paragon/icons';
import { capitalizeFirstLetter } from '../../../utils';
import RequestFailureModal from './RequestFailureModal';

const BnrRequestStatusCell = ({ row }) => {
  const { requestStatus, latestAction } = row.original;
  const errorReason = latestAction?.errorReason;
  const recentAction = latestAction?.recentAction;
  const [target, setTarget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format error reasons for display
  const formatErrorReason = (reason) => {
    if (!reason) {
      return null;
    }

    const errorReasonMap = {
      failed_approval: 'Failed: Approval',
      failed_cancellation: 'Failed: Cancellation',
      failed_system: 'Failed: System Error',
      failed_payment: 'Failed: Payment',
      failed_enrollment: 'Failed: Enrollment',
    };

    return errorReasonMap[reason]
      || reason.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(': ');
  };
  const getStatusConfig = useMemo(() => {
    const statusConfigs = {
      requested: {
        icon: QuestionAnswerOutline,
        label: 'Requested',
      },
      declined: {
        icon: Block,
        label: 'Declined',
      },
      cancelled: {
        icon: Block,
        label: 'Cancelled',
      },
    };

    return statusConfigs[requestStatus] || {
      icon: Error,
      label: capitalizeFirstLetter(requestStatus),
    };
  }, [requestStatus]);

  const handleChipClick = () => {
    if (errorReason) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Determine what to display in the chip
  const formattedErrorReason = formatErrorReason(errorReason);
  const displayText = formattedErrorReason || getStatusConfig.label;
  const displayIcon = errorReason ? Error : getStatusConfig.icon;
  const displayVariant = errorReason ? 'dark' : '';
  const isClickable = !!errorReason;

  return (
    <>
      <Chip
        ref={setTarget}
        iconBefore={displayIcon}
        iconBeforeAlt={`${displayText} icon`}
        variant={displayVariant}
        onClick={isClickable ? handleChipClick : undefined}
        tabIndex={isClickable ? 0 : -1}
        style={{ cursor: isClickable ? 'pointer' : 'default' }}
        onKeyPress={isClickable ? handleChipClick : undefined}
      >
        {displayText}
      </Chip>

      {errorReason && (
        <RequestFailureModal
          errorReason={formattedErrorReason}
          isOpen={isModalOpen}
          onClose={closeModal}
          target={target}
          recentAction={recentAction}
        />
      )}
    </>
  );
};

BnrRequestStatusCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      requestStatus: PropTypes.string,
      latestAction: PropTypes.shape({
        errorReason: PropTypes.string,
        recentAction: PropTypes.string,
      }),
    }),
  }).isRequired,
};

export default BnrRequestStatusCell;
