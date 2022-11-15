import React from 'react';
import {
  Stack, Col, Icon, Container,
} from '@edx/paragon';
import { AddCircle } from '@edx/paragon/icons';
import { STEPPER_STEP_TEXT } from '../data/constants';
import HighlightStepperTitleInput from './HighlightStepperTitleInput';

const HighlightStepperTitle = () => (
  <Container>
    <Stack>
      <Col md={5}>
        <Stack className="mb-3" direction="horizontal">
          <Icon src={AddCircle} />
          <Col>
            <h3 className="m-0">{STEPPER_STEP_TEXT.createTitle}</h3>
          </Col>
        </Stack>
        <div className="mb-5">
          <p>
            Create a unique title for your highlight. This title is visible
            to your learners and helps them navigate to relevant content.
          </p>
          <p>
            <strong>
              Pro tip: we recommend naming your highlight collection to reflect skills
              it aims to develop, or to draw the attention of specific groups it targets.
              For example, &quot;Recommended for Marketing&quot; or &quot;Develop Leadership Skills&quot;
            </strong>
          </p>
        </div>
        <HighlightStepperTitleInput />
      </Col>
    </Stack>
  </Container>
);
export default HighlightStepperTitle;
