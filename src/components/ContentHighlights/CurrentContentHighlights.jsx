import React from 'react';
import {
  Stack,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import ContentHighlightCardContainer from './ContentHighlightCardContainer';
import CurrentContentHighlightHeader from './CurrentContentHighlightHeader';

const CurrentContentHighlights = ({ parentContainerClassName }) => (
  <Stack className={parentContainerClassName}>
    <CurrentContentHighlightHeader />
    <ContentHighlightCardContainer />
  </Stack>
);

CurrentContentHighlights.propTypes = {
  parentContainerClassName: PropTypes.string,
};

CurrentContentHighlights.defaultProps = {
  parentContainerClassName: undefined,
};

export default CurrentContentHighlights;
