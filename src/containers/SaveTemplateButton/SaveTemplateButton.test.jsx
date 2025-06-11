import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { legacy_configureStore as configureMockStore } from 'redux-mock-store';
import { userEvent } from '@testing-library/user-event';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import { SubmissionError } from 'redux-form';
import EcommerceApiService from '../../data/services/EcommerceApiService';
import {
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
  beforeEach(() => {
    jest.clearAllMocks();
  });
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

  it('calls saveTemplate on click with correct data', async () => {
    const user = userEvent.setup();
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
    const { container } = render((
      <SaveTemplateButtonWrapper disabled={false} />
    ));

    const saveButton = container.querySelector('.save-template-btn');
    await user.click(saveButton);
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'SAVE_TEMPLATE_REQUEST',
          payload: { emailType: 'assign' },
        }),
      ]),
    );
    expect(saveTemplateSpy).toHaveBeenCalledWith(saveTemplateData);
  });

  // TODO: Fix it.skip
  it.skip('saveTemplate raises correct errors on invalid data submission', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn(() => {
      throw new SubmissionError({
        'template-name': 'No template name provided. Please enter a template name.',
        'email-template-subject': `Email subject must be ${OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT} characters or less.`,
        'email-template-greeting': `Email greeting must be ${EMAIL_TEMPLATE_FIELD_MAX_LIMIT} characters or less.`,
        'email-template-closing': `Email closing must be ${EMAIL_TEMPLATE_FIELD_MAX_LIMIT} characters or less.`,
      });
    });
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
            handleSubmit={() => () => mockSubmit(invalidFormData)}
            {...props}
          />
        </Provider>
      </MemoryRouter>
    );
    render((
      <SaveTemplateButtonWrapperWithInvalidData disabled={false} />
    ));

    const saveButton = screen.getByTestId('save-template-btn');

    try {
      await user.click(saveButton);
    } catch (e) {
      expect(e instanceof SubmissionError).toBeTruthy();
      expect(e.errors['template-name']).toEqual('No template name provided. Please enter a template name.');
      expect(e.errors['email-template-subject']).toEqual(`Email subject must be ${OFFER_ASSIGNMENT_EMAIL_SUBJECT_LIMIT} characters or less.`);
      expect(e.errors['email-template-greeting']).toEqual(`Email greeting must be ${EMAIL_TEMPLATE_FIELD_MAX_LIMIT} characters or less.`);
      expect(e.errors['email-template-closing']).toEqual(`Email closing must be ${EMAIL_TEMPLATE_FIELD_MAX_LIMIT} characters or less.`);
    }
  });
});
