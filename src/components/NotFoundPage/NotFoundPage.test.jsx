import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import NotFoundPage from './index';
import { GlobalContext } from '../GlobalContextProvider';

const headerHeight = 0;
const footerHeight = 0;

const defaultGlobalContextValue = {
  headerHeight,
  footerHeight,
  minHeight: `calc(100vh - ${headerHeight + footerHeight + 16}px)`,
  dispatch: jest.fn(),
};

describe('<NotFoundPage />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <GlobalContext.Provider value={defaultGlobalContextValue}>
          <IntlProvider locale="en">
            <NotFoundPage />
          </IntlProvider>
        </GlobalContext.Provider>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
