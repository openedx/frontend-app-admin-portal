/* eslint-disable object-curly-newline */
/* eslint-disable react/prop-types */
import React from 'react';

const MockReactInstantSearch = jest.genMockFromModule(
  'react-instantsearch-dom',
);

// eslint-disable-next-line camelcase
const advertised_course_run = {
  start: '2020-09-09T04:00:00Z',
  key: 'course-v1:edX+Bee101+3T2020',
};

const fakeHits = [
  { objectID: '1', title: 'bla', advertised_course_run, key: 'Bees101' },
  { objectID: '2', title: 'blp', advertised_course_run, key: 'Wasps200' },
];

MockReactInstantSearch.connectStateResults = Component => (props) => (
  <Component
    searchResults={{
      hits: fakeHits,
      hitsPerPage: 25,
      nbHits: 2,
      nbPages: 1,
      page: 1,
    }}
    isSearchStalled={false}
    searchState={{
      page: 1,
    }}
    {...props}
  />
);

MockReactInstantSearch.connectPagination = Component => (props) => (
  <Component nbPages={2} maxPagesDisplayed={2} {...props} />
);

MockReactInstantSearch.InstantSearch = ({ children }) => <div>{children}</div>;

MockReactInstantSearch.connectCurrentRefinements = Component => (props) => (
  <Component items={[]} {...props} />
);

MockReactInstantSearch.connectRefinementList = Component => (props) => (
  <Component
    attribute="subjects"
    currentRefinement={[]}
    items={[]}
    refinements={{}}
    title="Foo"
    searchForItems={() => {}}
    {...props}
  />
);

MockReactInstantSearch.connectSearchBox = Component => (props) => (
  <Component {...props} />
);

MockReactInstantSearch.connectPagination = Component => (props) => (
  <Component nbPages={1} {...props} />
);

MockReactInstantSearch.InstantSearch = ({ children }) => <>{children}</>;
MockReactInstantSearch.Configure = () => <div>CONFIGURED</div>;

module.exports = MockReactInstantSearch;
