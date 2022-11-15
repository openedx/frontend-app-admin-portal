import React, { useContext } from 'react';
import {
  Stack, Col, Icon,
} from '@edx/paragon';
import { AddCircle } from '@edx/paragon/icons';
import { MAX_COURSES_PER_HIGHLIGHT, STEPPER_STEP_TEXT } from '../data/constants';
import { ContentHighlightsContext } from '../ContentHighlightsContext';

const HighlightStepperSelectCoursesTitle = () => {
  const { stepperModal: { highlightTitle } } = useContext(ContentHighlightsContext);
  return (
    <>
      <Stack className="mb-3" direction="horizontal">
        <Icon src={AddCircle} />
        <Col>
          <h3 className="m-0">{STEPPER_STEP_TEXT.selectCourses}</h3>
        </Col>
      </Stack>
      <div className="mb-5">
        <p>
          Select up to {MAX_COURSES_PER_HIGHLIGHT} courses for &quot;{highlightTitle}&quot;.
          Courses in Learner&apos;s Portal appear in order of selection.
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
