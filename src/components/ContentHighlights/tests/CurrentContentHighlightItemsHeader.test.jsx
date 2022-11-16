import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import CurrentContentHighlightItemsHeader from '../CurrentContentHighlightItemsHeader';

const mockStore = configureMockStore([thunk]);

const highlightSetUUID = 'fake-uuid';
/* Currently mocks TEST_COURSE_HIGHLIGHTS_DATA from data/constants.js by the uuid */
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    highlightSetUUID,
  }),
}));

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise-id',
  },
};

const mockDispatchFn = jest.fn();
const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    dispatch: mockDispatchFn,
  },
};

/* eslint-disable react/prop-types */
const ContentHighlightsCardItemsHeaderWrapper = ({
  enterpriseAppContext = initialEnterpriseAppContextValue,
  ...props
}) => (
/* eslint-enable react/prop-types */
  <Provider store={mockStore(initialState)}>
    <EnterpriseAppContext.Provider value={enterpriseAppContext}>
      <CurrentContentHighlightItemsHeader {...props} />
    </EnterpriseAppContext.Provider>
  </Provider>
);

describe('<CurrentContentHighlightItemsHeader>', () => {
  it('Displays all content data titles', () => {
    const initialRouterEntry = `/test-enterprise/admin/content-highlights/${highlightSetUUID}`;
    renderWithRouter(
      <ContentHighlightsCardItemsHeaderWrapper />,
      { route: initialRouterEntry },
    );
    expect(screen.getByText(highlightSetUUID)).toBeInTheDocument();
  });
});
