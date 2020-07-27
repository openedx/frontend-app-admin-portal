import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import EcommerceApiService from '../../data/services/EcommerceApiService';
import { saveTemplate } from './emailTemplate';

import {
  SAVE_TEMPLATE_REQUEST,
  SAVE_TEMPLATE_SUCCESS,
  SAVE_TEMPLATE_FAILURE,
} from '../constants/emailTemplate';

jest.mock('../../data/services/EcommerceApiService');
const mockStore = configureMockStore([thunk]);
const postData = {
  email_type: 'assign',
  email_subject: 'Subject',
  email_greeting: 'Greeting',
  email_closing: 'Closing',
};
const successResponse = {
  email_subject: postData.email_subject,
  email_greeting: postData.email_greeting,
  email_body: 'email body',
  email_closing: postData.email_closing,
};
const errorResponse = {
  email_greeting: [
    'Ensure this field has no more than 300 characters.',
  ],
};

describe('emailTemplate actions', () => {
  it('dispatches success action on successful template save', () => {
    EcommerceApiService.saveTemplate.mockImplementation(() => Promise.resolve({
      data: successResponse,
    }));

    const expectedActions = [
      {
        type: SAVE_TEMPLATE_REQUEST,
        payload: {
          emailType: postData.email_type,
        },
      },
      {
        type: SAVE_TEMPLATE_SUCCESS,
        payload: {
          emailType: postData.email_type,
          data: successResponse,
        },
      },
    ];
    const store = mockStore();
    return store.dispatch(saveTemplate({ options: postData })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
  it('dispatches success action on successful template update', () => {
    EcommerceApiService.saveTemplate.mockImplementation(() => Promise.resolve({
      data: successResponse,
    }));

    const expectedActions = [
      {
        type: SAVE_TEMPLATE_REQUEST,
        payload: {
          emailType: postData.email_type,
        },
      },
      {
        type: SAVE_TEMPLATE_SUCCESS,
        payload: {
          emailType: postData.email_type,
          data: successResponse,
        },
      },
    ];
    const store = mockStore();
    return store.dispatch(saveTemplate({ options: postData })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('dispatches failure action on failed template save', () => {
    EcommerceApiService.saveTemplate.mockImplementation(() => Promise.reject(errorResponse));
    const expectedActions = [
      {
        type: SAVE_TEMPLATE_REQUEST,
        payload: {
          emailType: postData.email_type,
        },
      },
      {
        type: SAVE_TEMPLATE_FAILURE,
        payload: {
          emailType: postData.email_type,
          error: errorResponse,
        },
      },
    ];
    const store = mockStore();
    return store.dispatch(saveTemplate({ options: postData })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
