/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import {
  screen,
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';
import MultipleBudgetsPage from '../MultipleBudgetsPage';

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const enterpriseId = 'test-enterprise-uuid';
const enterpriseSlug = 'test-enterprise-slug';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug,
    enableLearnerPortal: true,
  },
};
const store = getMockStore({ ...initialStore });
const enterpriseUUID = '1234';

const emptyOffersContextValue = {
  offers: [], // Empty offers array
};

const defaultEnterpriseSubsidiesContextValue = {
  offers: [{
    source: 'subsidy',
    id: '392f1fe1-ee91-4f44-b174-13ecf59866eb',
    name: 'Subsidy 2 for Executive Education (2U) Integration QA',
    start: '2023-06-07T15:38:29Z',
    end: '2024-06-07T15:38:30Z',
    isCurrent: true,
  },
  ],
};
const MultipleBudgetsPageWrapper = ({
  enterpriseSubsidiesContextValue = defaultEnterpriseSubsidiesContextValue,
  ...rest
}) => (
  <Provider store={store}>
    <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContextValue}>
      <MultipleBudgetsPage {...rest} />
    </EnterpriseSubsidiesContext.Provider>
  </Provider>
);

describe('<MultipleBudgetsPage />', () => {
  it('No budgets for your organization', () => {
    render(<MultipleBudgetsPageWrapper
      enterpriseUUID={enterpriseUUID}
      enterpriseSlug={enterpriseId}
      enterpriseSubsidiesContextValue={emptyOffersContextValue}
    />);
    expect(screen.getByText('No budgets for your organization'));
    expect(screen.getByText('Contact support'));
  });
  it('budgets for your organization', () => {
    render(<MultipleBudgetsPageWrapper enterpriseUUID={enterpriseUUID} enterpriseSlug={enterpriseId} />);
    expect(screen.getByText('Budgets'));
  });
});
