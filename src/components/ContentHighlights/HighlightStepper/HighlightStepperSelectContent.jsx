import { Row, Col, Container } from '@openedx/paragon';
import HighlightStepperSelectContentSearch from './HighlightStepperSelectContentSearch';
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
        <HighlightStepperSelectContentSearch />
      </Col>
    </Row>
  </Container>
);

export default HighlightStepperSelectContent;
