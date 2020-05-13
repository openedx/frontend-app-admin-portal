import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { SubmissionError } from 'redux-form';

import EcommerceApiService from '../../data/services/EcommerceApiService';
import { SAVE_TEMPLATE_REQUEST, EMAIL_TEMPLATE_FIELD_MAX_LIMIT } from '../../data/constants/emailTemplate';
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
      'email-template-greeting': 'email-template-greeting',
      'email-template-body': 'email-template-body',
    },
  },
};
const store = mockStore({
  ...initialState,
});
const formData = {
  'template-name': 'Template from portal',
  'email-template-greeting': 'Greeting',
  'email-template-closing': 'Closing',
};
const saveTemplateData = {
  id: 1,
  email_type: 'assign',
  name: formData['template-name'],
  email_greeting: formData['email-template-greeting'],
  email_closing: formData['email-template-closing'],
};
const templateType = saveTemplateData.email_type;
const saveTemplateSpy = jest.spyOn(EcommerceApiService, 'saveTemplate');

const SaveTemplateButtonWrapper = props => (
  <MemoryRouter>
    <Provider store={store}>
      <SaveTemplateButton
        templateType={templateType}
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
      email_greeting: saveTemplateData.email_greeting,
      email_body: 'email body',
      email_closing: saveTemplateData.email_closing,
    };
    EcommerceApiService.saveTemplate.mockImplementation(() => Promise.resolve({
      data: successResponse,
    }));
    const wrapper = mount((
      <SaveTemplateButtonWrapper disabled={false} />
    ));

    wrapper.find('button').find('.save-template-btn').simulate('click');
    expect(store.getActions()).toEqual(expectedActions);
    expect(saveTemplateSpy).toHaveBeenCalledWith(saveTemplateData);
  });

  it('saveTemplate raises correct errors on invalid data submission', () => {
    const invalidFormData = {
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
    const wrapper = mount((
      <SaveTemplateButtonWrapperWithInvalidData disabled={false} />
    ));

    try {
      wrapper.find('button').find('.save-template-btn').simulate('click');
    } catch (e) {
      expect(e instanceof SubmissionError).toBeTruthy();
      expect(e.errors['template-name']).toEqual('No template name provided. Please enter a template name.');
      expect(e.errors['email-template-greeting']).toEqual(`Email greeting must be ${EMAIL_TEMPLATE_FIELD_MAX_LIMIT} characters or less.`);
      expect(e.errors['email-template-closing']).toEqual(`Email closing must be ${EMAIL_TEMPLATE_FIELD_MAX_LIMIT} characters or less.`);
    }
  });
});
