import React from 'react';
import { useContextSelector } from 'use-context-selector';
import { Icon } from '@edx/paragon';
import { AddCircle } from '@edx/paragon/icons';
import { MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET, STEPPER_STEP_TEXT } from '../data/constants';
import { ContentHighlightsContext } from '../ContentHighlightsContext';

const HighlightStepperSelectCoursesTitle = () => {
  const highlightTitle = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.highlightTitle);
  return (
    <>
      <h3 className="mb-3 d-flex align-items-center">
        <Icon src={AddCircle} className="mr-2 color-brand-tertiary" />
        {STEPPER_STEP_TEXT.selectCourses}
      </h3>
      <div className="mb-5">
        <p>
          Select up to <b>{MAX_CONTENT_ITEMS_PER_HIGHLIGHT_SET}</b> courses for &quot;{highlightTitle}&quot;.
        </p>
        <p>
          <strong>
            Pro tip: a highlight can include courses similar to each other for your learners to choose from,
            or courses that vary in subtopics to help your learners master a larger topic.
          </strong>
        </p>
      </div>
    </>
  );
};
export default HighlightStepperSelectCoursesTitle;
