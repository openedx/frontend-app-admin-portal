import { logError } from '@edx/frontend-platform/logging';

import enterpriseCurationReducer, { enterpriseCurationActions } from './enterpriseCurationReducer';

const initialState = {
  isLoading: false,
  enterpriseCuration: null,
  enterpriseHighlightedSets: null,
  fetchError: null,
};
const highlightSetUUID = 'fake-uuid';

describe('enterpriseCurationReducer', () => {
  it('should set loading state', () => {
    expect(
      enterpriseCurationReducer(
        initialState,
        enterpriseCurationActions.setIsLoading(true),
      ),
    ).toMatchObject({ isLoading: true });
  });

  it('should set enterprise curation', () => {
    const enterpriseCuration = { uuid: 'fake-uuid' };
    expect(
      enterpriseCurationReducer(
        initialState,
        enterpriseCurationActions.setEnterpriseCuration(enterpriseCuration),
      ),
    ).toMatchObject({ enterpriseCuration });
  });

  it('should set enterprise highlighted contents', () => {
    const enterpriseHighlightedSets = [{
      uuid: 'test-uuid',
      isPublished: true,
      highlightedContent: [
        {
          uuid: 'test-content-uuid',
          contentKey: 'test-content-key',
          courseRunStatuses: [
            'archived',
          ],
        },
      ],
    }];
    expect(
      enterpriseCurationReducer(
        initialState,
        enterpriseCurationActions.setEnterpriseHighlightedSets(enterpriseHighlightedSets),
      ),
    ).toMatchObject({ enterpriseHighlightedSets });
  });

  it('should set isNewArchivedContent ', () => {
    const enterpriseHighlightedSets = [{
      uuid: 'test-uuid',
      isPublished: true,
      highlightedContent: [
        {
          uuid: 'test-content-uuid',
          contentKey: 'test-content-key',
          courseRunStatuses: [
            'archived',
          ],
        },
      ],
    }];
    expect(
      enterpriseCurationReducer(
        initialState,
        enterpriseCurationActions.setIsNewArchivedContent(enterpriseHighlightedSets),
      ),
    ).toMatchObject({ isNewArchivedContent: true });
  });

  it('should set fetch error', () => {
    const fetchError = new Error('oh noes!');
    expect(
      enterpriseCurationReducer(
        initialState,
        enterpriseCurationActions.setFetchError(fetchError),
      ),
    ).toMatchObject({ fetchError });
  });

  it('should set toast text for highlight set', () => {
    const highlightSet = {
      uuid: highlightSetUUID,
      title: 'Hello World!',
    };
    const initialStateWithHighlights = {
      ...initialState,
      enterpriseCuration: {
        highlightSets: [highlightSet],
      },
    };
    expect(
      enterpriseCurationReducer(
        initialStateWithHighlights,
        enterpriseCurationActions.setHighlightSetToast(highlightSetUUID),
      ),
    ).toMatchObject({ enterpriseCuration: { toastText: 'Hello World!' } });
  });

  it('should set general toast text for highlights', () => {
    const highlightSet = { uuid: highlightSetUUID };
    const highlightMessage = 'Hello World!';
    const initialStateWithHighlights = {
      ...initialState,
      enterpriseCuration: {
        highlightSets: [highlightSet],
      },
    };
    expect(
      enterpriseCurationReducer(
        initialStateWithHighlights,
        enterpriseCurationActions.setHighlightToast(highlightMessage),
      ),
    ).toMatchObject({ enterpriseCuration: { toastText: highlightMessage } });
  });

  it('should delete highlight set', () => {
    const highlightSet = { uuid: highlightSetUUID };
    const initialStateWithHighlights = {
      ...initialState,
      enterpriseCuration: {
        highlightSets: [highlightSet],
      },
    };
    expect(
      enterpriseCurationReducer(
        initialStateWithHighlights,
        enterpriseCurationActions.deleteHighlightSet(highlightSetUUID),
      ),
    ).toMatchObject({ enterpriseCuration: { highlightSets: [] } });
  });

  it('should add highlight set', () => {
    const highlightSet = { uuid: highlightSetUUID };
    const initialStateWithoutHighlights = {
      ...initialState,
      enterpriseCuration: {
        highlightSets: [],
      },
    };
    expect(
      enterpriseCurationReducer(
        initialStateWithoutHighlights,
        enterpriseCurationActions.addHighlightSet(highlightSet),
      ),
    ).toMatchObject({ enterpriseCuration: { highlightSets: [highlightSet] } });
  });

  it('should handle missing enterpriseCuration when adding/deleting a highlight set', () => {
    const highlightSet = { uuid: highlightSetUUID };
    expect(
      enterpriseCurationReducer(
        initialState,
        enterpriseCurationActions.addHighlightSet(highlightSet),
      ),
    ).toMatchObject({ enterpriseCuration: { highlightSets: [highlightSet] } });

    expect(
      enterpriseCurationReducer(
        initialState,
        enterpriseCurationActions.deleteHighlightSet(highlightSet.uuid),
      ),
    ).toMatchObject({ enterpriseCuration: { highlightSets: [] } });
  });

  it('should handle unknown action type', () => {
    const invalidActionType = 'invalid';
    enterpriseCurationReducer(initialState, { type: invalidActionType });
    expect(logError).toHaveBeenCalledWith(`enterpriseCurationReducer received an unexpected action type: ${invalidActionType}`);
  });
});
