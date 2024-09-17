/* eslint-disable object-curly-newline */
/* eslint-disable react/prop-types */

const React = require('react');
const dayjs = require('dayjs');

const MockReactInstantSearch = jest.genMockFromModule(
  'react-instantsearch-dom',
);

const mockCurrentStartDate = dayjs().add(3, 'months').toISOString();
const mockEndDate = dayjs().add(2, 'years').toISOString();
const mockEnrollByDate = dayjs().add(9, 'months').toISOString();
const mockEnrollByTimestamp = dayjs(mockEnrollByDate).unix();
const mockUpgradeDeadlineTimestamp = dayjs().add(3, 'months').unix();

const mockNormalizedData = {
  start_date: mockCurrentStartDate,
  end_date: mockEndDate,
  enroll_by_date: mockEnrollByDate,
};

/* eslint-disable camelcase */
const fakeHits = [
  {
    objectID: '1',
    aggregation_key: 'course:Bees101',
    title: 'bla',
    partners: [
      { name: 'edX' },
      { name: 'another_unused' },
    ],
    advertised_course_run: {
      key: 'course-v1:edx+Bees101+1010',
      start: mockCurrentStartDate,
      end: mockEndDate,
      enroll_by: mockEnrollByTimestamp,
      has_enroll_by: true,
      is_active: true,
      max_effort: 5,
      min_effort: 1,
      pacing_type: 'self_paced',
      weeks_to_complete: 8,
      upgrade_deadline: mockUpgradeDeadlineTimestamp,
      content_price: 100,
    },
    key: 'Bees101',
    normalized_metadata: mockNormalizedData,
    courseRuns: [
      {
        key: 'course-v1:edx+Bees101+1010',
        start: mockCurrentStartDate,
        end: mockEndDate,
        enroll_by: mockEnrollByTimestamp,
        has_enroll_by: true,
        is_active: true,
        max_effort: 5,
        min_effort: 1,
        pacing_type: 'self_paced',
        weeks_to_complete: 8,
        upgrade_deadline: mockUpgradeDeadlineTimestamp,
        content_price: 100,
      },
      {
        key: 'course-v1:edX+Bee101+3T2020',
        start: '2020-09-09T04:00:00Z',
        end: dayjs('2020-09-09T04:00:00Z').add(1, 'year').toISOString(),
        enroll_by: mockEnrollByTimestamp,
        has_enroll_by: true,
        is_active: true,
        max_effort: 5,
        min_effort: 1,
        pacing_type: 'self_paced',
        weeks_to_complete: 8,
        upgrade_deadline: mockUpgradeDeadlineTimestamp,
        content_price: 100,
      },
    ],
  },
  { objectID: '2',
    aggregation_key: 'course:Wasps200',
    title: 'blp',
    partners: [
      { name: 'edX' },
      { name: 'another_unused' },
    ],
    advertised_course_run: {
      key: 'course-v1:edx+Wasps200+1010T2024',
      start: mockCurrentStartDate,
      end: mockEndDate,
      enroll_by: mockEnrollByTimestamp,
      has_enroll_by: true,
      is_active: true,
      max_effort: 5,
      min_effort: 1,
      pacing_type: 'self_paced',
      weeks_to_complete: 8,
      upgrade_deadline: mockUpgradeDeadlineTimestamp,
      content_price: 100,
    },
    key: 'Wasps200',
    normalized_metadata: mockNormalizedData,
    courseRuns: [
      {
        key: 'course-v1:edx+Wasps200+1010T2024',
        start: '2022-10-09T04:00:00Z',
        end: dayjs('2022-10-09T04:00:00Z').add(1, 'year').toISOString(),
        enroll_by: mockEnrollByTimestamp,
        has_enroll_by: true,
        is_active: true,
        max_effort: 5,
        min_effort: 1,
        pacing_type: 'self_paced',
        weeks_to_complete: 8,
        upgrade_deadline: mockUpgradeDeadlineTimestamp,
        content_price: 100,
      },
      {
        key: 'course-v1:edX+Wasps200+3T2020',
        start: '2020-09-09T04:00:00Z',
        end: dayjs('2020-09-09T04:00:00Z').add(1, 'year').toISOString(),
        enroll_by: mockEnrollByTimestamp,
        has_enroll_by: true,
        is_active: true,
        max_effort: 5,
        min_effort: 1,
        pacing_type: 'self_paced',
        weeks_to_complete: 8,
        upgrade_deadline: mockUpgradeDeadlineTimestamp,
        content_price: 100,
      },
    ],
  },
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
