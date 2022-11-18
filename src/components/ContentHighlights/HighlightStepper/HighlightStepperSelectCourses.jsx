import React from 'react';
import { Stack, Col, Container } from '@edx/paragon';
import { STEPPER_STEP_TEXT } from '../data/constants';

function HighlightStepperSelectCourses() {
  return (
    <Container size="md">
      <Stack>
        <h3>{STEPPER_STEP_TEXT.selectCourses}</h3>
        <Col>
          Search Data Table Card View here
        </Col>
      </Stack>
    </Container>
  );
}

export default HighlightStepperSelectCourses;
