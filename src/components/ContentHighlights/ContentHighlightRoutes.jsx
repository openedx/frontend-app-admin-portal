import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PropTypes from 'prop-types';

import ContentHighlightSet from './ContentHighlightSet';
import ContentHighlightsDashboard from './ContentHighlightsDashboard';
import ContentHighlightStepper from './HighlightStepper/ContentHighlightStepper';

const BaseContentHighlightRoute = ({ children }) => (
  <>
    {children}
    <ContentHighlightStepper />
  </>
);

BaseContentHighlightRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const ContentHighlightRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={(
        <BaseContentHighlightRoute>
          <ContentHighlightsDashboard />
        </BaseContentHighlightRoute>
      )}
    />
    <Route
      path="/:highlightSetUUID/"
      element={(
        <BaseContentHighlightRoute>
          <ContentHighlightSet />
        </BaseContentHighlightRoute>
      )}
    />
  </Routes>
);

export default ContentHighlightRoutes;
