import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import Router, { Route } from 'react-router-dom';
import { renderHook } from '@testing-library/react-hooks/dom';
import ContentHighlightSet from '../ContentHighlightSet';
import { useHighlightSet } from '../data/hooks';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import { ContentHighlightsContext, initialStateValue, testCourseHighlightsData } from '../../../data/tests/ContentHighlightsTestData';

jest.mock('../../../data/services/EnterpriseCatalogApiService');

const mockHighlightSetResponse = testCourseHighlightsData;
const highlightSetUUID = 'fake-uuid';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ContentHighlightSetWrapper = (
  value = initialStateValue,
  ...props
) => (
  <ContentHighlightsContext.Provider value={value}>
    <Route
      path={`/:enterpriseSlug/admin/${ROUTE_NAMES.contentHighlights}/:highlightSetUUID`}
      render={routeProps => <ContentHighlightSet {...routeProps} {...props} />}
    />
  </ContentHighlightsContext.Provider>
);

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
      highlightSet: testCourseHighlightsData,
    });
    expect(
      EnterpriseCatalogApiService.fetchHighlightSet,
    ).toHaveBeenCalled();
  });
});
