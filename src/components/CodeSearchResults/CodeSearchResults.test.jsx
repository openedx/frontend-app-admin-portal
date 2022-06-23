import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import CodeSearchResults from './index';

import EcommerceApiService from '../../data/services/EcommerceApiService';
import CodeReminderModal from '../../containers/CodeReminderModal';

jest.mock('../../data/services/EcommerceApiService');

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);

const sampleEmailTemplate = {
  'email-template-subject': 'Sample email subject.. ',
  'email-template-greeting': 'Sample email greeting.. ',
  'email-template-body': 'Sample email body template.. ',
  'email-template-closing': 'Sample email closing template.. ',
  'email-template-files': [{ name: 'file1.png', size: 123, contents: '' }, { name: 'file2.png', size: 456, contents: '' }],
};

const emailDefaults = {
  'template-id': 0,
  'template-name-select': '',
  ...sampleEmailTemplate,
};

const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug: 'sluggy',
    enableLearnerPortal: false,
  },
  table: {},
  emailTemplate: {
    loading: false,
    error: null,
    allTemplates: [],
    emailTemplateSource: 'new_email',
    default: {
      assign: { ...sampleEmailTemplate },
      remind: { ...sampleEmailTemplate },
      revoke: { ...sampleEmailTemplate },
    },
    assign: { ...emailDefaults },
    remind: { ...emailDefaults },
    revoke: { ...emailDefaults },
  },
  form: {
    'code-reminder-modal-form': {
      initial: {},
    },
    'code-revoke-modal-form': {
      initial: {},
    },
  },
};

describe('<CodeSearchResults />', () => {
  beforeAll(() => {
    const mockPromiseResolve = () => Promise.resolve({ data: {} });
    EcommerceApiService.fetchCodeSearchResults.mockImplementation(mockPromiseResolve);
    EcommerceApiService.sendCodeReminder.mockImplementation(mockPromiseResolve);
    EcommerceApiService.sendCodeRevoke.mockImplementation(mockPromiseResolve);
  });

  describe('basic rendering', () => {
    it('should render nothing visible when isOpen prop is false', () => {
      const store = getMockStore({ ...initialStore });
      const tree = renderer
        .create((
          <MemoryRouter>
            <Provider store={store}>
              <CodeSearchResults
                onClose={jest.fn()}
                searchQuery="test@test.com"
                enableLearnerPortal={false}
                enterpriseSlug="sluggy"
              />
            </Provider>
          </MemoryRouter>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should render loading', () => {
      const store = getMockStore({
        ...initialStore,
        table: {
          'code-search-results': {
            loading: true,
            error: null,
            data: null,
          },
        },
      });
      const tree = renderer
        .create((
          <MemoryRouter>
            <Provider store={store}>
              <CodeSearchResults
                onClose={jest.fn()}
                searchQuery="test@test.com"
                isOpen
              />
            </Provider>
          </MemoryRouter>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should render table data', () => {
      const store = getMockStore({
        ...initialStore,
        table: {
          'code-search-results': {
            loading: false,
            error: null,
            data: {
              current_page: 1,
              num_pages: 1,
              results: [{
                coupon_id: 1,
                coupon_name: 'Test Coupon Name',
                code: 'Y7XS3OGG7WB7KQ5R',
                course_key: 'test-course-key',
                course_title: 'Test Course Title',
                redeemed_date: '2019-08-28',
              }, {
                coupon_id: 2,
                coupon_name: 'Test Coupon Name 2',
                code: 'CMX9N1LPGTUSL7DU',
                course_key: null,
                course_title: null,
                redeemed_date: null,
              }, {
                coupon_id: 1,
                coupon_name: 'Test Coupon Name',
                code: 'Y7XS3OGG7WB7KQ5R',
                course_key: 'test-course-key',
                course_title: 'Test Course Title',
                redeemed_date: '2019-08-30',
              }, {
                coupon_id: 1,
                coupon_name: 'Test Coupon Name',
                code: 'FAG2LVLNHAKIXQ0Q',
                course_key: null,
                course_title: null,
                redeemed_date: null,
              }],
            },
          },
        },
      });
      const tree = renderer
        .create((
          <MemoryRouter>
            <Provider store={store}>
              <CodeSearchResults
                onClose={jest.fn()}
                searchQuery="test@test.com"
                isOpen
              />
            </Provider>
          </MemoryRouter>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should render table data when searchQuery is a code', () => {
      const store = getMockStore({
        ...initialStore,
        table: {
          'code-search-results': {
            loading: false,
            error: null,
            data: {
              current_page: 1,
              num_pages: 1,
              results: [{
                coupon_id: 1,
                coupon_name: 'Test Coupon Name',
                code: 'FAG2LVLNHAKIXQ0Q',
                course_key: null,
                course_title: null,
                redeemed_date: null,
                is_assigned: true,
                user_email: 'test@test.com',
              }],
            },
          },
        },
      });
      const tree = renderer
        .create((
          <MemoryRouter>
            <Provider store={store}>
              <CodeSearchResults
                onClose={jest.fn()}
                searchQuery="FAG2LVLNHAKIXQ0Q"
                isOpen
              />
            </Provider>
          </MemoryRouter>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should render empty table data', () => {
      const store = getMockStore({
        ...initialStore,
        table: {
          'code-search-results': {
            loading: false,
            error: null,
            data: {
              current_page: 1,
              num_pages: 1,
              results: [],
            },
          },
        },
      });
      const tree = renderer
        .create((
          <MemoryRouter>
            <Provider store={store}>
              <CodeSearchResults
                onClose={jest.fn()}
                searchQuery="test@test.com"
                isOpen
              />
            </Provider>
          </MemoryRouter>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should render error', () => {
      const store = getMockStore({
        ...initialStore,
        table: {
          'code-search-results': {
            loading: false,
            error: new Error('Network Error'),
            data: null,
          },
        },
      });
      const tree = renderer
        .create((
          <MemoryRouter>
            <Provider store={store}>
              <CodeSearchResults
                onClose={jest.fn()}
                searchQuery="test@test.com"
                isOpen
              />
            </Provider>
          </MemoryRouter>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('action buttons', () => {
    const flushPromises = () => new Promise(setImmediate);

    it('should handle remind button', async () => {
      const store = getMockStore({
        ...initialStore,
        table: {
          'code-search-results': {
            loading: false,
            error: null,
            data: {
              current_page: 1,
              num_pages: 1,
              results: [{
                coupon_id: 10,
                coupon_name: 'Test Coupon Name',
                code: 'Y7XS3OGG7WB7KQ5R',
                course_key: null,
                course_title: null,
                redeemed_date: null,
                is_assigned: true,
                user_email: 'test@test.com',
              }],
            },
          },
        },
      });
      const wrapper = mount((
        <MemoryRouter>
          <Provider store={store}>
            <CodeSearchResults
              onClose={jest.fn()}
              searchQuery="test@test.com"
              isOpen
            />
          </Provider>
        </MemoryRouter>
      ));
      const mockPromiseResolve = () => Promise.resolve({ data: {} });
      EcommerceApiService.fetchEmailTemplate.mockImplementation(mockPromiseResolve);
      expect(wrapper.find('CodeSearchResults').state('isCodeReminderSuccessful')).toBeFalsy();
      wrapper.find('RemindButton').simulate('click');
      wrapper.find(CodeReminderModal).find('.code-remind-save-btn').first().simulate('click');
      await flushPromises();
      wrapper.update();
      expect(wrapper.find('CodeSearchResults').state('isCodeReminderSuccessful')).toBeTruthy();
    });

    it('should handle remind button for saved template', async () => {
      const store = getMockStore({
        ...initialStore,
        allTemplates: [{
          email_body: 'email_body',
          email_closing: 'email_closing',
          email_subject: 'email_subject',
          email_greeting: 'email_greeting',
          email_type: 'assign',
          id: 49,
          name: 'template-name',
        }],
        emailTemplateSource: 'from_template',
        table: {
          'code-search-results': {
            loading: false,
            error: null,
            data: {
              current_page: 1,
              num_pages: 1,
              results: [{
                coupon_id: 10,
                coupon_name: 'Test Coupon Name',
                code: 'Y7XS3OGG7WB7KQ5R',
                course_key: null,
                course_title: null,
                redeemed_date: null,
                is_assigned: true,
                user_email: 'test@test.com',
              }],
            },
          },
        },
      });
      const wrapper = mount((
        <MemoryRouter>
          <Provider store={store}>
            <CodeSearchResults
              onClose={jest.fn()}
              searchQuery="test@test.com"
              isOpen
            />
          </Provider>
        </MemoryRouter>
      ));
      const mockPromiseResolve = () => Promise.resolve({ data: {} });
      EcommerceApiService.fetchEmailTemplate.mockImplementation(mockPromiseResolve);
      expect(wrapper.find('CodeSearchResults').state('isCodeReminderSuccessful')).toBeFalsy();
      wrapper.find('RemindButton').simulate('click');
      wrapper.find(CodeReminderModal).find('.code-remind-save-btn').first().simulate('click');
      await flushPromises();
      wrapper.update();
      expect(wrapper.find('CodeSearchResults').state('isCodeReminderSuccessful')).toBeTruthy();
    });

    it('should handle revoke button', async () => {
      const store = getMockStore({
        ...initialStore,
        table: {
          'code-search-results': {
            loading: false,
            error: null,
            data: {
              current_page: 1,
              num_pages: 1,
              results: [{
                coupon_id: 10,
                coupon_name: 'Test Coupon Name',
                code: 'Y7XS3OGG7WB7KQ5R',
                course_key: null,
                course_title: null,
                redeemed_date: null,
                is_assigned: true,
                user_email: 'test@test.com',
              }],
            },
          },
        },
      });
      const wrapper = mount((
        <MemoryRouter>
          <Provider store={store}>
            <CodeSearchResults
              onClose={jest.fn()}
              searchQuery="test@test.com"
              isOpen
            />
          </Provider>
        </MemoryRouter>
      ));
      expect(wrapper.find('CodeSearchResults').state('isCodeRevokeSuccessful')).toBeFalsy();
      wrapper.find('RevokeButton').simulate('click');
      wrapper.find('CodeRevokeModal').find('.code-revoke-save-btn').first().simulate('click');
      await flushPromises();
      wrapper.update();
      expect(wrapper.find('CodeSearchResults').state('isCodeRevokeSuccessful')).toBeTruthy();
    });
  });

  it('should handle close button click', () => {
    const mockOnClose = jest.fn();
    const store = getMockStore({
      ...initialStore,
      table: {
        'code-search-results': {
          loading: false,
          error: null,
          data: {
            current_page: 1,
            num_pages: 1,
            results: [],
          },
        },
      },
    });
    const wrapper = mount((
      <MemoryRouter>
        <Provider store={store}>
          <CodeSearchResults
            onClose={mockOnClose}
            searchQuery="test@test.com"
            isOpen
          />
        </Provider>
      </MemoryRouter>
    ));

    wrapper.find('.close-search-results-btn').first().simulate('click');
    expect(mockOnClose).toBeCalledTimes(1);
  });
});
