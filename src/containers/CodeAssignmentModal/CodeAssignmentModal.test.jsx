import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import CodeAssignmentModal from './index';
import assignEmailTemplate from '../../components/CodeAssignmentModal/emailTemplate';

const mockStore = configureMockStore([thunk]);
const initialState = {
  table: {
    'coupon-details': {
      data: {
        count: 0,
        results: [],
      },
    },
  },
  emailTemplate: {
    saving: false,
    loading: false,
    error: null,
    assign: {
      'email-template-greeting': assignEmailTemplate.greeting,
      'email-template-body': assignEmailTemplate.body,
      'email-template-closing': assignEmailTemplate.closing,
    },
  },
};

const CodeAssignmentModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <CodeAssignmentModal
        couponId={1}
        title="AABBCC"
        onClose={() => {}}
        onSuccess={() => {}}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

CodeAssignmentModalWrapper.defaultProps = {
  store: mockStore({ ...initialState }),
};

CodeAssignmentModalWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('CodeAssignmentModalWrapper', () => {
  it('renders individual assignment modal', () => {
    const wrapper = mount(<CodeAssignmentModalWrapper />);
    expect(wrapper.find('IndividualAssignFields')).toHaveLength(1);
  });

  it('renders bulk assignment modal', () => {
    const wrapper = mount(<CodeAssignmentModalWrapper isBulkAssign />);
    expect(wrapper.find('BulkAssignFields')).toHaveLength(1);
  });

  it('renders <SaveTemplateButton />', () => {
    const wrapper = mount(<CodeAssignmentModalWrapper />);
    const saveTemplateButton = wrapper.find('SaveTemplateButton');
    expect(saveTemplateButton).toHaveLength(1);
    expect(saveTemplateButton.props().disabled).toEqual(true);
    expect(saveTemplateButton.props().saving).toEqual(false);
    expect(saveTemplateButton.props().templateType).toEqual('assign');
    expect(saveTemplateButton.props().buttonLabel).toEqual('Save Template');
    expect(saveTemplateButton.props().templateData).toEqual(initialState.emailTemplate.assign);
  });
});
