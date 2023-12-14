import React from 'react';
import {
  Row, Col, Icon, Container,
} from '@openedx/paragon';
import { EditCircle } from '@openedx/paragon/icons';

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
            {STEPPER_STEP_TEXT.SUB_TEXT.createTitle}
          </p>
          <p>
            <strong>
              {STEPPER_STEP_TEXT.PRO_TIP_TEXT.createTitle}
            </strong>
          </p>
        </div>
        <HighlightStepperTitleInput />
      </Col>
    </Row>
  </Container>
);

export default HighlightStepperTitle;
