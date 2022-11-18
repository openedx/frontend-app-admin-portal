import React from 'react';
import {
  Stack,
} from '@edx/paragon';

import ContentHighlightCardContainer from './ContentHighlightCardContainer';
import CurrentContentHighlightHeader from './CurrentContentHighlightHeader';

function CurrentContentHighlights() {
  return (
    <Stack gap={3}>
      <CurrentContentHighlightHeader />
      <ContentHighlightCardContainer />
    </Stack>
  );
}

export default CurrentContentHighlights;
