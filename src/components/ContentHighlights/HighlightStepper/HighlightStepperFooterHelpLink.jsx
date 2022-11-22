import React from 'react';
import {
  Hyperlink,
} from '@edx/paragon';

const HighlightStepperFooterHelpLink = () => (
  <div>
    <Hyperlink
      target="_blank"
      destination={process.env.ENTERPRISE_SUPPORT_PROGRAM_OPTIMIZATION_URL}
      className="small"
    >
      Help Center: Program Optimization
    </Hyperlink>
  </div>
);

export default HighlightStepperFooterHelpLink;
