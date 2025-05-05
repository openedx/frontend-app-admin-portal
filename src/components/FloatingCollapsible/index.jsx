import React from 'react';

import { Collapsible } from '@openedx/paragon';

const FloatingCollapsible = () => (
  <div className="bottom-right-fixed">
    <Collapsible
      styling="card"
      title="Product Tours Checklist"
    >
      <div>Product Tours Checklist</div>
    </Collapsible>
  </div>
);

export default FloatingCollapsible;
