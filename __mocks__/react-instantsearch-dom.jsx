/* eslint-disable object-curly-newline */
/* eslint-disable react/prop-types */
// eslint-disable-next-line import/no-import-module-exports
import React from 'react';

const MockReactInstantSearch = jest.genMockFromModule(
  'react-instantsearch-dom',
);

const advertisedCourseRun = {
  start: '2020-09-09T04:00:00Z',
  key: 'course-v1:edX+Bee101+3T2020',
};

const fakeHits = [
  { objectID: '1', title: 'bla', advertised_course_run: advertisedCourseRun, key: 'Bees101' },
  { objectID: '2', title: 'blp', advertised_course_run: advertisedCourseRun, key: 'Wasps200' },
];

MockReactInstantSearch.connectStateResults = Component => function (props) {
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

MockReactInstantSearch.connectPagination = Component => function (props) {
  return <Component nbPages={2} maxPagesDisplayed={2} {...props} />;
};

MockReactInstantSearch.InstantSearch = function ({ children }) {
  return <div>{children}</div>;
};

MockReactInstantSearch.connectCurrentRefinements = Component => function (props) {
  return <Component items={[]} {...props} />;
};

MockReactInstantSearch.connectRefinementList = Component => function (props) {
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

MockReactInstantSearch.connectSearchBox = Component => function (props) {
  return <Component {...props} />;
};

MockReactInstantSearch.connectPagination = Component => function (props) {
  return <Component nbPages={1} {...props} />;
};

MockReactInstantSearch.InstantSearch = function ({ children }) {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};
MockReactInstantSearch.Configure = function () {
  return <div>CONFIGURED</div>;
};

module.exports = MockReactInstantSearch;
