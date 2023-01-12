import React from 'react';
import { useContextSelector } from 'use-context-selector';
import { Icon } from '@edx/paragon';
import { AddCircle } from '@edx/paragon/icons';
import { MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET, STEPPER_STEP_TEXT } from '../data/constants';
import { ContentHighlightsContext } from '../ContentHighlightsContext';

const HighlightStepperSelectContentTitle = () => {
  const highlightTitle = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.highlightTitle);
  return (
    <>
      <h3 className="mb-3 d-flex align-items-center">
        <Icon src={AddCircle} className="mr-2 text-brand" />
        {STEPPER_STEP_TEXT.HEADER_TEXT.selectContent}
      </h3>
      <p>
        Select up to <b>{MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET}</b> items for &quot;{highlightTitle}&quot;. Courses
        in learners&apos; portal appear in the order of selection.
      </p>
      <p>
        <strong>
          Pro tip: a highlight can include courses similar to each other for your learners to choose from,
          or courses that vary in subtopics to help your learners master a larger topic.
        </strong>
      </p>
    </>
  );
};
export default HighlightStepperSelectContentTitle;
