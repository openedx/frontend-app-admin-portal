import {
  SAVE_TEMPLATE_REQUEST,
  SAVE_TEMPLATE_SUCCESS,
  SAVE_TEMPLATE_FAILURE,
  ALL_EMAIL_TEMPLATE_SUCCESS,
  UPDATE_ALL_TEMPLATES_SUCCESS,
} from '../constants/emailTemplate';

import emailTemplate, { initialState as emailTemplateReducerInitialState } from './emailTemplate';

const emailType = 'assign';
const saveTemplateSuccessResponse = {
  email_greeting: 'I am email greeting',
  email_body: 'I am email body',
  email_closing: 'I am email closing',
  name: 'template-1',
  id: 4,
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
          'template-name-select': saveTemplateSuccessResponse.name,
          'template-id': saveTemplateSuccessResponse.id,
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

  it('updates store with correct data on save all template success', () => {
    const expected = {
      ...emailTemplateReducerInitialState,
      saving: false,
      error: null,
      allTemplates: [{
        email_body: saveTemplateSuccessResponse.email_body,
        email_closing: saveTemplateSuccessResponse.email_closing,
        email_greeting: saveTemplateSuccessResponse.email_greeting,
        id: saveTemplateSuccessResponse.id,
        name: saveTemplateSuccessResponse.name,
      },
      {
        email_body: saveTemplateSuccessResponse.email_body,
        email_closing: saveTemplateSuccessResponse.email_closing,
        email_greeting: saveTemplateSuccessResponse.email_greeting,
        id: saveTemplateSuccessResponse.id,
        name: saveTemplateSuccessResponse.name,
      },
      ],
    };
    const successResponseActionData = {
      type: ALL_EMAIL_TEMPLATE_SUCCESS,
      payload: {
        data: [saveTemplateSuccessResponse, saveTemplateSuccessResponse],
      },
    };
    expect(emailTemplate(undefined, successResponseActionData)).toEqual(expected);
  });

  it('updates store with correct data on update template success', () => {
    const saveTemplateSuccessUpdatedResponse = {
      email_greeting: 'I am email greeting updated',
      email_body: 'I am email body updated',
      email_closing: 'I am email closing updated',
      name: 'template-1 updated',
      id: 4,
    };

    const initialState = {
      ...emailTemplateReducerInitialState,
      saving: false,
      error: null,
      allTemplates: [saveTemplateSuccessResponse],
    };

    const expected = {
      ...emailTemplateReducerInitialState,
      saving: false,
      error: null,
      allTemplates: [saveTemplateSuccessUpdatedResponse],
    };
    const successResponseActionData = {
      type: UPDATE_ALL_TEMPLATES_SUCCESS,
      payload: {
        data: saveTemplateSuccessUpdatedResponse,
      },
    };

    expect(emailTemplate(initialState, successResponseActionData)).toEqual(expected);
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
