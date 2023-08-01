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
const enterpriseId = 'test-enterprise';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
  },
};
const store = getMockStore({ ...initialStore });
const enterpriseUUID = '1234';

const defaultEnterpriseSubsidiesContextValue = {
  offers: [],
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
    render(<MultipleBudgetsPageWrapper enterpriseUUID={enterpriseUUID} enterpriseSlug={enterpriseId} />);
    expect(screen.getByText('No budgets for your organization'));
    expect(screen.getByText('Contact support'));
  });
});
