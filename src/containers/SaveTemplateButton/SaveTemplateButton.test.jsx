import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { fireEvent, render, screen } from '@testing-library/react';
import { SubmissionError } from 'redux-form';

import EcommerceApiService from '../../data/services/EcommerceApiService';
import {
  SAVE_TEMPLATE_REQUEST,
  EMAIL_TEMPLATE_FIELD_MAX_LIMIT,
  OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT,
  EMAIL_TEMPLATE_SUBJECT_KEY,
  EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
} from '../../data/constants/emailTemplate';
import SaveTemplateButton from './index';

jest.mock('../../data/services/EcommerceApiService');
const mockStore = configureMockStore([thunk]);
const initialState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
  },
  emailTemplate: {
    saving: false,
    allTemplates: [],
    assign: {
      'template-id': 1,
      'email-template-subject': 'email-template-subject',
      'email-template-greeting': 'email-template-greeting',
      'email-template-body': 'email-template-body',
      'email-template-files': 'email-template-files',
    },
  },
};
const store = mockStore({
  ...initialState,
});
const formData = {
  'template-name': 'Template from portal',
  'email-template-subject': 'Subject',
  'email-template-greeting': 'Greeting',
  'email-template-closing': 'Closing',
  'email-template-files': [{ name: 'file1.png', size: 123, contents: '' }, { name: 'file2.png', size: 456, contents: '' }],
};
const saveTemplateData = {
  id: 1,
  email_type: 'assign',
  name: formData['template-name'],
  email_subject: formData[EMAIL_TEMPLATE_SUBJECT_KEY],
  email_greeting: formData['email-template-greeting'],
  email_closing: formData['email-template-closing'],
  email_files: formData['email-template-files'],
};
const templateType = saveTemplateData.email_type;
const saveTemplateSpy = jest.spyOn(EcommerceApiService, 'saveTemplate');

const SaveTemplateButtonWrapper = props => (
  <MemoryRouter>
    <Provider store={store}>
      <SaveTemplateButton
        templateType={templateType}
        emailTemplateSource={EMAIL_TEMPLATE_SOURCE_NEW_EMAIL}
        setMode={() => {}}
        handleSubmit={submitFunction => () => submitFunction(formData)}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

describe('<SaveTemplateButton />', () => {
  it('renders correctly in disabled state', () => {
    const tree = renderer
      .create((
        <SaveTemplateButtonWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly in enabled state', () => {
    const tree = renderer
      .create((
        <SaveTemplateButtonWrapper disabled={false} />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly while saving a template', () => {
    const newStore = mockStore({
      emailTemplate: {
        saving: true,
      },
    });

    const tree = renderer
      .create((
        <SaveTemplateButtonWrapper store={newStore} />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('calls saveTemplate on click with correct data', () => {
    const expectedActions = [{
      type: SAVE_TEMPLATE_REQUEST,
      payload: { emailType: templateType },
    }];
    const successResponse = {
      email_subject: saveTemplateData.email_subject,
      email_greeting: saveTemplateData.email_greeting,
      email_body: 'email body',
      email_closing: saveTemplateData.email_closing,
      email_files: saveTemplateData.email_files,
    };
    EcommerceApiService.saveTemplate.mockImplementation(() => Promise.resolve({
      data: successResponse,
    }));
    render((
      <SaveTemplateButtonWrapper disabled={false} />
    ));

    fireEvent.click(screen.getByText('Save Template'));
    expect(store.getActions()).toEqual(expectedActions);

    expect(saveTemplateSpy).toHaveBeenCalledWith(saveTemplateData);
  });

  // This is not possible in react-testing-library -> https://github.com/testing-library/react-testing-library/issues/624#issuecomment-605105191
  // Need to re-write this test in some better way.
  it.skip('saveTemplate raises correct errors on invalid data submission', () => {
    const invalidFormData = {
      'email-template-subject': 'G'.repeat(1001),
      'email-template-greeting': 'G'.repeat(50001),
      'email-template-closing': 'C'.repeat(50001),
    };
    const SaveTemplateButtonWrapperWithInvalidData = props => (
      <MemoryRouter>
        <Provider store={store}>
          <SaveTemplateButton
            templateType={templateType}
            setMode={() => {}}
            handleSubmit={submitFunction => () => submitFunction(invalidFormData)}
            {...props}
          />
        </Provider>
      </MemoryRouter>
    );
    render((
      <SaveTemplateButtonWrapperWithInvalidData disabled={false} />
    ));

    try {
      fireEvent.click(screen.getByText('Save Template'));
    } catch (e) {
      expect(e instanceof SubmissionError).toBeTruthy();
      expect(e.errors['template-name']).toEqual('No template name provided. Please enter a template name.');
      expect(e.errors['email-template-subject']).toEqual(`Email subject must be ${OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT} characters or less.`);
      expect(e.errors['email-template-greeting']).toEqual(`Email greeting must be ${EMAIL_TEMPLATE_FIELD_MAX_LIMIT} characters or less.`);
      expect(e.errors['email-template-closing']).toEqual(`Email closing must be ${EMAIL_TEMPLATE_FIELD_MAX_LIMIT} characters or less.`);
    }
  });
});
