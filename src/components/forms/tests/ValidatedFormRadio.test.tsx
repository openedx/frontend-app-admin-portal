/* eslint-disable react/prop-types */
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FormContextProvider from '../FormContext';
import type { FormContext } from '../FormContext';
import ValidatedFormRadio, { ValidatedFormRadioProps } from '../ValidatedFormRadio';

type ValidatedFormRadioWrapperProps = {
  mockDispatch: () => void;
  formValue?: string;
  formError?: string;
  formId: string;
} & Partial<ValidatedFormRadioProps>;

const ValidatedFormRadioWrapper = ({
  mockDispatch,
  formId,
  formValue,
  fieldInstructions,
  label,
  options,
  formError,
}: ValidatedFormRadioWrapperProps) => {
  let contextValue: FormContext = {
    formFields: { [formId]: formValue },
  };
  if (formError) {
    contextValue = { ...contextValue, errorMap: { [formId]: [formError] } };
  }
  return (
    <FormContextProvider
      dispatch={mockDispatch}
      formContext={contextValue || {}}
    >
      <ValidatedFormRadio
        formId={formId}
        fieldInstructions={fieldInstructions}
        label={label}
        options={options}
      />
    </FormContextProvider>
  );
};

describe('<ValidatedFormControl />', () => {
  it('renders with field populated from context', () => {
    const mockDispatch = jest.fn();
    render(
      <ValidatedFormRadioWrapper
        mockDispatch={mockDispatch}
        formId="TEST_FORM_FIELD"
        label="Test Label"
        options={[['Label1', '1'], ['Label2', '2']]}
        fieldInstructions="Test Instructions"
      />,
    );
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Instructions')).toBeInTheDocument();
  });
  it('sends change action when field is updated', () => {
    const mockDispatch = jest.fn();
    render(
      <ValidatedFormRadioWrapper
        mockDispatch={mockDispatch}
        formId="TEST_FORM_FIELD"
        label="Test Label"
        options={[['Label1', '1'], ['Label2', '2']]}
        fieldInstructions="Test Instructions"
      />,
    );
    userEvent.click(screen.getByText('Label1'));
    expect(mockDispatch).toBeCalledWith({ type: 'SET FORM FIELD', fieldId: 'TEST_FORM_FIELD', value: '1' });
  });
  it('renders with error populated from context', () => {
    const mockDispatch = jest.fn();
    render(
      <ValidatedFormRadioWrapper
        mockDispatch={mockDispatch}
        formId="TEST_FORM_FIELD"
        label="Test Label"
        options={[['Label1', '1'], ['Label2', '2']]}
        formError="Something is wrong with this field"
      />,
    );
    expect(screen.getByText('Something is wrong with this field')).toBeInTheDocument();
  });
});
