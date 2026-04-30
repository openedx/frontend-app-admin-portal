import React from 'react';
import { useContextSelector } from 'use-context-selector';
import { Icon } from '@openedx/paragon';
import { AddCircle } from '@openedx/paragon/icons';
import { STEPPER_STEP_TEXT } from '../data/constants';
import { ContentHighlightsContext } from '../ContentHighlightsContext';

const HighlightStepperSelectContentTitle = () => {
  const highlightTitle = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.highlightTitle);
  const isEditMode = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.isEditMode);
  return (
    <>
      <h3 className="mb-3 d-flex align-items-center">
        <Icon src={AddCircle} className="mr-2 text-brand" />
        {isEditMode
          ? STEPPER_STEP_TEXT.HEADER_TEXT.editSelectContent
          : STEPPER_STEP_TEXT.HEADER_TEXT.selectContent}
      </h3>
      <p>
        {isEditMode
          ? STEPPER_STEP_TEXT.SUB_TEXT.editSelectContent(highlightTitle)
          : STEPPER_STEP_TEXT.SUB_TEXT.selectContent(highlightTitle)}
      </p>
      <p>
        <strong>
          {STEPPER_STEP_TEXT.PRO_TIP_TEXT.selectContent}
        </strong>
      </p>
    </>
  );
};
export default HighlightStepperSelectContentTitle;
