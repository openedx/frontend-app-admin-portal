import React from 'react';
import {
  Stack,
} from '@edx/paragon';
import ContentHighlightCardContainer from './ContentHighlightCardContainer';
import CurrentContentHighlightHeader from './CurrentContentHighlightHeader';

const CurrentContentHighlights = () => (
  <Stack>
    <CurrentContentHighlightHeader />
    <ContentHighlightCardContainer />
  </Stack>
);

export default CurrentContentHighlights;
