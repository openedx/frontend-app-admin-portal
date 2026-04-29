import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {
  Alert, DataTable, Icon,
} from '@openedx/paragon';
import { Check, Error as ErrorIcon } from '@openedx/paragon/icons';

import { isValidEmail } from '../../utils';
import RemindButton from '../RemindButton';
import RevokeButton from '../RevokeButton';
import EcommerceApiService from '../../data/services/EcommerceApiService';

const DEFAULT_EMPTY_VALUE = '-';

const getFormattedDate = (date) => {
  if (!date) {
    return null;
  }
  return dayjs(date).format('MMMM D, YYYY');
};

const transformSearchResults = results => results.map(({
  coupon_id: couponId,
  coupon_name: couponName,
  course_key: courseKey,
  course_title: courseTitle,
  redeemed_date: redemptionDate,
  is_assigned: isAssigned,
  user_email: assignedTo,
  ...rest
}) => ({
  couponId,
  couponName,
  courseKey,
  courseTitle,
  assignedTo,
  redemptionDate: getFormattedDate(redemptionDate),
  isRedeemed: !!redemptionDate,
  isAssigned: !!isAssigned,
  ...rest,
}));

const searchParameter = (searchQuery) => {
  if (isValidEmail(searchQuery) === undefined) { return 'user_email'; }
  return 'voucher_code';
};

const CodeSearchResultsTable = ({
  searchQuery,
  shouldRefreshTable,
  onRemindSuccess,
  onRevokeSuccess,
}) => {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  // currentPage is driven by DataTable's fetchData callback (0-based)
  const [currentPage, setCurrentPage] = useState(0);

  const isEmailSearch = isValidEmail(searchQuery) === undefined;

  // Fetch data whenever searchQuery, shouldRefreshTable, or currentPage changes.
  // Using a dedicated useEffect keeps this decoupled from DataTable's own
  // pagination-state updates and avoids infinite-fetch loops.
  useEffect(() => {
    let cancelled = false;
    const doFetch = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await EcommerceApiService.fetchCodeSearchResults({
          [searchParameter(searchQuery)]: searchQuery,
          page: currentPage + 1, // API uses 1-based pagination
        });
        if (!cancelled) {
          const { results = [], num_pages: numPages = 0, count } = response.data;
          const transformed = transformSearchResults(results);
          setTableData(transformed);
          setPageCount(numPages);
          setItemCount(count !== undefined ? count : transformed.length);
        }
      } catch (err) {
        if (!cancelled) {
          setFetchError(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    doFetch();
    return () => { cancelled = true; };
  }, [searchQuery, shouldRefreshTable, currentPage]);

  // DataTable calls this when the user changes pages, sort, or filters.
  // We only store the new page index; the useEffect above handles the fetch.
  const handleFetchData = useCallback(({ pageIndex }) => {
    setCurrentPage(pageIndex ?? 0);
  }, []);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        Header: 'Coupon Batch',
        accessor: 'couponName',
      },
      {
        Header: 'Code',
        accessor: 'code',
      },
      {
        Header: 'Redeemed',
        accessor: 'isRedeemed',
        /* eslint-disable react/prop-types, react/no-unstable-nested-components */
        Cell: ({ value }) => (value ? (
          <Icon className="text-primary" src={Check} screenReaderText="has been redeemed" />
        ) : DEFAULT_EMPTY_VALUE),
        /* eslint-enable react/prop-types, react/no-unstable-nested-components */
        disableSortBy: true,
      },
      {
        Header: 'Redemption Date',
        accessor: 'redemptionDate',
        /* eslint-disable-next-line react/prop-types, react/no-unstable-nested-components */
        Cell: ({ value }) => value || DEFAULT_EMPTY_VALUE,
        disableSortBy: true,
      },
      {
        Header: 'Course Title',
        accessor: 'courseTitle',
        /* eslint-disable-next-line react/prop-types, react/no-unstable-nested-components */
        Cell: ({ value }) => value || DEFAULT_EMPTY_VALUE,
      },
    ];

    if (!isEmailSearch) {
      // Insert "Assigned To" before "Course Title" for code (non-email) searches
      baseColumns.splice(4, 0, {
        Header: 'Assigned To',
        accessor: 'assignedTo',
        /* eslint-disable-next-line react/prop-types, react/no-unstable-nested-components */
        Cell: ({ value }) => value || DEFAULT_EMPTY_VALUE,
      });
    }

    return [
      ...baseColumns,
      {
        Header: 'Actions',
        accessor: 'actions',
        /* eslint-disable react/prop-types, react/no-unstable-nested-components */
        Cell: ({ row }) => {
          const {
            isRedeemed, isAssigned, couponId, couponName, assignedTo, code,
          } = row.original;
          if (!isRedeemed && isAssigned) {
            return (
              <>
                <RemindButton
                  couponId={couponId}
                  couponTitle={couponName}
                  data={{ email: assignedTo, code }}
                  onSuccess={onRemindSuccess}
                />
                {' | '}
                <RevokeButton
                  couponId={couponId}
                  couponTitle={couponName}
                  data={{ assigned_to: assignedTo, code }}
                  onSuccess={onRevokeSuccess}
                />
              </>
            );
          }
          return DEFAULT_EMPTY_VALUE;
        },
        /* eslint-enable react/prop-types, react/no-unstable-nested-components */
        disableSortBy: true,
      },
    ];
  }, [isEmailSearch, onRemindSuccess, onRevokeSuccess]);

  if (fetchError) {
    return (
      <Alert variant="danger" icon={ErrorIcon}>
        <Alert.Heading>Unable to load data</Alert.Heading>
        <p>
          Try refreshing your screen
          {' '}
          {fetchError.message}
        </p>
      </Alert>
    );
  }

  return (
    <DataTable
      key={`code-search-results-${searchQuery}-${shouldRefreshTable}`}
      isPaginated
      manualPagination
      isSortable
      isLoading={isLoading}
      columns={columns}
      data={tableData}
      itemCount={itemCount}
      pageCount={pageCount}
      fetchData={handleFetchData}
      className="code-search-results-table"
    >
      <DataTable.Table />
      <DataTable.EmptyTable content="There are no results." />
      <DataTable.TableFooter />
    </DataTable>
  );
};

CodeSearchResultsTable.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  shouldRefreshTable: PropTypes.bool.isRequired,
  onRemindSuccess: PropTypes.func.isRequired,
  onRevokeSuccess: PropTypes.func.isRequired,
};

export default CodeSearchResultsTable;
