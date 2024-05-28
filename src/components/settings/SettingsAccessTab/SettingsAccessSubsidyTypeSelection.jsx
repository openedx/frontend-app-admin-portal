import React, { useCallback, useState, useMemo } from 'react';
import {
  Form,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
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
  const intl = useIntl();

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

  const selectedSubsidyTypeLabel = SUBSIDY_TYPE_LABELS[selectedSubsidyType]
    && intl.formatMessage(SUBSIDY_TYPE_LABELS[selectedSubsidyType]);

  return (
    <>
      <p>
        <FormattedMessage
          id="adminPortal.settings.access.subsidyTypeSelection.description"
          defaultMessage="Select a subsidy type to distribute. Learners will browse and request courses from the associated catalog."
          description="Description for the subsidy type selection section."
        />

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
              <FormattedMessage {...SUBSIDY_TYPE_LABELS[subsidyType]} />
            </Form.Radio>
          ),
        )}
      </Form.RadioSet>
      <ConfirmationModal
        isOpen={isModalOpen}
        confirmButtonLabels={
          {
            [CONFIRM_BUTTON_STATES.default]: intl.formatMessage({
              id: 'adminPortal.settings.access.subsidyTypeSelection.confirm',
              defaultMessage: 'Confirm selection',
              description: 'Confirm button label for selecting a subsidy type.',
            }),
            [CONFIRM_BUTTON_STATES.pending]: intl.formatMessage({
              id: 'adminPortal.settings.access.subsidyTypeSelection.updating',
              defaultMessage: 'Updating subsidy type...',
              description: 'Updating subsidy type confirmation message.',
            }),
            [CONFIRM_BUTTON_STATES.errored]: intl.formatMessage({
              id: 'adminPortal.settings.access.subsidyTypeSelection.tryAgain',
              defaultMessage: 'Try again',
              description: 'Try again button label for selecting a subsidy type.',
            }),
          }
        }
        confirmButtonState={confirmModalButtonState}
        onConfirm={handleConfirm}
        onClose={() => {
          setSelectedSubsidyType(subsidyRequestConfiguration?.subsidyType);
          setIsModalOpen(false);
        }}
        body={intl.formatMessage({
          id: 'adminPortal.settings.access.subsidyTypeSelection.confirmation',
          defaultMessage: `Setting your selection to "{selectedSubsidyType}" is permanent,
              and can only be changed through customer support.`,
          description: 'Confirmation message for selecting a subsidy type.',
        }, { selectedSubsidyType: selectedSubsidyTypeLabel })}
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
