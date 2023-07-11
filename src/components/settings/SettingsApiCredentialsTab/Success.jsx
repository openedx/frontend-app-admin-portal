import React from 'react';
import {
  Col, Row, Hyperlink, Button,
} from '@edx/paragon';

const Success = () => (
  <div>
    <Row>
      <Col>
        <h3>Your API credentials</h3>
      </Col>
    </Row>
    <Row className="mb-4 justify-content-between">
      <Col lg={8} xl={9}>
        <p>
          Copy and paste the following information and send it to your API developer(s).
        </p>
      </Col>
    </Row>
    <Row className="justify-content-around">
      <Col>
        <h4>Application name:</h4>
      </Col>
    </Row>
    <Row className="justify-content-around">
      <Col>
        <h4>Allowed URLs:</h4>
      </Col>
    </Row>
    <Row className="justify-content-around">
      <Col>
        <h4>API client secret</h4>
      </Col>
    </Row>
    <Row className="mb-4 justify-content-between">
      <Col>
        <h4>API client documentation:</h4>
      </Col>
    </Row>
    <Row>
      <Col>
        <h3>Redirect URLs (optional)</h3>
      </Col>
    </Row>
    <Row className="mb-4 justify-content-between">
      <Col lg={8} xl={9}>
        <p>
          If you need additional redirect URLs, add them below and regenerate your API credentials.
          You will need to communicate the new credentials to your API developers.
        </p>
      </Col>
    </Row>
    <Row>
      <Col>
        <Button
          variant="primary"
          className="mb-2 mb-sm-0"
        >
          Regenerate API Credentials
        </Button>
      </Col>
    </Row>
    <Row>
      <Col>
        <h3>Questions or modifications?</h3>
      </Col>
    </Row>
    <Row className="mb-4 justify-content-between">
      <Col lg={8} xl={9}>
        <p>
          To troubleshoot your API credentialing, or to request additional API endpoints to your credentials,&nbsp;
          <Hyperlink destination="https://www.edx.org" target="_blank">
            contact ECS.
          </Hyperlink>
        </p>
      </Col>
    </Row>
  </div>
);

export default Success;

