import React from 'react';
import PropTypes from 'prop-types';

import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { legacy_configureStore as configureMockStore } from 'redux-mock-store';
import thunk from 'redux-thunk';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import CodeSearchResults from './index';

import EcommerceApiService from '../../data/services/EcommerceApiService';

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

const CodeSearchResultsWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store || getMockStore({ ...initialStore })}>
      <IntlProvider locale="en">
        <CodeSearchResults {...props} />
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

CodeSearchResultsWrapper.propTypes = {
  store: PropTypes.shape({}),
};

CodeSearchResultsWrapper.defaultProps = {
  store: null,
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
      const tree = renderer
        .create((
          <CodeSearchResultsWrapper
            onClose={jest.fn()}
            searchQuery="test@test.com"
            enableLearnerPortal={false}
            enterpriseSlug="sluggy"
          />
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
          <CodeSearchResultsWrapper
            onClose={jest.fn()}
            searchQuery="test@test.com"
            store={store}
            isOpen
          />
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
          <CodeSearchResultsWrapper
            store={store}
            onClose={jest.fn()}
            searchQuery="test@test.com"
            isOpen
          />
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
          <CodeSearchResultsWrapper
            store={store}
            onClose={jest.fn()}
            searchQuery="FAG2LVLNHAKIXQ0Q"
            isOpen
          />
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
          <CodeSearchResultsWrapper
            store={store}
            onClose={jest.fn()}
            searchQuery="test@test.com"
            isOpen
          />
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
          <CodeSearchResultsWrapper
            store={store}
            onClose={jest.fn()}
            searchQuery="test@test.com"
            isOpen
          />
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

      const { container } = render(
        <CodeSearchResultsWrapper
          store={store}
          onClose={jest.fn()}
          searchQuery="test@test.com"
          isOpen
        />,
      );
      const mockPromiseResolve = () => Promise.resolve({ data: {} });
      EcommerceApiService.fetchEmailTemplate.mockImplementation(mockPromiseResolve);
      expect(await screen.queryByRole('alert')).toBeNull();
      const remindButton = container.querySelector('.remind-btn');
      await waitFor(() => fireEvent.click(remindButton));
      const remindModalSubmitButton = await screen.findByTestId('remind-submit-btn');
      fireEvent.click(remindModalSubmitButton);
      await flushPromises();
      expect(await screen.queryByRole('alert')).not.toBeNull();
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
      const { container } = render(
        <CodeSearchResultsWrapper
          store={store}
          onClose={jest.fn()}
          searchQuery="test@test.com"
          isOpen
        />,
      );
      const mockPromiseResolve = () => Promise.resolve({ data: {} });
      EcommerceApiService.fetchEmailTemplate.mockImplementation(mockPromiseResolve);
      expect(await screen.queryByRole('alert')).toBeNull();
      const remindButton = container.querySelector('.remind-btn');
      await waitFor(() => fireEvent.click(remindButton));
      const remindModalSubmitButton = await screen.findByTestId('remind-submit-btn');
      fireEvent.click(remindModalSubmitButton);
      await flushPromises();
      expect(await screen.queryByRole('alert')).not.toBeNull();
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
      const { container } = render(
        <CodeSearchResultsWrapper
          store={store}
          onClose={jest.fn()}
          searchQuery="test@test.com"
          isOpen
        />,
      );
      expect(screen.queryByRole('alert')).toBeNull();
      const revokeButton = container.querySelector('.revoke-btn');
      await waitFor(() => fireEvent.click(revokeButton));
      const revokeModalSaveBtn = await screen.findByTestId('revoke-submit-btn');
      fireEvent.click(revokeModalSaveBtn);
      await flushPromises();
      expect(await screen.queryByRole('alert')).not.toBeNull();
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
    const { container } = render(
      <CodeSearchResultsWrapper
        store={store}
        onClose={mockOnClose}
        searchQuery="test@test.com"
        isOpen
      />,
    );
    const closeBtn = container.querySelector('.close-search-results-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toBeCalledTimes(1);
  });
});
