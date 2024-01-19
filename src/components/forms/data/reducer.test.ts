import { Component } from 'react';
import type { FormFieldValidation } from '../FormContext';
import {
  FormWorkflowButtonConfig, FormWorkflowHandlerArgs, FormWorkflowStep,
} from '../FormWorkflow';
import {
  setFormFieldAction, updateFormFieldsAction, setStepAction, setWorkflowStateAction, resetFormEditState,
  UPDATE_FORM_FIELDS, SET_FORM_FIELD, SET_WORKFLOW_STATE, SET_STEP, RESET_EDIT_STATE,
} from './actions';
import type { InitializeFormArguments } from './reducer';
import { FormReducer, initializeForm } from './reducer';

type DummyFormFields = {
  address: string;
  zip: number;
};

const dummyButtonConfig: FormWorkflowButtonConfig<DummyFormFields> = {
  buttonText: 'Unimportant',
  onClick: ({ formFields }: FormWorkflowHandlerArgs<DummyFormFields>) => Promise.resolve(formFields as DummyFormFields),
  opensNewWindow: false,
  preventDefaultErrorModal: false,
};

const createDummyStep = (
  index: number,
  stepName: string,
  validations: FormFieldValidation[],
): FormWorkflowStep<DummyFormFields> => ({
  index,
  stepName,
  validations,
  formComponent: Component,
  saveChanges: () => Promise.resolve(true),
  nextButtonConfig: () => dummyButtonConfig,
});

const dummyFormFieldsValidations: FormFieldValidation[] = [
  {
    formFieldId: 'address',
    validator: (fields) => {
      const { address } = fields;
      const error = address?.length > 20;
      return error && 'Address should be 20 characters or less';
    },
  },
  {
    formFieldId: 'zip',
    validator: (fields) => {
      const { zip } = fields;
      const error = zip <= 0;
      return error && 'Zip code should be positive nonzero number';
    },
  },
];

const steps: FormWorkflowStep<DummyFormFields>[] = [
  createDummyStep(0, 'Fill Form', dummyFormFieldsValidations),
  createDummyStep(1, 'Review Form', []),
];

const testFormFields = { address: '123 45th st', zip: 12345 };

const getTestInitializeFormArguments = () => {
  const testArgs = {
    formFields: { ...testFormFields },
    validations: dummyFormFieldsValidations,
    currentStep: steps[0],
    steps: [...steps],
  };
  return testArgs;
};

describe('Form reducer tests', () => {
  test('Initialize Workflow State', () => {
    const formFields: DummyFormFields = { address: '123 45th st', zip: 12345 };

    const initializeFormArguments: InitializeFormArguments<DummyFormFields> = {
      formFields: { ...formFields },
      validations: dummyFormFieldsValidations,
      currentStep: steps[0],
      steps: [...steps],
    };
    expect(initializeForm(initializeFormArguments)).toEqual({
      formFields,
      errorMap: {},
      hasErrors: false,
      currentStep: steps[0],
      isEdited: false,
      allSteps: [...steps],
    });
  });

  test('Set form field with errors', () => {
    const action = setFormFieldAction({ fieldId: 'zip', value: 0 });
    const expected = {
      type: SET_FORM_FIELD,
      fieldId: 'zip',
      value: 0,
    };

    expect(
      FormReducer(action, initializeForm(getTestInitializeFormArguments())),
    ).toStrictEqual(expected);
  });

  test('Update form fields', async () => {
    const action = updateFormFieldsAction({
      formFields: { zip: 54321, address: '543 21st st' },
    });

    const expected = {
      formFields: { zip: 54321, address: '543 21st st' },
      type: UPDATE_FORM_FIELDS,
    };

    expect(
      FormReducer(action, initializeForm(getTestInitializeFormArguments())),
    ).toStrictEqual(expected);
  });

  test('Set workflow state', () => {
    const action = setWorkflowStateAction('TEST_STATE', 'Test State');

    const expected = {
      name: 'TEST_STATE',
      state: 'Test State',
      type: SET_WORKFLOW_STATE,
    };

    expect(
      FormReducer(action, initializeForm(getTestInitializeFormArguments())),
    ).toStrictEqual(expected);
  });

  test('Set workflow step', () => {
    const action = setStepAction({ step: steps[1] });

    const expected = {
      step: steps[1],
      type: SET_STEP,
    };

    expect(
      FormReducer(action, initializeForm(getTestInitializeFormArguments())),
    ).toStrictEqual(expected);
  });

  test('resets isEdited property', () => {
    const action = resetFormEditState();

    const expected = {
      type: RESET_EDIT_STATE,
    };

    expect(
      FormReducer(action, initializeForm(getTestInitializeFormArguments())),
    ).toStrictEqual(expected);
  });
});
