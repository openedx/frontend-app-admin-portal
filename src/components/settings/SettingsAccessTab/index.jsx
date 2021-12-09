import React from 'react';
import {
  Container,
  Col,
  Row,
} from '@edx/paragon';

import SupportButton from '../../common/ContactCustomerSupportButton';
import LinkManagement from './LinkManagement';

const SettingsAccessTab = () => (
  <Container fluid className="pl-0">
    <Row>
      <Col>
        <h2>Enable browsing on-demand</h2>
      </Col>
    </Row>
    <Row className="mb-4">
      <Col>
        <p>
          Allow learners without a subsidy to browse the catalog and request enrollment to courses.
          Browsing on demand will expire at the end of your latest subscription.
        </p>
      </Col>
      <Col md="auto">
        <SupportButton variant="outline-primary">
          Contact support
        </SupportButton>
      </Col>
    </Row>
    <Row>
      <Col>
        <LinkManagement />
      </Col>
    </Row>
  </Container>
);

export default SettingsAccessTab;
