import React from 'react';
import {
  Stack, Hyperlink,
} from '@edx/paragon';

const HighlightStepperFooterHelpLink = () => (
  <Stack direction="horizontal">
    <div className="mr-1 p-0">
      <Hyperlink target="_blank" destination={process.env.ENTERPRISE_SUPPORT_URL}>
        Help Center
      </Hyperlink>
    </div>
  </Stack>
);

export default HighlightStepperFooterHelpLink;
