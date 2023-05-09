/* eslint-disable react/prop-types */
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render } from '@testing-library/react';
import userEvent, { TargetElement } from '@testing-library/user-event';

import FormContextProvider from '../FormContext';
import type { FormContext } from '../FormContext';
import ValidatedFormControl from '../ValidatedFormControl';
import type {ValidatedFormControlProps} from '../ValidatedFormControl';

type ValidatedFormControlWrapperProps = {
  mockDispatch: () => void;
  formValue?: string;
  formError?: string;
  formId: string;
} & Partial<ValidatedFormControlProps>;

const ValidatedFormControlWrapper = ({
  mockDispatch,
  formId,
  formValue,
  floatingLabel,
  fieldInstructions,
  formError,
}: ValidatedFormControlWrapperProps) => {
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
      <ValidatedFormControl
        formId={formId}
        type="text"
        floatingLabel={floatingLabel}
        fieldInstructions={fieldInstructions}
      />
    </FormContextProvider>
  );
};

describe('<ValidatedFormControl />', () => {
  it('renders with field populated from context', () => {
    const mockDispatch = jest.fn();
    const { container } = render(
      <ValidatedFormControlWrapper
        mockDispatch={mockDispatch}
        formId="TEST_FORM_FIELD"
        formValue="Test Value"
        floatingLabel="Test Label"
        fieldInstructions="Test Instructions"
      />,
    );
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('value', 'Test Value');
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Instructions')).toBeInTheDocument();
  });
  it('sends change action when field is updated', () => {
    const mockDispatch = jest.fn();
    const { container } = render(
      <ValidatedFormControlWrapper
        mockDispatch={mockDispatch}
        formId="TEST_FORM_FIELD"
        formValue=""
      />,
    );
    const input = container.querySelector('input');
    userEvent.type(input as TargetElement, 'x');
    expect(mockDispatch).toBeCalledWith({ type: 'SET FORM FIELD', fieldId: 'TEST_FORM_FIELD', value: 'x' });
  });
  it('renders with error populated from context', () => {
    const mockDispatch = jest.fn();
    render(
      <ValidatedFormControlWrapper
        mockDispatch={mockDispatch}
        formId="TEST_FORM_FIELD"
        formError="Something is wrong with this field"
      />,
    );
    expect(screen.getByText('Something is wrong with this field')).toBeInTheDocument();
  });
});
