/* eslint-disable react/prop-types */
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';

import FormWaitModal from '../FormWaitModal';
import FormContextProvider from '../FormContext';

const FormWaitModalWrapper = ({
  mockDispatch,
  showModal,
  triggerState,
  header,
  text,
}) => {
  const contextValue = {
    stateMap: { SHOW_MODAL: showModal },
  };
  return (
    <FormContextProvider
      dispatch={mockDispatch}
      formContext={contextValue || {}}
    >
      <FormWaitModal
        {...{
          triggerState,
          header,
          text,
        }}
      />
    </FormContextProvider>
  );
};

describe('<FormWaitModal />', () => {
  it('renders if flag set', () => {
    const mockDispatch = jest.fn();
    render(
      <FormWaitModalWrapper
        showModal
        mockDispatch={mockDispatch}
        triggerState="SHOW_MODAL"
        header="Test FormWaitModal"
        text="Some text to test with"
      />,
    );

    expect(screen.getByText('Test FormWaitModal')).toBeInTheDocument();
    expect(screen.getAllByText('Some text to test with')).toHaveLength(2);
  });
  it('does not render if flag not set', () => {
    const mockDispatch = jest.fn();
    render(
      <FormWaitModalWrapper
        showModal={false}
        mockDispatch={mockDispatch}
        triggerState="SHOW_MODAL"
        header="Test FormWaitModal"
        text="Some text to test with"
      />,
    );

    expect(screen.queryByText('Test FormWaitModal')).not.toBeInTheDocument();
    expect(screen.queryByText('Some text to test with')).not.toBeInTheDocument();
  });
});
