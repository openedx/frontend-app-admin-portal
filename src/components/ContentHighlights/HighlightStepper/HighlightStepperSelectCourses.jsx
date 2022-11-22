import React from 'react';
import {
  Row, Col, Container,
} from '@edx/paragon';
import HighlightStepperSelectCoursesDataTable from './HighlightStepperSelectCoursesDataTable';
import HighlightStepperSelectCoursesHeader from './HighlightStepperSelectCoursesHeader';

const HighlightStepperSelectCourses = () => (
  <Container>
    <Row>
      <Col md={5}>
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
