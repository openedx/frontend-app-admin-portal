import React from 'react';
import {
  Container,
  Col,
  Row,
} from '@edx/paragon';

import { features } from '../../../config';
import SupportButton from '../../common/ContactCustomerSupportButton';
import LinkManagement from './SettingsAccessLinkManagement';
import SSOManagement from './SettingsAccessSSOManagement';

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
    {features.SETTINGS_UNIVERSAL_LINK
      && (
      <div className="mb-4">
        <LinkManagement />
      </div>
      )}
    <div className="mb-4">
      <SSOManagement />
    </div>
  </Container>
);

export default SettingsAccessTab;
