import React from 'react';
import { Stack, Container } from '@edx/paragon';
import { STEPPER_STEP_TEXT } from '../data/constants';

function HighlightStepperConfirmHighlight() {
  return (
    <Container size="md">
      <Stack>
        <h3>{STEPPER_STEP_TEXT.confirmHighlight}</h3>
        <p>Yay</p>
      </Stack>
    </Container>
  );
}

export default HighlightStepperConfirmHighlight;
