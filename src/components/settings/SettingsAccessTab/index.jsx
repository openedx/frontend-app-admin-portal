import React from 'react';
import {
  Container,
  Col,
  Row,
} from '@edx/paragon';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { features } from '../../../config';
import ContactCustomerSupportButton from '../../ContactCustomerSupportButton';
import LinkManagement from './SettingsAccessLinkManagement';
import SSOManagement from './SettingsAccessSSOManagement';

const SettingsAccessTab = ({ learnerPortalEnabled }) => (
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
        <ContactCustomerSupportButton variant="outline-primary">
          Contact support
        </ContactCustomerSupportButton>
      </Col>
    </Row>
    {features.SETTINGS_UNIVERSAL_LINK && learnerPortalEnabled
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

const mapStateToProps = state => ({
  learnerPortalEnabled: state.portalConfiguration.enableLearnerPortal,
});

SettingsAccessTab.propTypes = {
  learnerPortalEnabled: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(SettingsAccessTab);
