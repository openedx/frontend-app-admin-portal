import { Component } from 'react';
import type { FormFieldValidation } from '../FormContext';
import {
  FormWorkflowButtonConfig, FormWorkflowHandlerArgs, FormWorkflowStep,
} from '../FormWorkflow';
import {
  setFormFieldAction, updateFormFieldsAction, setStepAction, setWorkflowStateAction,
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
  };
  return testArgs;
};

const getTestExpectedState = () => ({
  formFields: testFormFields,
  currentStep: steps[0],
  isEdited: false,
});

describe('Form reducer tests', () => {
  test('Initialize Workflow State', () => {
    const formFields: DummyFormFields = { address: '123 45th st', zip: 12345 };

    const initializeFormArguments: InitializeFormArguments<DummyFormFields> = {
      formFields: { ...formFields },
      validations: dummyFormFieldsValidations,
      currentStep: steps[0],
    };
    expect(initializeForm({}, initializeFormArguments)).toEqual({
      formFields,
      currentStep: steps[0],
      isEdited: false,
      hasErrors: false,
      errorMap: {},
    });
  });

  test('Set form field with errors', () => {
    const action = setFormFieldAction({ fieldId: 'zip', value: 0 });
    const expected = {
      ...getTestExpectedState(),
      formFields: { address: '123 45th st', zip: 0 },
      isEdited: true,
      hasErrors: true,
      errorMap: {
        zip: ['Zip code should be positive nonzero number'],
      },
    };

    expect(
      FormReducer(initializeForm({}, getTestInitializeFormArguments()), action),
    ).toStrictEqual(expected);
  });

  test('Update form fields', async () => {
    const action = updateFormFieldsAction({
      formFields: { zip: 54321, address: '543 21st st' },
    });

    const expected = {
      ...getTestExpectedState(),
      formFields: { zip: 54321, address: '543 21st st' },
      hasErrors: false,
      errorMap: {},
    };

    expect(
      FormReducer(initializeForm({}, getTestInitializeFormArguments()), action),
    ).toStrictEqual(expected);
  });

  test('Set workflow state', () => {
    const action = setWorkflowStateAction('TEST_STATE', 'Test State');

    const expected = {
      ...getTestExpectedState(),
      stateMap: { TEST_STATE: 'Test State' },
      hasErrors: false,
      errorMap: {},
    };

    expect(
      FormReducer(initializeForm({}, getTestInitializeFormArguments()), action),
    ).toStrictEqual(expected);
  });

  test('Set workflow step', () => {
    const action = setStepAction({ step: steps[1] });

    const expected = {
      ...getTestExpectedState(),
      currentStep: steps[1],
      hasErrors: false,
      errorMap: {},
    };

    expect(
      FormReducer(initializeForm({}, getTestInitializeFormArguments()), action),
    ).toStrictEqual(expected);
  });
});
