/* eslint-disable react/jsx-filename-extension */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ContentHighlightsContext as NestedContentHighlightsContext } from '../../../components/ContentHighlights/ContentHighlightsContext';
import { searchClient } from '../constants';
import { initialStateValue as baseInitialStateValues, BaseContext } from '../context';

export const initialStateValue = {
  stepperModal: {
    isOpen: false,
    highlightTitle: null,
    titleStepValidation: null,
    currentSelectedRowIds: [],
  },
  contentHighlights: [],
  searchClient,
};

export const ContentHighlightsContext = ({
  children,
  initialBaseState,
  value,
}) => {
  const contextValue = useState(value);
  return (
    <BaseContext initialState={initialBaseState}>
      <NestedContentHighlightsContext.Provider value={contextValue}>
        {children}
      </NestedContentHighlightsContext.Provider>
    </BaseContext>
  );
};

ContentHighlightsContext.propTypes = {
  children: PropTypes.node.isRequired,
  initialBaseState: PropTypes.shape({
    portalConfiguration: PropTypes.shape({
      enterpriseSlug: PropTypes.string,
      enterpriseName: PropTypes.string,
      enterpriseId: PropTypes.string,
    }),
  }),
  value: PropTypes.shape(),
};

ContentHighlightsContext.defaultProps = {
  initialBaseState: baseInitialStateValues,
  value: initialStateValue,
};
