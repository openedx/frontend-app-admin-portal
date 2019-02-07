import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import CouponDetails from './index';

const mockStore = configureMockStore([thunk]);
const initialState = {
  csv: {
    'coupon-details': {},
  },
  table: {
    'coupon-details': {},
  },
};

const CouponDetailsWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <CouponDetails
        id={1}
        couponTitle="test-title"
        unassignedCodes={10}
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
  },
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

describe('CouponDetailsWrapper', () => {
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
      const tree = renderer
        .create((
          <CouponDetailsWrapper hasError isExpanded />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
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

  it('properly handles changes to selected toggle input', () => {
    wrapper = mount(<CouponDetailsWrapper isExpanded />);
    expect(wrapper.find('select').first().prop('value')).toEqual('unassigned');

    wrapper.find('select').first().simulate('change', { target: { value: 'redeemed' } });
    expect(wrapper.find('select').first().prop('value')).toEqual('redeemed');

    wrapper.find('select').first().simulate('change', { target: { value: 'unassigned' } });
    expect(wrapper.find('select').first().prop('value')).toEqual('unassigned');
  });

  it('sets disabled to true when unassignedCodes === 0', () => {
    wrapper = mount(<CouponDetailsWrapper isExpanded unassignedCodes={0} />);
    expect(wrapper.find('select').last().prop('name')).toEqual('bulk-action');
    expect(wrapper.find('select').last().prop('disabled')).toEqual(true);
  });

  it('sets disabled to false when unassignedCodes !== 0', () => {
    wrapper = mount(<CouponDetailsWrapper isExpanded />);
    expect(wrapper.find('select').last().prop('name')).toEqual('bulk-action');
    expect(wrapper.find('select').last().prop('disabled')).toEqual(false);
  });

  describe('modals', () => {
    const openModalByActionButton = ({ key, label }) => {
      const actionButton = wrapper.find('table').find('button').find(`.${key}-btn`);
      expect(actionButton.prop('children')).toEqual(label);
      actionButton.simulate('click');
      expect(wrapper.find('CouponDetails').instance().state.modals[key]).toBeTruthy();
    };

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

    it('sets remind modal state on Revoke button click', () => {
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

    it('does not open modal on unknown bulk action', () => {
      wrapper.find('.bulk-actions select').simulate('change', { target: { value: 'test' } });
      wrapper.find('.bulk-actions .btn').simulate('click');

      expect(wrapper.find('CouponDetails').instance().state.modals.assignment).toBeFalsy();
      expect(wrapper.find('CouponDetails').instance().state.modals.revoke).toBeFalsy();
    });

    it('handles successful code assignment from modal', () => {
      openModalByActionButton({
        key: 'assignment',
        label: 'Assign',
      });

      // fake successful code assignment
      wrapper.find('CodeAssignmentModal').prop('onSuccess')();
      expect(wrapper.find('CouponDetails').instance().state.isCodeAssignmentSuccessful).toBeTruthy();

      wrapper.update();

      // success status alert
      expect(wrapper.find('StatusAlert').prop('alertType')).toEqual('success');
      wrapper.find('StatusAlert').find('.alert-dialog .btn').simulate('click');

      expect(wrapper.find('CouponDetails').instance().state.isCodeAssignmentSuccessful).toBeFalsy();
      expect(wrapper.find('CouponDetails').instance().state.selectedToggle).toEqual('unredeemed');
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
