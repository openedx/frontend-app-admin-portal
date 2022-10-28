import React from 'react';
import {
  Stack, Col, Hyperlink,
} from '@edx/paragon';

const HighlightStepperFooterHelpLink = () => (
  <Stack direction="horizontal">
    <Col className="mr-1 p-0">
      <Hyperlink target="_blank" destination={process.env.ENTERPRISE_SUPPORT_URL}>
        Help Center
      </Hyperlink>
    </Col>
  </Stack>
);

export default HighlightStepperFooterHelpLink;
