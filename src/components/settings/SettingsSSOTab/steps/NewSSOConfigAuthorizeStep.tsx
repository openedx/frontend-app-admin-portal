import React from 'react';
import {
  Alert, Form, Hyperlink, Button, Row,
} from '@edx/paragon';
import { Info, Download } from '@edx/paragon/icons';

const handleCheck = () => null;

const SSOConfigAuthorizeStep = () => (
  <>
    <h2>Authorize edX as a Service Provider</h2>
    <Alert variant="info" className="mb-4" icon={Info}>
      <h3>Action required in a new window</h3>
      Return to this window after completing the following steps in a new window to finish configuring your integration.
    </Alert>
    <hr />
    <p>
      1. Download the edX Service Provider metadata as an XML file:
    </p>

    <Row className="justify-content-center mb-4 ">
      <Button variant="primary" iconAfter={Download}>edX Service Provider Metadata</Button>
    </Row>

    <p>
      2. <Hyperlink destination="/" target="_blank">Launch a new window</Hyperlink> and upload the XML file to the list of
      authorized SAML Service Providers on your Identity Provider&apos;s portal or website.
    </p>
    <hr />
    <p>Return to this window and check the box once complete</p>

    <Form.Checkbox className="mt-4" checked={false} onChange={handleCheck}>
      I have authorized edX as a Service Provider
    </Form.Checkbox>
  </>
);

export default SSOConfigAuthorizeStep;
