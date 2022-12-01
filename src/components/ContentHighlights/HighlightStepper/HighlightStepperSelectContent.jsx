import React from 'react';
import {
  Row, Col, Container,
} from '@edx/paragon';
import HighlightStepperSelectContentDataTable from './HighlightStepperSelectContentDataTable';
import HighlightStepperSelectContentHeader from './HighlightStepperSelectContentHeader';

const HighlightStepperSelectContent = () => (
  <Container>
    <Row>
      <Col xs={12} md={8} lg={6}>
        <HighlightStepperSelectContentHeader />
      </Col>
    </Row>
    <Row>
      <Col>
        <HighlightStepperSelectContentDataTable />
      </Col>
    </Row>
  </Container>
);

export default HighlightStepperSelectContent;
