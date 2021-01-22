import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import BulkEnrollmentModal from './index';

const mockStore = configureMockStore([thunk]);

const courseRunKeys = [
  'test-key-one',
  'test-key-two',
];

const emailAddresses = [
  'learnerOne@test.com',
  'learnerTwo@test.com',
];

const BulkEnrollmentModalWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <BulkEnrollmentModal
        onClose={() => {}}
        onSuccess={() => {}}
        enterpriseUuid="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

BulkEnrollmentModalWrapper.defaultProps = {
  store: mockStore({}),
};

BulkEnrollmentModalWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('BulkEnrollmentModalWrapper', () => {
  it('renders bulk enrollment modal', () => {
    const wrapper = mount(<BulkEnrollmentModalWrapper
      selectedCourseRunKeys={courseRunKeys}
      failedLearners={emailAddresses}
    />);
    expect(wrapper.find('.modal-title').text()).toEqual('Enroll Learners');
    expect(wrapper.find('.courses-selected').text()).toEqual(`Courses selected: ${courseRunKeys.length}`);
  });
});
