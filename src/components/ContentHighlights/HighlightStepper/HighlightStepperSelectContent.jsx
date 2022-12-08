import React from 'react';
import {
  Row, Col, Container,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import HighlightStepperSelectContentDataTable from './HighlightStepperSelectContentDataTable';
import HighlightStepperSelectContentHeader from './HighlightStepperSelectContentHeader';

const HighlightStepperSelectContent = ({ enterpriseId }) => (
  <Container>
    <Row>
      <Col xs={12} md={8} lg={6}>
        <HighlightStepperSelectContentHeader />
      </Col>
    </Row>
    <Row>
      <Col>
        <HighlightStepperSelectContentDataTable enterpriseId={enterpriseId} />
      </Col>
    </Row>
  </Container>
);

HighlightStepperSelectContent.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default HighlightStepperSelectContent;
