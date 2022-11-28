import React from 'react';
import {
  Row, Col, Container,
} from '@edx/paragon';
import HighlightStepperSelectCoursesDataTable from './HighlightStepperSelectCoursesDataTable';
import HighlightStepperSelectCoursesHeader from './HighlightStepperSelectCoursesHeader';

const HighlightStepperSelectCourses = () => (
  <Container>
    <Row>
      <Col xs={12} md={8} lg={6}>
        <HighlightStepperSelectCoursesHeader />
      </Col>
    </Row>
    <Row>
      <Col>
        <HighlightStepperSelectCoursesDataTable />
      </Col>
    </Row>
  </Container>
);

export default HighlightStepperSelectCourses;
