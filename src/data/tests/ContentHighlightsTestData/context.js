/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ContentHighlightsContext as NestedContentHighlightsContext } from '../../../components/ContentHighlights/ContentHighlightsContext';
import { searchClient } from '../constants';
import { EnterpriseAppContext } from '../EnterpriseAppTestData/context';

/**
 * @param {Object} stepperModal - The initial state of the stepperModal.
 * @param {boolean} stepperModal.isOpen - Indicates whether the stepper modal is open or closed.
 * @param {string} stepperModal.highlightTitle - The title of the highlight.
 * @param {string} stepperModal.titleStepValidation - The validation message for the title step.
 * @param {Array} stepperModal.currentSelectedRowIds - The ids of the currently selected rows.
 * @param {Array} contentHighlights - The initial state of the content highlights.
 * @param {Object} searchClient - The search client to be used for searching.
 * @return {Object} initialStateValue - The initial state value of the context.
 */
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

/**
 * @function
 * @param {Object} props
 * @param {React.ReactNode} props.children - The elements that the context provider will wrap and make the context available to.
 * @param {Object} props.value - The value that will be passed down to the context, this prop is optional and defaults to `initialStateValue` if not provided.
 * @param {Object} props.enterpriseAppContextValues - The value that will be passed down to the `EnterpriseAppContext` context provider.
 * @return {React.FunctionComponent} - A functional component that provides context to its children.
 */
export const ContentHighlightsContext = ({
  children,
  value,
  enterpriseAppContextValues,
}) => {
  const contextValue = useState(value);
  return (
    <EnterpriseAppContext enterpriseAppContextValue={enterpriseAppContextValues}>
      <NestedContentHighlightsContext.Provider value={contextValue}>
        {children}
      </NestedContentHighlightsContext.Provider>
    </EnterpriseAppContext>
  );
};

ContentHighlightsContext.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.shape(),
  enterpriseAppContextValues: PropTypes.shape().isRequired,
};

ContentHighlightsContext.defaultProps = {
  value: initialStateValue,
};
