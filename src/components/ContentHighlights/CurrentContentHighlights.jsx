import React from 'react';
import {
  Stack,
} from '@openedx/paragon';

import ContentHighlightCardContainer from './ContentHighlightCardContainer';
import CurrentContentHighlightHeader from './CurrentContentHighlightHeader';

const CurrentContentHighlights = () => (
  <Stack gap={2}>
    <CurrentContentHighlightHeader />
    <ContentHighlightCardContainer />
  </Stack>
);

export default CurrentContentHighlights;
