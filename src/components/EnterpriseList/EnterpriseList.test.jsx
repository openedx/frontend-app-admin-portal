import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Redirect } from 'react-router-dom';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import EnterpriseList, { TITLE } from './index';
import mockEnterpriseList from './EnterpriseList.mocks';
import SearchBar from '../SearchBar';
import TableContainer from '../../containers/TableContainer';
import LoadingMessage from '../LoadingMessage';

import LmsApiServices from '../../data/services/LmsApiService';

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
      mount(
        <EnterpriseListWrapper
          clearPortalConfiguration={mockClearPortalConfiguration}
        />,
      );
      expect(mockClearPortalConfiguration).toHaveBeenCalled();
    });

    it('with enterprises data', () => {
      wrapper = mount(
        <EnterpriseListWrapper
          enterpriseList={mockEnterpriseList}
          location={{
            search: '',
            path: '/',
          }}
        />,
      );
      const table = wrapper.find(TableContainer);
      expect(table.length).toEqual(1);
    });

    it('with empty enterprises data', () => {
      wrapper = mount(
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
      expect(wrapper.find('h1').text()).toEqual(TITLE);
      expect(wrapper.find(TableContainer)).toHaveLength(1);
      expect(wrapper.find(SearchBar)).toHaveLength(1);
    });

    it('with search query and empty enterprises data', () => {
      wrapper = mount(
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
      expect(wrapper.find(SearchBar).props().value).toEqual('enterprise name');
    });

    it('with error state', () => {
      const err = 'Network Error';
      wrapper = mount(
        <EnterpriseListWrapper error={Error('Network Error')} />,
      );
      expect(wrapper.text()).toContain(err);
    });

    it('with loading state', () => {
      wrapper = mount(
        <EnterpriseListWrapper loading enterpriseList={null} />,
      );

      expect(wrapper.find(LoadingMessage)).toHaveLength(1);
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

      wrapper = mount((
        <MemoryRouter initialEntries={['/test']}>
          <Provider store={store}>
            <EnterpriseList
              enterpriseList={oneEnterpriseListData}
              searchEnterpriseList={() => {}}
              clearPortalConfiguration={() => {}}
            />
          </Provider>
        </MemoryRouter>
      ));
      const expectedRedirect = <Redirect to="/enterprise-99/admin/learners" />;
      expect(wrapper.containsMatchingElement(expectedRedirect)).toEqual(true);
    });
  });

  describe('enterprise list search', () => {
    const submitSearch = (searchQuery) => {
      wrapper.find('SearchBar').find('input[type="text"]').simulate('change', { target: { value: searchQuery } });
      expect(wrapper.find('SearchBar').find('input[type="text"]').prop('value')).toEqual(searchQuery);
      wrapper.find('SearchBar').find('form').simulate('submit');
    };

    it('fetchEnterpriseList called with no search property initially', () => {
      jest.spyOn(LmsApiServices, 'fetchEnterpriseList');
      wrapper = mount(
        <EnterpriseListWrapper
          location={{
            path: '/',
          }}
        />,
      );
      expect(LmsApiServices.fetchEnterpriseList).toHaveBeenCalledWith({ page_size: 50, page: 1 });
    });

    it('search querystring changes onSearch', () => {
      wrapper = mount((
        <EnterpriseListWrapper
          enterprises={mockEnterpriseList}
        />
      ));

      submitSearch('Enterprise 1');
      const queryParams = new URLSearchParams(window.location.search);
      expect(queryParams.get('search')).toEqual('Enterprise 1');
    });

    it('search querystring clears onClear', () => {
      wrapper = mount((
        <EnterpriseListWrapper
          enterprises={mockEnterpriseList}
        />
      ));
      submitSearch('Enterprise 1');
      wrapper.find('SearchBar').find('button[type="reset"]').simulate('reset');
      const queryParams = new URLSearchParams(window.location.search);
      expect(queryParams.has('search')).toBeFalsy();
    });
  });
});
