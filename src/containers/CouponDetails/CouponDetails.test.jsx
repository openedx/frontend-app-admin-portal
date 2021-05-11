import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { StatusAlert } from '@edx/paragon';

import { SINGLE_USE, MULTI_USE, ONCE_PER_CUSTOMER } from '../../data/constants/coupons';
import EcommerceaApiService from '../../data/services/EcommerceApiService';

import CouponDetailsComponent from '../../components/CouponDetails';
import CouponDetails from './index';
import { EMAIL_TEMPLATE_SOURCE_NEW_EMAIL } from '../../data/constants/emailTemplate';
import CodeReminderModal from '../CodeReminderModal';
import CodeAssignmentModal from '../../components/CodeAssignmentModal';

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);

const sampleEmailTemplate = {
  'email-address': '',
  'email-template-greeting': 'Sample email greeting.. ',
  'email-template-body': 'Sample email body template.. ',
  'email-template-closing': 'Sample email closing template.. ',
};

const emailDefaults = {
  'template-id': 0,
  'email-address': '',
  'template-name-select': '',
  'email-template-subject': 'Sample email subject.. ',
  'email-template-greeting': 'Sample email greeting.. ',
  'email-template-body': 'Sample email body template.. ',
  'email-template-closing': 'Sample email closing template.. ',
};

const initialState = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug: 'bearsRus',
    enableLearnerPortal: true,
  },
  csv: {
    'coupon-details': {},
  },
  table: {
    'coupon-details': {},
  },
  form: {
    'code-assignment-modal-form': {
      values: {
        'email-address': '',
      },
    },
  },
  coupons: {
    couponOverviewLoading: false,
    couponOverviewError: null,
  },
  emailTemplate: {
    loading: false,
    error: null,
    emailTemplateSource: EMAIL_TEMPLATE_SOURCE_NEW_EMAIL,
    default: {
      assign: sampleEmailTemplate,
      remind: sampleEmailTemplate,
      revoke: sampleEmailTemplate,
    },
    assign: emailDefaults,
    remind: emailDefaults,
    revoke: emailDefaults,
  },
};

const initialCouponData = {
  id: 1,
  title: 'test-title',
  num_unassigned: 10,
  errors: [],
  usage_limitation: MULTI_USE,
  available: true,
};

const CouponDetailsWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <CouponDetails
        couponData={initialCouponData}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

CouponDetailsWrapper.defaultProps = {
  store: mockStore({ ...initialState }),
};

CouponDetailsWrapper.propTypes = {
  store: PropTypes.shape({}),
};

const sampleCodeData = {
  code: 'test-code-1',
  assigned_to: 'test@bestrun.com',
  redemptions: {
    total: 100,
    used: 10,
    num_assignments: 5,
  },
  assignment_date: 'June 02, 2020 13:09',
  last_reminder_date: 'June 22, 2020 12:01',
  revocation_date: '',
  error: null,
};

const sampleTableData = {
  loading: false,
  error: null,
  data: {
    count: 5,
    num_pages: 2,
    current_page: 1,
    results: [
      sampleCodeData,
      {
        ...sampleCodeData,
        code: 'test-code-2',
        redemptions: {
          total: 100,
          used: 100,
          num_assignments: 0,
        },
      },
      {
        ...sampleCodeData,
        code: 'test-code-3',
        assigned_to: null,
      },
    ],
  },
};

describe('CouponDetails container', () => {
  let wrapper;
  let store;

  const selectAllCodesOnPage = ({ isSelected, expectedSelectionLength }) => {
    const selectAllCheckbox = wrapper.find('table th').find('input[type=\'checkbox\']');
    selectAllCheckbox.simulate('change', { target: { value: isSelected } });
    expect(wrapper.find('CouponDetails').instance().state.selectedCodes).toHaveLength(expectedSelectionLength);
  };

  describe('renders', () => {
    it('with collapsed coupon details', () => {
      const tree = renderer
        .create((
          <CouponDetailsWrapper />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with expanded coupon details', () => {
      const tree = renderer
        .create((
          <CouponDetailsWrapper isExpanded />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with error', () => {
      const tree = renderer.create((
        <CouponDetailsWrapper
          couponData={{
            ...initialCouponData,
            errors: [{ code: 'test-code-1', user_email: 'test@bestrun.com' }],
          }}
          isExpanded
        />
      ));
      tree.root.findByType(CouponDetailsComponent).instance.setState({ selectedToggle: 'unredeemed' });
      expect(tree.toJSON()).toMatchSnapshot();
    });

    it('with table data', () => {
      store = mockStore({
        ...initialState,
        table: {
          'coupon-details': sampleTableData,
        },
      });
      const tree = renderer
        .create((
          <CouponDetailsWrapper
            store={store}
            isExpanded
          />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with assignment and reminder dates table data', () => {
      store = mockStore({
        ...initialState,
        table: {
          'coupon-details': sampleTableData,
        },
      });
      const tree = renderer
        .create((
          <CouponDetailsWrapper
            store={store}
            isExpanded
          />
        ));
      tree.root.findByType(CouponDetailsComponent).instance.setState({ selectedToggle: 'unredeemed' });
      expect(tree.toJSON()).toMatchSnapshot();
      tree.root.findByType(CouponDetailsComponent).instance.setState({ selectedToggle: 'partially-redeemed' });
      expect(tree.toJSON()).toMatchSnapshot();
      tree.root.findByType(CouponDetailsComponent).instance.setState({ selectedToggle: 'redeemed' });
      expect(tree.toJSON()).toMatchSnapshot();
    });

    it('does not show Assign button for an unavailable coupon', () => {
      store = mockStore({
        ...initialState,
        table: {
          'coupon-details': sampleTableData,
        },
      });

      const tree = renderer
        .create((
          <CouponDetailsWrapper
            store={store}
            couponData={{
              ...initialCouponData,
              available: false,
            }}
            isExpanded
          />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  it('handles isExpanded prop change', () => {
    wrapper = mount(<CouponDetailsWrapper isExpanded />);
    expect(wrapper.find(CouponDetails).prop('isExpanded')).toBeTruthy();

    wrapper.setProps({
      isExpanded: false,
    });
    expect(wrapper.find(CouponDetails).prop('isExpanded')).toBeFalsy();

    wrapper.setProps({
      isExpanded: true,
    });
    expect(wrapper.find(CouponDetails).prop('isExpanded')).toBeTruthy();
  });

  it('removes partial redeem toggle for "Single use" coupons', () => {
    let options;

    wrapper = mount(<CouponDetailsWrapper isExpanded />);
    options = wrapper.find('select').first().prop('children').map(option => option.props.value);
    expect(options).toHaveLength(4);
    expect(options.includes('partially-redeemed')).toBeTruthy();

    wrapper = mount((
      <CouponDetailsWrapper
        couponData={{
          ...initialCouponData,
          usage_limitation: SINGLE_USE,
        }}
        isExpanded
      />
    ));
    options = wrapper.find('select').first().prop('children').map(option => option.props.value);
    expect(options).toHaveLength(3);
    expect(options.includes('partially-redeemed')).toBeFalsy();
  });

  it('removes partial redeem toggle for "Once per customer" coupons', () => {
    let options;

    wrapper = mount(<CouponDetailsWrapper isExpanded />);
    options = wrapper.find('select').first().prop('children').map(option => option.props.value);
    expect(options).toHaveLength(4);
    expect(options.includes('partially-redeemed')).toBeTruthy();

    wrapper = mount((
      <CouponDetailsWrapper
        couponData={{
          ...initialCouponData,
          usage_limitation: ONCE_PER_CUSTOMER,
        }}
        isExpanded
      />
    ));
    options = wrapper.find('select').first().prop('children').map(option => option.props.value);
    expect(options).toHaveLength(3);
    expect(options.includes('partially-redeemed')).toBeFalsy();
  });

  it('properly handles changes to selected toggle input', () => {
    wrapper = mount(<CouponDetailsWrapper isExpanded />);
    expect(wrapper.find('select').first().prop('value')).toEqual('unassigned');

    wrapper.find('select').first().simulate('change', { target: { value: 'redeemed' } });
    expect(wrapper.find('select').first().prop('value')).toEqual('redeemed');

    wrapper.find('select').first().simulate('change', { target: { value: 'unassigned' } });
    expect(wrapper.find('select').first().prop('value')).toEqual('unassigned');
  });

  it('renders error status alert if fetching individual coupon overview fails', () => {
    const spy = jest.spyOn(EcommerceaApiService, 'fetchCouponOrders');
    store = mockStore({
      ...initialState,
      coupons: {
        couponOverviewLoading: false,
        couponOverviewError: new Error('test-error'),
      },
    });

    wrapper = mount((
      <CouponDetailsWrapper
        store={store}
        isExpanded
      />
    ));

    expect(wrapper.find(StatusAlert).prop('alertType')).toEqual('danger');
    wrapper.find(StatusAlert).find('.alert-dialog .btn').simulate('click'); // Retry fetching coupon overview data

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith({ coupon_id: initialCouponData.id });
  });

  it('sets disabled to true when unassignedCodes === 0', () => {
    wrapper = mount((
      <CouponDetailsWrapper
        couponData={{
          ...initialCouponData,
          num_unassigned: 0,
        }}
        isExpanded
      />
    ));
    expect(wrapper.find('select').last().prop('name')).toEqual('bulk-action');
    expect(wrapper.find('select').last().prop('disabled')).toEqual(true);
  });

  it('sets disabled to false when unassignedCodes !== 0', () => {
    store = mockStore({
      ...initialState,
      table: {
        'coupon-details': sampleTableData,
      },
    });

    wrapper = mount(<CouponDetailsWrapper store={store} isExpanded />);

    expect(wrapper.find('select').last().prop('name')).toEqual('bulk-action');
    expect(wrapper.find('select').last().prop('disabled')).toEqual(false);
  });

  it('removes remind button in case overview has errors', () => {
    wrapper = mount(<CouponDetailsWrapper
      store={store}
      couponData={{
        ...initialCouponData,
        errors: [{ code: 'test-code-1', user_email: 'test@bestrun.com' }],
      }}
      isExpanded
    />);

    const revokeButton = wrapper.find('table').find('button').find('.revoke-btn');
    expect(revokeButton.text()).toEqual('Revoke');

    expect(wrapper.find('table').find('button').find('.remind-btn').length).toEqual(0);
  });

  describe('modals', () => {
    let spy;

    const openModalByActionButton = ({ key, label }) => {
      const actionButton = wrapper.find('table').find('button').find(`.${key}-btn`);
      expect(actionButton.text()).toEqual(label);
      actionButton.simulate('click');
      // TODO: The remind/revoke buttons now manage their modal state in their
      // own components, so we only need to worry about the `assign` action now.
      // We might also want to move the Assign button to its own component as well.
      if (key === 'assign') {
        expect(wrapper.find('CouponDetails').instance().state.modals[key]).toBeTruthy();
      }
    };

    beforeEach(() => {
      spy = jest.spyOn(EcommerceaApiService, 'fetchCouponOrders');
      store = mockStore({
        ...initialState,
        table: {
          'coupon-details': sampleTableData,
        },
      });

      wrapper = mount((
        <CouponDetailsWrapper
          store={store}
          isExpanded
        />
      ));
    });

    afterEach(() => {
      spy.mockRestore();
    });

    it('sets remind modal state on Remind button click', () => {
      openModalByActionButton({
        key: 'remind',
        label: 'Remind',
      });
    });

    it('sets revoke modal state on Revoke button click', () => {
      openModalByActionButton({
        key: 'revoke',
        label: 'Revoke',
      });
    });

    it('sets assignment modal state on Assign button click', () => {
      openModalByActionButton({
        key: 'assignment',
        label: 'Assign',
      });
    });

    it('shows correct remaining uses on assignment modal', () => {
      openModalByActionButton({
        key: 'assignment',
        label: 'Assign',
      });

      expect(wrapper.find('.assignment-details .code-remaining-uses').text()).toEqual('Remaining Uses: 85');
    });

    it('sets remind modal state on bulk remind click', () => {
      wrapper.find('.toggles select').simulate('change', { target: { value: 'unredeemed' } });
      expect(wrapper.find('.toggles select').prop('value')).toEqual('unredeemed');

      selectAllCodesOnPage({
        isSelected: true,
        expectedSelectionLength: 3,
      });

      wrapper.find('.bulk-actions select').simulate('change', { target: { value: 'remind' } });
      expect(wrapper.find('.bulk-actions select').prop('value')).toEqual('remind');

      wrapper.find('.bulk-actions .btn').simulate('click');
      expect(wrapper.find('CouponDetails').instance().state.modals.remind).toBeTruthy();
    });

    it('sets revoke modal state on bulk revoke click', () => {
      wrapper.find('.toggles select').simulate('change', { target: { value: 'unredeemed' } });
      expect(wrapper.find('.toggles select').prop('value')).toEqual('unredeemed');

      selectAllCodesOnPage({
        isSelected: true,
        expectedSelectionLength: 3,
      });

      wrapper.find('.bulk-actions select').simulate('change', { target: { value: 'revoke' } });
      expect(wrapper.find('.bulk-actions select').prop('value')).toEqual('revoke');

      wrapper.find('.bulk-actions .btn').simulate('click');
      expect(wrapper.find('CouponDetails').instance().state.modals.revoke).toBeTruthy();
    });

    it('sets assignment modal state on bulk assign click', () => {
      wrapper.find('.bulk-actions .btn').simulate('click');
      expect(wrapper.find('CouponDetails').instance().state.modals.assignment).toBeTruthy();
    });

    it('handles successful code assignment from modal', () => {
      openModalByActionButton({
        key: 'assignment',
        label: 'Assign',
      });

      // fake successful code assignment
      wrapper.find(CodeAssignmentModal).prop('onSuccess')();
      expect(wrapper.find('CouponDetails').instance().state.isCodeAssignmentSuccessful).toBeTruthy();

      wrapper.update();

      // success status alert
      expect(wrapper.find(StatusAlert).prop('alertType')).toEqual('success');
      wrapper.find(StatusAlert).find('.alert-dialog .btn').simulate('click');

      expect(wrapper.find('CouponDetails').instance().state.isCodeAssignmentSuccessful).toBeFalsy();
      expect(wrapper.find('CouponDetails').instance().state.selectedToggle).toEqual('unredeemed');

      // fetches overview data for coupon
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith({ coupon_id: initialCouponData.id });
    });

    it('handles successful code revoke from modal', () => {
      openModalByActionButton({
        key: 'revoke',
        label: 'Revoke',
      });

      // fake successful code assignment
      wrapper.find('CodeRevokeModal').prop('onSuccess')();
      expect(wrapper.find('CouponDetails').instance().state.isCodeRevokeSuccessful).toBeTruthy();

      wrapper.update();

      // success status alert
      expect(wrapper.find(StatusAlert).prop('alertType')).toEqual('success');

      // fetches overview data for coupon
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith({ coupon_id: initialCouponData.id });
    });

    it('handles successful code remind from modal', () => {
      openModalByActionButton({
        key: 'remind',
        label: 'Remind',
      });

      // fake successful code assignment
      wrapper.find(CodeReminderModal).prop('onSuccess')();
      expect(wrapper.find('CouponDetails').instance().state.isCodeReminderSuccessful).toBeTruthy();

      wrapper.update();

      // success status alert
      expect(wrapper.find(StatusAlert).prop('alertType')).toEqual('success');

      // does not fetch overview data for coupon
      expect(spy).toBeCalledTimes(0);
    });

    it('handles errors in response data for code reminder ', () => {
      openModalByActionButton({
        key: 'remind',
        label: 'Remind',
      });

      // fake code assignment 200 status with error in response data.
      wrapper.find(CodeReminderModal).prop('onSuccess')([{ detail: 'failure' }]);
      expect(wrapper.find('CouponDetails').instance().state.doesCodeActionHaveErrors).toBeTruthy();

      // does not fetch overview data for coupon
      expect(spy).toBeCalledTimes(0);
    });
  });

  describe('code selection', () => {
    beforeEach(() => {
      store = mockStore({
        ...initialState,
        table: {
          'coupon-details': sampleTableData,
        },
      });
      wrapper = mount((
        <CouponDetailsWrapper
          store={store}
          isExpanded
        />
      ));
    });

    it('handles individual code selection within table', () => {
      const checkboxes = wrapper.find('table').find('input[type=\'checkbox\']').slice(1);

      checkboxes.first().simulate('change', { target: { value: true } });
      checkboxes.last().simulate('change', { target: { value: true } });

      expect(wrapper.find('CouponDetails').instance().state.selectedCodes).toHaveLength(2);

      checkboxes.first().simulate('change', { target: { value: false } });
      expect(wrapper.find('CouponDetails').instance().state.selectedCodes).toHaveLength(1);
    });

    it('handles select all checkbox click', () => {
      // select all codes
      selectAllCodesOnPage({
        isSelected: true,
        expectedSelectionLength: 3,
      });

      // unselect all codes
      selectAllCodesOnPage({
        isSelected: false,
        expectedSelectionLength: 0,
      });
    });

    it('handles select all codes across pages', () => {
      selectAllCodesOnPage({
        isSelected: true,
        expectedSelectionLength: 3,
      });

      const alert = wrapper.find('CouponDetails').find('.alert');
      expect(alert).toBeTruthy();
      alert.find('.btn').simulate('click');

      expect(wrapper.find('CouponDetails').instance().state.hasAllCodesSelected).toBeTruthy();
    });
  });
});
