import React from 'react';
import '@testing-library/jest-dom';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import {
  screen,
  render,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { axe } from 'jest-axe';
import CodeManagement from '../index';
import CodeManagementRoutes from '../CodeManagementRoutes';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

const COUPON_CODE_TABS_MOCK_CONTENT = 'coupon code tabs';
const MANAGE_CODES_MOCK_CONTENT = 'manage codes';
const NOT_FOUND_MOCK_CONTENT = 'not found';

jest.mock(
  '../CouponCodeTabs',
  () => function CouponCodeTabs() {
    return <div>{COUPON_CODE_TABS_MOCK_CONTENT}</div>;
  },
);

jest.mock(
  '../../NotFoundPage',
  () => function NotFoundPage() {
    return <div>{NOT_FOUND_MOCK_CONTENT}</div>;
  },
);

jest.mock(
  '../ManageCodesTab',
  () => function ManageCodesTab() {
    return <div>{MANAGE_CODES_MOCK_CONTENT}</div>;
  },
);

const enterpriseId = 'test-enterprise';
const enterpriseSlug = 'sluggy';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug,
    enableLearnerPortal: false,
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const store = getMockStore({ ...initialStore });

const CodeManagementRoutesWithRouter = ({
  store: storeProp,
  initialEntries,
  routePath,
}) => (
  <MemoryRouter initialEntries={initialEntries}>
    <Provider store={storeProp}>
      <Routes>
        <Route path={`${routePath}*`} element={<CodeManagementRoutes />} />
      </Routes>
    </Provider>
  </MemoryRouter>
);

const CodeManagementWithRouter = ({
  store: storeProp,
  initialEntries,
  routePath,
}) => (
  <IntlProvider locale="en">
    <MemoryRouter initialEntries={initialEntries}>
      <Provider store={storeProp}>
        <Routes>
          <Route path={`${routePath}*`} element={<CodeManagement />} />
        </Routes>
      </Provider>
    </MemoryRouter>
  </IntlProvider>
);

CodeManagementRoutesWithRouter.propTypes = {
  store: PropTypes.shape(),
  initialEntries: PropTypes.arrayOf(PropTypes.string),
  routePath: PropTypes.string,
};

CodeManagementWithRouter.propTypes = {
  store: PropTypes.shape(),
  initialEntries: PropTypes.arrayOf(PropTypes.string),
  routePath: PropTypes.string,
};

CodeManagementRoutesWithRouter.defaultProps = {
  store,
  initialEntries: [`/${enterpriseSlug}/admin/coupons`],
  routePath: '/',
};

CodeManagementWithRouter.defaultProps = {
  store,
  initialEntries: ['/*'],
  routePath: '/',
};

describe('<CodeManagementRoutes />', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<CodeManagementRoutesWithRouter />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('redirects to default tab', () => {
    const newStore = getMockStore(initialStore);

    render(<CodeManagementRoutesWithRouter store={newStore} />);
    expect(screen.getByText(COUPON_CODE_TABS_MOCK_CONTENT));
  });
});

describe('<CodeManagement />', () => {
  it('renders the hero component with localized page title', () => {
    render(<CodeManagementWithRouter initialEntries={[`/${enterpriseSlug}/admin/coupons`]} />);

    expect(screen.getByRole('heading', { name: 'Code Management' })).toBeInTheDocument();
  });

  it('renders the code management routes content', () => {
    render(<CodeManagementWithRouter initialEntries={[`/${enterpriseSlug}/admin/coupons`]} />);

    expect(screen.getByText(COUPON_CODE_TABS_MOCK_CONTENT)).toBeInTheDocument();
  });

  it('renders main element and container spacing class', () => {
    const { container } = render(
      <CodeManagementWithRouter initialEntries={[`/${enterpriseSlug}/admin/coupons`]} />,
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(container.querySelector('.py-3')).toBeInTheDocument();
  });
});
