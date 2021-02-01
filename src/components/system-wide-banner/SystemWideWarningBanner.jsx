import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Container, Row, Col, Icon,
} from '@edx/paragon';
import { WarningFilled } from '@edx/paragon/icons';

const SystemWideWarningBanner = ({ children }) => (
  <Alert
    variant="warning"
    className="small p-0 py-2 rounded-0 mb-0"
  >
    <Container>
      <Row>
        <Col
          xs={12}
          md={{ span: 10, offset: 1 }}
          lg={{ span: 8, offset: 2 }}
          className="d-flex justify-content-center align-items-center"
        >
          <Icon className="flex-shrink-0 mr-3" src={WarningFilled} />
          <p className="mb-0">
            {children}
          </p>
        </Col>
      </Row>
    </Container>
  </Alert>
);

SystemWideWarningBanner.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SystemWideWarningBanner;
