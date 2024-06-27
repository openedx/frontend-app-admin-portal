import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import ErrorPage from './index';
import { GlobalContext } from '../GlobalContextProvider';

const headerHeight = 0;
const footerHeight = 0;

const defaultGlobalContextValue = {
  headerHeight,
  footerHeight,
  minHeight: `calc(100vh - ${headerHeight + footerHeight + 16}px)`,
  dispatch: jest.fn(),
};

const ErrorPageWrapper = (props) => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <GlobalContext.Provider value={defaultGlobalContextValue}>
        <ErrorPage {...props} />
      </GlobalContext.Provider>
    </IntlProvider>
  </MemoryRouter>
);

describe('<ErrorPage />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <ErrorPageWrapper status={500} message="Something went terribly wrong" />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly for 404 errors', () => {
    const tree = renderer
      .create((
        <ErrorPageWrapper status={404} />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly for 403 errors', () => {
    const tree = renderer
      .create((
        <ErrorPageWrapper status={403} />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
