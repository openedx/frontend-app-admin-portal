/* eslint-disable object-curly-newline */
/* eslint-disable react/prop-types */

const React = require('react');

const MockReactInstantSearch = jest.genMockFromModule(
  'react-instantsearch-dom',
);

// eslint-disable-next-line camelcase
const advertised_course_run = {
  start: '2020-09-09T04:00:00Z',
  key: 'course-v1:edX+Bee101+3T2020',
};

/* eslint-disable camelcase */
const fakeHits = [
  { objectID: '1', title: 'bla', advertised_course_run, key: 'Bees101' },
  { objectID: '2', title: 'blp', advertised_course_run, key: 'Wasps200' },
];
/* eslint-enable camelcase */

MockReactInstantSearch.connectStateResults = Component => function connectStateResults(props) {
  return (
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
};

MockReactInstantSearch.connectPagination = Component => function connectPagination(props) {
  return <Component nbPages={2} maxPagesDisplayed={2} {...props} />;
};

MockReactInstantSearch.InstantSearch = function InstantSearch({ children }) {
  return <div>{children}</div>;
};

MockReactInstantSearch.connectCurrentRefinements = Component => function connectCurrentRefinements(props) {
  return <Component items={[]} {...props} />;
};

MockReactInstantSearch.connectRefinementList = Component => function connectRefinementList(props) {
  return (
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
};

MockReactInstantSearch.connectSearchBox = Component => function connectSearchBox(props) {
  return <Component {...props} />;
};

MockReactInstantSearch.connectPagination = Component => function connectPagination(props) {
  return <Component nbPages={1} {...props} />;
};

MockReactInstantSearch.InstantSearch = function InstantSearch({ children }) {
  return (
    <div data-testid="algolia__InstantSearch">{children}</div>
  );
};
MockReactInstantSearch.Configure = function Configure() {
  return <div data-testid="algolia__Configure">CONFIGURED</div>;
};

module.exports = MockReactInstantSearch;
