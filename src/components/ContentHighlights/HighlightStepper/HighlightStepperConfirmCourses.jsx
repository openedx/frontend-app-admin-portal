import React from 'react';
import { Container, Stack, Col } from '@edx/paragon';
import { STEPPER_STEP_TEXT } from '../data/constants';

const HighlightStepperConfirmCourses = () => (
  <Container size="md">
    <Stack>
      <h3>{STEPPER_STEP_TEXT.confirmContent}</h3>
      <Col>
        Search Data Table Card View here
      </Col>
    </Stack>
  </Container>
);

export default HighlightStepperConfirmCourses;
