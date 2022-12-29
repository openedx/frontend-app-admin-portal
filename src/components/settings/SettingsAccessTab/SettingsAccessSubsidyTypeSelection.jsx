import React, { useCallback, useState, useMemo } from 'react';
import {
  Form,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';
import ConfirmationModal, { CONFIRM_BUTTON_STATES } from '../../ConfirmationModal';
import { SUBSIDY_TYPE_LABELS } from '../data/constants';

const SettingsAccessSubsidyTypeSelection = ({
  subsidyRequestConfiguration,
  updateSubsidyRequestConfiguration,
  subsidyTypes,
}) => {
  const [selectedSubsidyType, setSelectedSubsidyType] = useState(subsidyRequestConfiguration?.subsidyType);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const confirmModalButtonState = useMemo(() => {
    if (error) {
      return CONFIRM_BUTTON_STATES.errored;
    }

    if (isLoading) {
      return CONFIRM_BUTTON_STATES.pending;
    }

    return CONFIRM_BUTTON_STATES.default;
  }, [error, isLoading]);

  const handleSelection = useCallback((value) => {
    if (value !== selectedSubsidyType) {
      setIsModalOpen(true);
    }
  }, [selectedSubsidyType]);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await updateSubsidyRequestConfiguration({
        subsidyType: selectedSubsidyType,
      });
      setIsModalOpen(false);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubsidyType, updateSubsidyRequestConfiguration]);

  return (
    <>
      <p>
        Select a subsidy type to distribute.
        Learners will browse and request courses from the associated catalog.
      </p>
      <Form.RadioSet
        name="subsidy-type-selection"
        onChange={(e) => setSelectedSubsidyType(e.target.value)}
        value={selectedSubsidyType}
        isInline
      >
        {subsidyTypes.map(
          subsidyType => (
            <Form.Radio
              key={`subsidy-type-selection-${subsidyType}`}
              className="mr-3"
              value={subsidyType}
              onClick={(ev) => handleSelection(ev.target.value)}
            >
              {SUBSIDY_TYPE_LABELS[subsidyType]}
            </Form.Radio>
          ),
        )}
      </Form.RadioSet>
      <ConfirmationModal
        isOpen={isModalOpen}
        confirmButtonLabels={
          {
            [CONFIRM_BUTTON_STATES.default]: 'Confirm selection',
            [CONFIRM_BUTTON_STATES.pending]: 'Updating subsidy type...',
            [CONFIRM_BUTTON_STATES.errored]: 'Try again',
          }
        }
        confirmButtonState={confirmModalButtonState}
        onConfirm={handleConfirm}
        onClose={() => {
          setSelectedSubsidyType(subsidyRequestConfiguration?.subsidyType);
          setIsModalOpen(false);
        }}
        body={
          `Setting your selection to "${SUBSIDY_TYPE_LABELS[selectedSubsidyType]}" is permanent,
           and can only be changed through customer support.`
        }
      />
    </>
  );
};

SettingsAccessSubsidyTypeSelection.propTypes = {
  subsidyRequestConfiguration: PropTypes.shape({
    subsidyType: PropTypes.oneOf(Object.values(SUPPORTED_SUBSIDY_TYPES)),
  }).isRequired,
  subsidyTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  updateSubsidyRequestConfiguration: PropTypes.func.isRequired,
};

export default SettingsAccessSubsidyTypeSelection;
