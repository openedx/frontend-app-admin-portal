import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { camelCaseObject } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import { TEST_COURSE_HIGHLIGHTS_DATA } from '../data/constants';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import ContentHighlightsCardItemsContainer from '../ContentHighlightsCardItemsContainer';
import { features } from '../../../config';

const mockStore = configureMockStore([thunk]);

jest.mock('../../../data/services/EnterpriseCatalogApiService');
jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const testHighlightSet = camelCaseObject(TEST_COURSE_HIGHLIGHTS_DATA)[0]?.highlightedContent;
const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise',
  },
};

const ContentHighlightsCardItemsContainerWrapper = (props) => (
  <IntlProvider locale="en">
    <Provider store={mockStore(initialState)}>
      <ContentHighlightsCardItemsContainer {...props} />
    </Provider>
  </IntlProvider>
);

describe('<ContentHighlightsCardItemsContainer />', () => {
  const getDeleteHighlightBtn = () => {
    const deleteBtn = screen.getByText('Delete archived courses');
    return deleteBtn;
  };

  const clickDeleteHighlightBtn = () => {
    const deleteBtn = getDeleteHighlightBtn();
    userEvent.click(deleteBtn);
    expect(screen.getByText('Delete archived courses?')).toBeInTheDocument();
  };

  beforeEach(() => {
    features.HIGHLIGHTS_ARCHIVE_MESSAGING = true;
    jest.resetAllMocks();
  });

  it('has delete archived courses button', () => {
    renderWithRouter(<ContentHighlightsCardItemsContainerWrapper
      isLoading={false}
      highlightedContent={testHighlightSet}
    />);
    const deleteBtn = getDeleteHighlightBtn();
    expect(deleteBtn).toBeInTheDocument();
  });

  it('clicking delete courses button opens confirmation modal', () => {
    renderWithRouter(<ContentHighlightsCardItemsContainerWrapper
      isLoading={false}
      highlightedContent={testHighlightSet}
    />);
    clickDeleteHighlightBtn();
  });

  it('cancelling confirmation modal closes modal', () => {
    renderWithRouter(<ContentHighlightsCardItemsContainerWrapper
      isLoading={false}
      highlightedContent={testHighlightSet}
    />);
    clickDeleteHighlightBtn();
    userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Delete archived courses?')).not.toBeInTheDocument();
  });

  it('confirming deletion in confirmation modal deletes via API', async () => {
    EnterpriseCatalogApiService.deleteHighlightSetContent.mockResolvedValueOnce({ status: 201 });

    renderWithRouter(<ContentHighlightsCardItemsContainerWrapper
      isLoading={false}
      highlightedContent={testHighlightSet}
    />);
    clickDeleteHighlightBtn();
    userEvent.click(screen.getByTestId('delete-archived-button'));

    await waitFor(() => {
      expect(EnterpriseCatalogApiService.deleteHighlightSetContent).toHaveBeenCalledTimes(1);
    });
  });

  it('confirming deletion in confirmation modal handles error via API', async () => {
    EnterpriseCatalogApiService.deleteHighlightSetContent.mockRejectedValueOnce(new Error('oops all berries!'));
    renderWithRouter(<ContentHighlightsCardItemsContainerWrapper
      isLoading={false}
      highlightedContent={testHighlightSet}
    />);
    clickDeleteHighlightBtn();
    userEvent.click(screen.getByTestId('delete-archived-button'));
    expect(screen.getByText('Deleting courses...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Something went wrong')).toBeInTheDocument();
    });
    const alertDismissBtn = screen.getByText('Dismiss');
    expect(alertDismissBtn).toBeInTheDocument();
    userEvent.click(alertDismissBtn);
    await waitFor(() => {
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });
});
