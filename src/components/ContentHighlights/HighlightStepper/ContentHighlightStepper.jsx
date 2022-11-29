import React, {
  useCallback,
  useEffect,
  useState,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import { useContextSelector } from 'use-context-selector';
import { connect } from 'react-redux';
import {
  Stepper, FullscreenModal, Button, StatefulButton,
} from '@edx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform';

import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import HighlightStepperTitle from './HighlightStepperTitle';
import HighlightStepperSelectContent from './HighlightStepperSelectContent';
import HighlightStepperConfirmContent from './HighlightStepperConfirmContent';
import HighlightStepperFooterHelpLink from './HighlightStepperFooterHelpLink';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import { enterpriseCurationActions } from '../../EnterpriseApp/data/enterpriseCurationReducer';

const STEPPER_STEP_LABELS = {
  CREATE_TITLE: 'Create a title',
  SELECT_CONTENT: 'Select content',
  CONFIRM_PUBLISH: 'Confirm and publish',
};

const steps = [
  STEPPER_STEP_LABELS.CREATE_TITLE,
  STEPPER_STEP_LABELS.SELECT_CONTENT,
  STEPPER_STEP_LABELS.CONFIRM_PUBLISH,
];

/**
 * Stepper to support create user flow for a highlight set.
 */
const ContentHighlightStepper = ({ enterpriseId }) => {
  const {
    enterpriseCuration: {
      dispatch: dispatchEnterpriseCuration,
    },
  } = useContext(EnterpriseAppContext);
  const [currentStep, setCurrentStep] = useState(steps[0]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const isStepperModalOpen = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.isOpen);
  const titleStepValidationError = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.titleStepValidationError,
  );
  const highlightTitle = useContextSelector(
    ContentHighlightsContext,
    v => v[0].stepperModal.highlightTitle,
  );
  const setState = useContextSelector(ContentHighlightsContext, v => v[1]);

  const closeStepperModal = useCallback(() => {
    setState(s => ({
      ...s,
      stepperModal: {
        ...s.stepperModal,
        isOpen: false,
        highlightTitle: null,
        currentSelectedRowIds: {},
      },
    }));
    setCurrentStep(steps[0]);
  }, [setState]);

  useEffect(() => {
    if (isPublished) {
      closeStepperModal();
    }
  }, [closeStepperModal, isPublished]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const newHighlightSet = {
        title: highlightTitle,
        isPublished: true,
      };
      const response = await EnterpriseCatalogApiService.createHighlightSet(enterpriseId, newHighlightSet);
      const result = camelCaseObject(response.data);
      const transformedHighlightSet = {
        cardImageUrl: result.cardImageUrl,
        isPublished: result.isPublished,
        title: result.title,
        uuid: result.uuid,
        highlightedContentUuids: [],
      };
      dispatchEnterpriseCuration(enterpriseCurationActions.addHighlightSet(transformedHighlightSet));
      setIsPublished(true);
    } catch (error) {
      logError(error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Stepper activeKey={currentStep}>
      <FullscreenModal
        title="New highlight"
        className="bg-light-200"
        isOpen={isStepperModalOpen}
        onClose={closeStepperModal}
        beforeBodyNode={<Stepper.Header className="border-bottom border-light" />}
        footerNode={(
          <>
            <Stepper.ActionRow eventKey={STEPPER_STEP_LABELS.CREATE_TITLE}>
              <HighlightStepperFooterHelpLink />
              <Stepper.ActionRow.Spacer />
              {/* TODO: Eventually would need a check to see if the user has made any changes
                to the form before allowing them to close the modal without saving. */}
              <Button
                variant="tertiary"
                onClick={() => closeStepperModal()}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setCurrentStep(STEPPER_STEP_LABELS.SELECT_CONTENT)}
                disabled={!!titleStepValidationError || !highlightTitle}
              >
                Next
              </Button>
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey={STEPPER_STEP_LABELS.SELECT_CONTENT}>
              <HighlightStepperFooterHelpLink />
              <Stepper.ActionRow.Spacer />
              <Button
                variant="tertiary"
                onClick={() => setCurrentStep(STEPPER_STEP_LABELS.CREATE_TITLE)}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setCurrentStep(STEPPER_STEP_LABELS.CONFIRM_PUBLISH)}
              >
                Next
              </Button>
            </Stepper.ActionRow>

            <Stepper.ActionRow eventKey={STEPPER_STEP_LABELS.CONFIRM_PUBLISH}>
              <HighlightStepperFooterHelpLink />
              <Stepper.ActionRow.Spacer />
              <Button
                variant="tertiary"
                onClick={() => setCurrentStep(STEPPER_STEP_LABELS.SELECT_CONTENT)}
              >
                Back
              </Button>
              <StatefulButton
                labels={{
                  default: 'Publish',
                  pending: 'Publishing...',
                }}
                variant="primary"
                onClick={handlePublish}
                state={isPublishing ? 'pending' : 'default'}
              />
            </Stepper.ActionRow>
          </>
          )}
      >
        <Stepper.Step
          eventKey={STEPPER_STEP_LABELS.CREATE_TITLE}
          title={STEPPER_STEP_LABELS.CREATE_TITLE}
          hasError={!!titleStepValidationError}
          description={titleStepValidationError || ''}
          index={steps.indexOf(STEPPER_STEP_LABELS.CREATE_TITLE)}
        >
          <HighlightStepperTitle />
        </Stepper.Step>

        <Stepper.Step
          eventKey={STEPPER_STEP_LABELS.SELECT_CONTENT}
          title={STEPPER_STEP_LABELS.SELECT_CONTENT}
          index={steps.indexOf(STEPPER_STEP_LABELS.SELECT_CONTENT)}
        >
          <HighlightStepperSelectContent />
        </Stepper.Step>

        <Stepper.Step
          eventKey={STEPPER_STEP_LABELS.CONFIRM_PUBLISH}
          title={STEPPER_STEP_LABELS.CONFIRM_PUBLISH}
          index={steps.indexOf(STEPPER_STEP_LABELS.CONFIRM_PUBLISH)}
        >
          <HighlightStepperConfirmContent />
        </Stepper.Step>
      </FullscreenModal>
    </Stepper>
  );
};

ContentHighlightStepper.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(ContentHighlightStepper);
