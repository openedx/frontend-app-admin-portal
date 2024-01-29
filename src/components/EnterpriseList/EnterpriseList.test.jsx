import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, mockNavigate } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import EnterpriseList, { TITLE } from './index';
import mockEnterpriseList from './EnterpriseList.mocks';

import LmsApiServices from '../../data/services/LmsApiService';
import { renderWithRouter } from '../test/testUtils';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const mockNavigation = jest.fn();

  // eslint-disable-next-line react/prop-types
  const Navigate = ({ to }) => {
    mockNavigation(to);
    return <div />;
  };

  return {
    ...jest.requireActual('react-router-dom'),
    Navigate,
    mockNavigate: mockNavigation,
    useNavigate: () => mockedNavigate,
  };
});

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  paginateTable: () => {},
  sortTable: () => {},
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
  },
  table: {
    enrollments: {
      data: {
        results: [],
        current_page: 1,
        num_pages: 1,
      },
      ordering: null,
      loading: false,
      error: null,
    },
  },
});

const EnterpriseListWrapper = ({ initialEntries, ...rest }) => (
  <MemoryRouter initialEntries={initialEntries}>
    <Provider store={store}>
      <IntlProvider locale="en">
        <EnterpriseList
          enterpriseList={{
            results: [],
          }}
          searchEnterpriseList={() => {}}
          clearPortalConfiguration={() => {}}
          {...rest}
        />
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

describe('<EnterpriseList />', () => {
  let wrapper;

  describe('renders correctly', () => {
    it('call clearPortalConfiguration prop', () => {
      const mockClearPortalConfiguration = jest.fn();
      render(
        <EnterpriseListWrapper
          clearPortalConfiguration={mockClearPortalConfiguration}
        />,
      );
      expect(mockClearPortalConfiguration).toHaveBeenCalled();
    });

    it('with enterprises data', () => {
      wrapper = render(
        <EnterpriseListWrapper
          enterpriseList={mockEnterpriseList}
          location={{
            search: '',
            path: '/',
          }}
        />,
      );
      expect(screen.getAllByTestId('table-container-wrapper')).toHaveLength(1);
    });

    it('with empty enterprises data', () => {
      wrapper = render(
        <EnterpriseListWrapper
          enterpriseList={{
            ...mockEnterpriseList,
            count: 0,
            results: [],
          }}
          location={{
            search: '',
            path: '/',
          }}
        />,
      );
      expect(wrapper.container.querySelector('h1').textContent).toEqual(TITLE);
      expect(screen.getAllByTestId('table-container-wrapper')).toHaveLength(1);
      expect(screen.getAllByTestId('search-bar-wrapper')).toHaveLength(1);
    });

    it('with search query and empty enterprises data', () => {
      wrapper = render(
        <EnterpriseListWrapper
          initialEntries={['/?search=enterprise%20name']}
          enterpriseList={{
            ...mockEnterpriseList,
            count: 0,
            results: [],
          }}
          location={{
            search: '?search=enterprise%20name',
            path: '/',
          }}
        />,
      );
      expect(screen.getByDisplayValue('enterprise name')).toBeTruthy();
    });

    it('with error state', () => {
      const err = 'Network Error';
      wrapper = render(
        <EnterpriseListWrapper error={Error('Network Error')} />,
      );
      expect(screen.getByText(err)).toBeTruthy();
    });

    it('with loading state', () => {
      wrapper = render(
        <EnterpriseListWrapper loading enterpriseList={null} />,
      );

      expect(screen.getAllByTestId('loading-message')).toHaveLength(1);
    });

    it('redirects when there is only one enterprise', () => {
      const oneEnterpriseListData = {
        count: 1,
        current_page: 1,
        num_pages: 1,
        next: null,
        previous: null,
        results: [{
          uuid: 'ee5e6b3a-069a-4947-bb8d-d2dbc323396c',
          name: 'Enterprise 99',
          slug: 'enterprise-99',
        }],
        start: 0,
      };

      renderWithRouter((
        <Provider store={store}>
          <EnterpriseList
            enterpriseList={oneEnterpriseListData}
            searchEnterpriseList={() => {}}
            clearPortalConfiguration={() => {}}
          />
        </Provider>
      ));
      expect(mockNavigate).toHaveBeenCalledWith('/enterprise-99/admin/learners');
    });
  });

  describe('enterprise list search', () => {
    const submitSearch = (searchQuery) => {
      fireEvent.change(wrapper.container.querySelector('input[type="text"]'), { target: { value: searchQuery } });
      expect(wrapper.container.querySelector('input[type="text"]').value).toEqual(searchQuery);
      fireEvent.submit(wrapper.container.querySelector('form'));
    };

    it('fetchEnterpriseList called with no search property initially', () => {
      jest.spyOn(LmsApiServices, 'fetchEnterpriseList');
      wrapper = render(
        <EnterpriseListWrapper
          location={{
            path: '/',
          }}
        />,
      );
      expect(LmsApiServices.fetchEnterpriseList).toHaveBeenCalledWith({ page_size: 50, page: 1 });
    });

    it('search querystring changes onSearch', () => {
      wrapper = render((
        <EnterpriseListWrapper
          enterprises={mockEnterpriseList}
        />
      ));

      submitSearch('Enterprise 1');
      expect(mockedNavigate).toHaveBeenCalledWith({ pathname: '/', search: 'search=Enterprise+1' });
    });

    it('search querystring clears onClear', () => {
      wrapper = render((
        <EnterpriseListWrapper
          enterprises={mockEnterpriseList}
        />
      ));
      submitSearch('Enterprise 1');
      fireEvent.reset(wrapper.container.querySelector('button[type="reset"]'));
      const queryParams = new URLSearchParams(window.location.search);
      expect(queryParams.has('search')).toBeFalsy();
    });
  });
});
