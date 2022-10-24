import React from 'react';
import { Button } from '@edx/paragon';

const CurrentContentHighlightHeader = () => (
  <header className="mb-4.5 d-flex justify-content-between">
    <div className="align-self-end">
      <h3 className="m-0">
        Active Highlights
      </h3>
    </div>
    <div>
      <Button>New Highlight</Button>
    </div>
  </header>
);

export default CurrentContentHighlightHeader;
