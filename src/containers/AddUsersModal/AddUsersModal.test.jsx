import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import AddUsersModal from './index';
import subscribeEmailTemplate from '../../components/AddUsersModal/emailTemplate';
import { EmailTemplateContext } from '../../components/EmailTemplate/EmailTemplateData';

const mockStore = configureMockStore([thunk]);

const modelTitle = 'AABBCC';
const data = {};
const initialState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise',
    subscriptionUUID: 'test-subscription',
  },
  emailTemplate: {
    loading: false,
    error: null,
    subscribe: {
      'email-template-greeting': subscribeEmailTemplate.greeting || '',
      'email-template-body': subscribeEmailTemplate.body,
      'email-template-closing': subscribeEmailTemplate.closing,
    },
  },
  subscriptionDetails: {
    licenses: {
      available: 1,
    },
  },
};

const emailTemplateContext = {
  emailTemplates: [],
  currentTemplate: {},
  isLoading: false,
  isSaving: false,
  errors: [],
  setCurrentEmailTemplateById: () => {},
  setDefaultAsCurrentEmailTemplate: () => {},
  updateCurrentTemplate: () => {},
  saveEmailTemplate: () => {},
};

const UserSubscriptionModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <EmailTemplateContext.Provider value={emailTemplateContext}>
        <AddUsersModal
          title={modelTitle}
          availableSubscriptionCount={10}
          subscriptionUUID={initialState.portalConfiguration.subscriptionUUID}
          onClose={() => {}}
          onSuccess={() => {}}
          {...props}
        />
      </EmailTemplateContext.Provider>
    </Provider>
  </MemoryRouter>
);

UserSubscriptionModalWrapper.defaultProps = {
  store: mockStore(initialState),
};

UserSubscriptionModalWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('UserSubscriptionModalWrapper', () => {
  let spy;

  afterEach(() => {
    if (spy) {
      spy.mockRestore();
    }
  });

  it('renders user licenses modal', () => {
    const wrapper = mount(<UserSubscriptionModalWrapper data={data} />);
    expect(wrapper.find('.modal-title span').text()).toEqual(modelTitle);
    expect(wrapper.find('.modal-body form h3').first().text()).toEqual('Add Users');
  });
});
