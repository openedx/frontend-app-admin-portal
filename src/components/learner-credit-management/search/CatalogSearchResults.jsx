import React, { useContext, useEffect, useMemo } from 'react';
import { connectStateResults } from 'react-instantsearch-dom';
import PropTypes from 'prop-types';

import { SearchPagination, SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import {
  Alert, CardView, DataTable, Skeleton, TextFilter
} from '@edx/paragon';

import CourseCard from '../cards/CourseCard';

const ERROR_MESSAGE = 'An error occurred while retrieving data';

const SKELETON_DATA_TESTID = 'enterprise-catalog-skeleton';

export const BaseCatalogSearchResults = ({
  searchResults,
  searchState,
  // algolia recommends this prop instead of searching
  isSearchStalled,
  paginationComponent: SearchPagination,
  error,
  isSearchStalled,
  paginationComponent: SearchPagination,
  searchResults,
  searchState,
  setNoContent,
}) => {
  const searchClient = algoliasearch(configuration.ALGOLIA.APP_ID, configuration.ALGOLIA.SEARCH_API_KEY);
  const [isProgramType, setIsProgramType] = useState();
  const [isCourseType, setIsCourseType] = useState();
  const [isExecEdType, setIsExecEdType] = useState();

  useEffect(() => {
    setIsProgramType(contentType === CONTENT_TYPE_PROGRAM);
    setIsCourseType(contentType === CONTENT_TYPE_COURSE);
    setIsExecEdType(contentType === EXEC_ED_TITLE);
  }, [contentType]);

  const TABLE_HEADERS = useMemo(
    () => ({
      courseName: intl.formatMessage(
        messages['catalogSearchResults.table.courseName'],
      ),
      partner: intl.formatMessage(
        messages['catalogSearchResults.table.partner'],
      ),
      price: intl.formatMessage(messages['catalogSearchResults.table.price']),
      availability: intl.formatMessage(
        messages['catalogSearchResults.table.availability'],
      ),
      catalogs: intl.formatMessage(
        messages['catalogSearchResults.table.catalogs'],
      ),
      programName: intl.formatMessage(
        messages['catalogSearchResults.table.programName'],
      ),
      numCourses: intl.formatMessage(
        messages['catalogSearchResults.table.numCourses'],
      ),
      programType: intl.formatMessage(
        messages['catalogSearchResults.table.programType'],
      ),
    }),
    [intl],
  );

  const { refinements, dispatch } = useContext(SearchContext);
  const nbHits = useNbHitsFromSearchResults(searchResults);
  const linkText = `See all (${nbHits}) >`;

  const [setSelectedCourse] = useSelectedCourse();

  const [cardView, setCardView] = useState(true);

  const cardClicked = useCallback(
    (card) => {
      if (isProgramType) {
        setSelectedCourse(mapAlgoliaObjectToProgram(card));
      } else if (isExecEdType) {
        setSelectedCourse(mapAlgoliaObjectToExecEd(card, intl, messages));
      } else {
        setSelectedCourse(mapAlgoliaObjectToCourse(card, intl, messages));
      }
    },
    [intl, isProgramType, setSelectedCourse, isExecEdType],
  );

  const refinementClick = () => {
    if (isCourseType) {
      dispatch(
        setRefinementAction(LEARNING_TYPE_REFINEMENT, [CONTENT_TYPE_COURSE]),
      );
    } else if (isExecEdType) {
      dispatch(
        setRefinementAction(LEARNING_TYPE_REFINEMENT, [
          EXEC_ED_TITLE,
        ]),
      );
    } else {
      dispatch(
        setRefinementAction(LEARNING_TYPE_REFINEMENT, [CONTENT_TYPE_PROGRAM]),
      );
    }
  };

  const renderCardComponent = (props) => {
    if (contentType === CONTENT_TYPE_COURSE) {
      return <CourseCard {...props} learningType={contentType} onClick={cardClicked} />;
    }
    if (contentType === EXEC_ED_TITLE) {
      return <CourseCard {...props} learningType={contentType} onClick={cardClicked} />;
    }
    return null;
    // return <ProgramCard {...props} onClick={cardClicked} />;
  };

  const availabilityColumn = {
    id: 'availability-column',
    Header: TABLE_HEADERS.availability,
    accessor: 'advertised_course_run',
    // Cell: ({ row }) => formatDate(row.values.advertised_course_run),
    Cell: ({ row }) => row.values.advertised_course_run,

  };

  // NOTE: Cell is not explicity supported in DataTable, which leads to lint errors regarding {row}. However, we needed
  // to use the accessor functionality instead of just adding in additionalColumns like the Paragon documentation.
  const courseColumns = useMemo(
    () => [
      {
        Header: 'Course name',
        accessor: 'title',
      },
      {
        Header: 'Partner',
        accessor: 'partners[0].name',
      },
      {
        Header: 'A la carte course price',
        accessor: 'first_enrollable_paid_seat_price',
      },
      {
        Header: 'Associated catalogs',
        accessor: 'enterprise_catalog_query_titles',
      },
    ],
    [],
  );

  const tableData = useMemo(
    () => searchResults?.hits || [],
    [searchResults?.hits],
  );
  console.log(tableData)
  const renderCardComponent = (props) => <CourseCard {...props} onClick={null} />;
  const { refinements } = useContext(SearchContext);

  const page = refinements.page || (searchState ? searchState.page : 0);

  useEffect(() => {
    setNoContent(searchResults === null || searchResults?.nbHits === 0);
  }, [searchResults, setNoContent]);

  if (isSearchStalled) {
    return (
      <div data-testid={SKELETON_DATA_TESTID}>
        <Skeleton className="m-1 loading-skeleton" height={25} count={5} />
      </div>
    );
  }
  if (error) {
    return (
      <Alert className="mt-2" variant="warning">
        <FormattedMessage
          id="catalogs.catalogSearchResults.error"
          defaultMessage="{message}: {fullError}"
          description="Error message displayed when results cannot be returned."
          values={{ message: ERROR_MESSAGE, fullError: error.message }}
        />
      </Alert>
    );
  }

  return (
    <DataTable
      columns={courseColumns}
      data={tableData}
      defaultColumnValues={{ Filter: TextFilter }}
      initialState={{
        pageSize: 15,
        pageIndex: 0,
      }}
      isPaginated
      isSortable
      itemCount={searchResults?.nbHits || 0}
      manualFilters
      manualPagination
      manualSortBy
      pageCount={searchResults?.nbPages || 0}
      pageSize={searchResults?.hitsPerPage || 0}
    >
      <DataTable.TableControlBar />
      <CardView
        columnSizes={{
          xs: 12,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12,
        }}
        CardComponent={(props) => renderCardComponent(props)}
      />
      <DataTable.EmptyTable content="No results found" />
      <DataTable.TableFooter className="justify-content-center">
        <SearchPagination defaultRefinement={page} />
      </DataTable.TableFooter>
    </DataTable>
  );
};

BaseCatalogSearchResults.defaultProps = {
  courseType: null,
  error: null,
  paginationComponent: SearchPagination,
  preview: false,
  setNoContent: () => { },
  courseType: null,
};

BaseCatalogSearchResults.propTypes = {
  contentType: PropTypes.string.isRequired,
  courseType: PropTypes.string,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  isSearchStalled: PropTypes.bool.isRequired,
  paginationComponent: PropTypes.func,
  preview: PropTypes.bool,
  row: PropTypes.string,
  searchResults: PropTypes.shape({
    _state: PropTypes.shape({
      disjunctiveFacetsRefinements: PropTypes.shape({}),
    }),
    disjunctiveFacetsRefinements: PropTypes.arrayOf(PropTypes.shape({})),
    hits: PropTypes.arrayOf(PropTypes.shape({})),
    hitsPerPage: PropTypes.number,
    nbHits: PropTypes.number,
    nbPages: PropTypes.number,
    page: PropTypes.number,
  }),
  searchState: PropTypes.shape({
    page: PropTypes.number,
  }).isRequired,
  paginationComponent: PropTypes.func,
  // eslint-disable-next-line react/no-unused-prop-types
  row: PropTypes.string,
  contentType: PropTypes.string.isRequired,
  preview: PropTypes.bool,
  setNoContent: PropTypes.func,
};

export default connectStateResults(injectIntl(BaseCatalogSearchResults));
