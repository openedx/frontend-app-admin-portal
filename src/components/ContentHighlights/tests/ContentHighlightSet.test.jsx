import algoliasearch from 'algoliasearch/lite';
import React, { useState } from 'react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import Router, { Route } from 'react-router-dom';
import { renderHook } from '@testing-library/react-hooks/dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { camelCaseObject } from '@edx/frontend-platform';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import ContentHighlightSet from '../ContentHighlightSet';
import { useHighlightSet } from '../data/hooks';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import { TEST_COURSE_HIGHLIGHTS_DATA } from '../data/constants';
import { configuration } from '../../../config';

jest.mock('../../../data/services/EnterpriseCatalogApiService');

const mockHighlightSetResponse = camelCaseObject(TEST_COURSE_HIGHLIGHTS_DATA);
const mockStore = configureMockStore([thunk]);
const highlightSetUUID = 'fake-uuid';
const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise',
  },
  highlightSetUUID,
};
const mockDispatchFn = jest.fn();
const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    dispatch: mockDispatchFn,
  },
};
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ContentHighlightSetWrapper = (
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  { children },
  ...props
) => {
  /* eslint-enable react/prop-types */
  const contextValue = useState({
    stepperModal: {
      isOpen: false,
      highlightTitle: null,
      titleStepValidationError: null,
      currentSelectedRowIds: {},
    },
    contentHighlights: [],
    searchClient,
  });
  return (
    <IntlProvider locale="en">
      <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
        <ContentHighlightsContext.Provider value={contextValue}>
          <Provider store={mockStore(initialState)}>
            {children}
            <Route
              path={`/:enterpriseSlug/admin/${ROUTE_NAMES.contentHighlights}/:highlightSetUUID`}
              render={routeProps => <ContentHighlightSet {...routeProps} {...props} />}
            />
          </Provider>
        </ContentHighlightsContext.Provider>
      </EnterpriseAppContext.Provider>
    </IntlProvider>
  );
};

describe('<ContentHighlightSet>', () => {
  it('Displays the title of the highlight set', async () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({ highlightSetUUID });
    EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValueOnce({
      data: mockHighlightSetResponse,
    });
    const { result, waitForNextUpdate } = renderHook(() => useHighlightSet(highlightSetUUID));
    expect(result.current).toEqual({
      isLoading: true,
      error: null,
      highlightSet: [],
    });

    await waitForNextUpdate();
    expect(result.current).toEqual({
      isLoading: false,
      error: null,
      highlightSet: camelCaseObject(TEST_COURSE_HIGHLIGHTS_DATA),
    });
    expect(
      EnterpriseCatalogApiService.fetchHighlightSet,
    ).toHaveBeenCalled();
  });
});
