import React, { useState } from 'react';
import {
  Col, Row, Hyperlink, Form, Button, Toast
} from '@edx/paragon';
import { ContentCopy } from '@edx/paragon/icons';
import RegenarateCredentialWarningModal from './RegenarateCredentialWarningModal';
import CopiedButton from './CopiedButton';

const SuccessPage = () => {
  const [showToast, setShowToast] = useState(true);

  return (
    <div>
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
      >
        API credentials successfully generated
      </Toast>
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
          <h4>Application name:{}</h4>
        </Col>
      </Row>
      <Row className="justify-content-around">
        <Col>
          <h4>Allowed URLs:{}</h4>
        </Col>
      </Row>
      <Row className="justify-content-around">
        <Col>
          <h4>API client secret:{}</h4>
        </Col>
      </Row>
      <Row className="justify-content-around">
        <Col>
          <h4>API client documentation:</h4>
        </Col>
      </Row>
      <Row className="justify-content-around">
        <Col>
          <h4>Last generated on:{}</h4>
        </Col>
      </Row>
      <Row className="justify-content-around">
        <Col>
          {/* <CopiedButton /> */}
        </Col>
      </Row>
      <Row>
        <Col>
          <h3>Redirect URLs (optional)</h3>
        </Col>
      </Row>
      <Row>
        <Col lg={8} xl={9}>
          <p>
            If you need additional redirect URLs, add them below and regenerate your API credentials.
            You will need to communicate the new credentials to your API developers.
          </p>
        </Col>
      </Row>
      <Form.Control
      // value="Redirect URIs"
      // onChange={handleChange}
      // leadingElement={<Icon src={FavoriteBorder} />}
        floatingLabel="Redirect URIs"
      />
      <p>
        Allowed URI&apos;s list, space separated
      </p>

      <Row className="mb-4 justify-content-between">
        <Col>
          <RegenarateCredentialWarningModal modalSize="sm" modalVariant="default" />
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
};

export default SuccessPage;
