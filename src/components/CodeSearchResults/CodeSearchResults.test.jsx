import React from 'react';
import PropTypes from 'prop-types';

import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import CodeSearchResults from './index';
import EcommerceApiService from '../../data/services/EcommerceApiService';

jest.mock('../../data/services/EcommerceApiService');

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);

const sampleEmailTemplate = {
  'email-template-subject': 'Sample email subject.. ',
  'email-template-greeting': 'Sample email greeting.. ',
  'email-template-body': 'Sample email body template.. ',
  'email-template-closing': 'Sample email closing template.. ',
  'email-template-files': [
    { name: 'file1.png', size: 123, contents: '' },
    { name: 'file2.png', size: 456, contents: '' },
  ],
};

const emailDefaults = {
  'template-id': 0,
  'template-name-select': '',
  ...sampleEmailTemplate,
};

// Minimal Redux store – table state is no longer used by CodeSearchResultsTable
// (now manages its own data via direct API calls), but other components
// (RemindButton, RevokeButton modals) still require emailTemplate / form state.
const initialStore = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise',
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
    'code-reminder-modal-form': { initial: {} },
    'code-revoke-modal-form': { initial: {} },
  },
};

const sampleResults = [
  {
    coupon_id: 1,
    coupon_name: 'Test Coupon Name',
    code: 'Y7XS3OGG7WB7KQ5R',
    course_key: 'test-course-key',
    course_title: 'Test Course Title',
    redeemed_date: '2019-08-28',
  },
  {
    coupon_id: 2,
    coupon_name: 'Test Coupon Name 2',
    code: 'CMX9N1LPGTUSL7DU',
    course_key: null,
    course_title: null,
    redeemed_date: null,
  },
  {
    coupon_id: 1,
    coupon_name: 'Test Coupon Name',
    code: 'Y7XS3OGG7WB7KQ5R',
    course_key: 'test-course-key',
    course_title: 'Test Course Title',
    redeemed_date: '2019-08-30',
  },
  {
    coupon_id: 1,
    coupon_name: 'Test Coupon Name',
    code: 'FAG2LVLNHAKIXQ0Q',
    course_key: null,
    course_title: null,
    redeemed_date: null,
  },
];

const singleAssignedResult = [
  {
    coupon_id: 10,
    coupon_name: 'Test Coupon Name',
    code: 'Y7XS3OGG7WB7KQ5R',
    course_key: null,
    course_title: null,
    redeemed_date: null,
    is_assigned: true,
    user_email: 'test@test.com',
  },
];

const CodeSearchResultsWrapper = ({ store, ...props }) => (
  <MemoryRouter>
    <Provider store={store || getMockStore({ ...initialStore })}>
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
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: empty results so tests that do not set their own mock still resolve
    EcommerceApiService.fetchCodeSearchResults.mockResolvedValue({
      data: { results: [], num_pages: 0, count: 0 },
    });
    const noop = () => Promise.resolve({ data: {} });
    EcommerceApiService.sendCodeReminder.mockImplementation(noop);
    EcommerceApiService.sendCodeRevoke.mockImplementation(noop);
  });

  describe('basic rendering', () => {
    it('should render nothing visible when isOpen prop is false', () => {
      // Synchronous snapshot: CodeSearchResultsTable is not mounted when isOpen=false
      const tree = renderer
        .create((
          <CodeSearchResultsWrapper
            onClose={jest.fn()}
            searchQuery="test@test.com"
          />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should show the results panel while data is loading', async () => {
      let resolveSearch;
      EcommerceApiService.fetchCodeSearchResults.mockImplementation(
        () => new Promise((resolve) => { resolveSearch = resolve; }),
      );
      const { container } = render(
        <CodeSearchResultsWrapper
          onClose={jest.fn()}
          searchQuery="test@test.com"
          isOpen
        />,
      );
      // The results panel is visible immediately even before fetch completes
      expect(container.querySelector('[data-testid="code-search-results"]')).not.toBeNull();
      // Settle the component to avoid post-test act() warnings
      await waitFor(() => {
        resolveSearch({ data: { results: [], num_pages: 0, count: 0 } });
      });
    });

    it('should render table data', async () => {
      EcommerceApiService.fetchCodeSearchResults.mockResolvedValue({
        data: {
          current_page: 1,
          num_pages: 1,
          count: sampleResults.length,
          results: sampleResults,
        },
      });
      render(
        <CodeSearchResultsWrapper
          onClose={jest.fn()}
          searchQuery="test@test.com"
          isOpen
        />,
      );
      await waitFor(() => expect(screen.getAllByText('Test Coupon Name').length).toBeGreaterThan(0));
      expect(screen.getByText('Test Coupon Name 2')).not.toBeNull();
      expect(screen.getAllByText('Test Course Title').length).toBeGreaterThan(0);
    });

    it('should render table data when searchQuery is a code', async () => {
      const codeResult = [{
        coupon_id: 1,
        coupon_name: 'Test Coupon Name',
        code: 'FAG2LVLNHAKIXQ0Q',
        course_key: null,
        course_title: null,
        redeemed_date: null,
        is_assigned: true,
        user_email: 'test@test.com',
      }];
      EcommerceApiService.fetchCodeSearchResults.mockResolvedValue({
        data: {
          current_page: 1, num_pages: 1, count: 1, results: codeResult,
        },
      });
      render(
        <CodeSearchResultsWrapper
          onClose={jest.fn()}
          searchQuery="FAG2LVLNHAKIXQ0Q"
          isOpen
        />,
      );
      // "Assigned To" column should appear for code (non-email) searches
      await waitFor(() => expect(screen.getByText('Assigned To')).not.toBeNull());
      expect(screen.getByText('test@test.com')).not.toBeNull();
    });

    it('should render empty table data message', async () => {
      render(
        <CodeSearchResultsWrapper
          onClose={jest.fn()}
          searchQuery="test@test.com"
          isOpen
        />,
      );
      await waitFor(() => expect(screen.getByText('There are no results.')).not.toBeNull());
    });

    it('should render error alert on fetch failure', async () => {
      EcommerceApiService.fetchCodeSearchResults.mockRejectedValue(
        new Error('Network Error'),
      );
      render(
        <CodeSearchResultsWrapper
          onClose={jest.fn()}
          searchQuery="test@test.com"
          isOpen
        />,
      );
      await waitFor(() => expect(screen.getByText(/unable to load data/i)).not.toBeNull());
      expect(screen.getByText(/Network Error/)).not.toBeNull();
    });
  });

  describe('action buttons', () => {
    const flushPromises = () => new Promise((resolve) => { setTimeout(resolve, 0); });

    beforeEach(() => {
      EcommerceApiService.fetchCodeSearchResults.mockResolvedValue({
        data: {
          current_page: 1,
          num_pages: 1,
          count: 1,
          results: singleAssignedResult,
        },
      });
    });

    it('should handle remind button', async () => {
      const { container } = render(
        <CodeSearchResultsWrapper
          onClose={jest.fn()}
          searchQuery="test@test.com"
          isOpen
        />,
      );
      EcommerceApiService.fetchEmailTemplate.mockResolvedValue({ data: {} });
      expect(screen.queryByRole('alert')).toBeNull();
      const remindButton = await waitFor(() => {
        const btn = container.querySelector('.remind-btn');
        expect(btn).not.toBeNull();
        return btn;
      });
      fireEvent.click(remindButton);
      const remindModalSubmitButton = await screen.findByTestId('remind-submit-btn');
      fireEvent.click(remindModalSubmitButton);
      await flushPromises();
      expect(await screen.findByRole('alert')).not.toBeNull();
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
      });
      const { container } = render(
        <CodeSearchResultsWrapper
          store={store}
          onClose={jest.fn()}
          searchQuery="test@test.com"
          isOpen
        />,
      );
      EcommerceApiService.fetchEmailTemplate.mockResolvedValue({ data: {} });
      expect(screen.queryByRole('alert')).toBeNull();
      const remindButton = await waitFor(() => {
        const btn = container.querySelector('.remind-btn');
        expect(btn).not.toBeNull();
        return btn;
      });
      fireEvent.click(remindButton);
      const remindModalSubmitButton = await screen.findByTestId('remind-submit-btn');
      fireEvent.click(remindModalSubmitButton);
      await flushPromises();
      expect(await screen.findByRole('alert')).not.toBeNull();
    });

    it('should handle revoke button', async () => {
      const { container } = render(
        <CodeSearchResultsWrapper
          onClose={jest.fn()}
          searchQuery="test@test.com"
          isOpen
        />,
      );
      expect(screen.queryByRole('alert')).toBeNull();
      const revokeButton = await waitFor(() => {
        const btn = container.querySelector('.revoke-btn');
        expect(btn).not.toBeNull();
        return btn;
      });
      fireEvent.click(revokeButton);
      const revokeModalSaveBtn = await screen.findByTestId('revoke-submit-btn');
      fireEvent.click(revokeModalSaveBtn);
      await flushPromises();
      expect(await screen.findByRole('alert')).not.toBeNull();
    });
  });

  it('should handle close button click', async () => {
    const mockOnClose = jest.fn();
    const { container } = render(
      <CodeSearchResultsWrapper
        onClose={mockOnClose}
        searchQuery="test@test.com"
        isOpen
      />,
    );
    const closeBtn = await waitFor(() => container.querySelector('.close-search-results-btn'));
    fireEvent.click(closeBtn);
    expect(mockOnClose).toBeCalledTimes(1);
  });
});
