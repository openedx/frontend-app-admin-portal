import React from 'react';
import {
  Row, Col, Icon, Container,
} from '@edx/paragon';
import { EditCircle } from '@edx/paragon/icons';

import { STEPPER_STEP_TEXT } from '../data/constants';
import HighlightStepperTitleInput from './HighlightStepperTitleInput';

const HighlightStepperTitle = () => (
  <Container>
    <Row>
      <Col xs={12} md={8} lg={6}>
        <h3 className="mb-3 d-flex align-items-center">
          <Icon src={EditCircle} className="mr-2 text-brand" />
          {STEPPER_STEP_TEXT.HEADER_TEXT.createTitle}
        </h3>
        <div className="mb-4.5">
          <p>
            Create a unique title for your highlight. This title is visible
            to your learners and helps them navigate to relevant content.
          </p>
          <p>
            <strong>
              Pro tip: we recommend naming your highlight collection to reflect skills
              it aims to develop, or to draw the attention of specific groups it targets.
              For example, &quot;Recommended for Marketing&quot; or &quot;Develop Leadership
              Skills&quot;.
            </strong>
          </p>
        </div>
        <HighlightStepperTitleInput />
      </Col>
    </Row>
  </Container>
);

export default HighlightStepperTitle;
