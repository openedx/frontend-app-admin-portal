import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import EcommerceApiService from '../../data/services/EcommerceApiService';
import { SAVE_TEMPLATE_REQUEST } from '../../data/constants/emailTemplate';
import SaveTemplateButton from './index';

jest.mock('../../data/services/EcommerceApiService');
const mockStore = configureMockStore([thunk]);
const initialState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
  },
  emailTemplate: {
    saving: false,
  },
};
const store = mockStore({
  ...initialState,
});
const saveTemplateData = {
  email_type: 'assign',
  email_greeting: 'Greeting',
  email_closing: 'Closing',
};
const templateType = saveTemplateData.email_type;
const saveTemplateSpy = jest.spyOn(EcommerceApiService, 'saveTemplate');

const SaveTemplateButtonWrapper = props => (
  <MemoryRouter>
    <Provider store={store}>
      <SaveTemplateButton
        templateType={templateType}
        templateData={{
          'email-template-greeting': saveTemplateData.email_greeting,
          'email-template-closing': saveTemplateData.email_closing,
        }}
        setMode={() => {}}
        handleSubmit={submitFunction => submitFunction}
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

    wrapper.find('button').find('.btn.btn-primary').simulate('click');
    expect(store.getActions()).toEqual(expectedActions);
    expect(saveTemplateSpy).toHaveBeenCalledWith(saveTemplateData);
  });
});
