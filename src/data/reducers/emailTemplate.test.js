import {
  SAVE_TEMPLATE_REQUEST,
  SAVE_TEMPLATE_SUCCESS,
  SAVE_TEMPLATE_FAILURE,
} from '../constants/emailTemplate';

import emailTemplate, { initialState as emailTemplateReducerInitialState } from './emailTemplate';

const emailType = 'assign';
const saveTemplateSuccessResponse = {
  email_greeting: 'I am email greeting',
  email_body: 'I am email body',
  email_closing: 'I am email closing',
};
const saveTemplateErrorResponse = {
  email_greeting: [
    'Ensure this field has no more than 300 characters.',
  ],
};

describe('emailTemplate reducer', () => {
  it('has initial state', () => {
    expect(emailTemplate(undefined, {})).toEqual(emailTemplateReducerInitialState);
  });

  it('updates store with correct data on save template request', () => {
    const expected = {
      ...emailTemplateReducerInitialState,
      saving: true,
      error: null,
    };
    expect(emailTemplate(undefined, {
      type: SAVE_TEMPLATE_REQUEST,
      payload: {
        emailType,
      },
    })).toEqual(expected);
  });

  it('updates store with correct data on save template success', () => {
    const expected = {
      ...emailTemplateReducerInitialState,
      saving: false,
      error: null,
      ...{
        [emailType]: {
          'email-template-greeting': saveTemplateSuccessResponse.email_greeting,
          'email-template-body': saveTemplateSuccessResponse.email_body,
          'email-template-closing': saveTemplateSuccessResponse.email_closing,
        },
      },
    };
    const successResponseActionData = {
      type: SAVE_TEMPLATE_SUCCESS,
      payload: {
        emailType,
        data: saveTemplateSuccessResponse,
      },
    };
    expect(emailTemplate(undefined, successResponseActionData)).toEqual(expected);
  });

  it('updates store with correct data on save template failure', () => {
    const expected = {
      ...emailTemplateReducerInitialState,
      saving: false,
      error: saveTemplateErrorResponse,
    };
    const errorResponseActionData = {
      type: SAVE_TEMPLATE_FAILURE,
      payload: {
        emailType,
        error: saveTemplateErrorResponse,
      },
    };
    expect(emailTemplate(undefined, errorResponseActionData)).toEqual(expected);
  });
});
