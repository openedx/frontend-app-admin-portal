import React from 'react';
import {
  Stack, Col, Container,
} from '@edx/paragon';
import HighlightStepperSelectCoursesDataTable from './HighlightStepperSelectCoursesDataTable';
import HighlightStepperSelectCoursesHeader from './HighlightStepperSelectCoursesHeader';

const HighlightStepperSelectCourses = () => (
  <Container>
    <Stack>
      <Col md={5}>
        <HighlightStepperSelectCoursesHeader />
      </Col>
      <Col>
        <HighlightStepperSelectCoursesDataTable />
      </Col>
    </Stack>
  </Container>
);

export default HighlightStepperSelectCourses;
