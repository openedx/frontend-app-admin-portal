import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import {
  DataTable, TextFilter, Container, Row, Col,
} from '@openedx/paragon';

import LmsApiService from '../../data/services/LmsApiService';

export const TITLE = 'Enterprise List';

const PAGE_SIZE = 50;

const EnterpriseList = ({ clearPortalConfiguration }) => {
  const [enterpriseList, setEnterpriseList] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    clearPortalConfiguration();
  }, [clearPortalConfiguration]);

  const fetchData = useCallback(
    async (datatableProps) => {
      const searchQuery = datatableProps.filters[0]?.value;
      try {
        const { data } = await LmsApiService.fetchEnterpriseList({
          page: datatableProps.pageIndex + 1,
          ...(searchQuery && { search: searchQuery }),
        });
        const result = camelCaseObject(data);
        setEnterpriseList(result);
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const debouncedFetchData = useMemo(() => debounce(
    fetchData,
    300,
  ), [fetchData]);

  const renderCustomerLink = ({ row }) => {
    const { name, slug, uuid } = row.original;
    return <Link key={uuid} to={`/${slug}/admin/learners`}>{name}</Link>;
  };

  return (
    <main role="main" style={{ flex: 1 }}>
      <Container className="my-4">
        <Row>
          <Col sm={12} md>
            <h1>{TITLE}</h1>
          </Col>
        </Row>
        <DataTable
          isPaginated
          manualPagination
          isSortable
          manualSortBy
          isFilterable
          manualFilters
          defaultColumnValues={{ Filter: TextFilter }}
          pageCount={enterpriseList.numPages || 0}
          isLoading={isLoading}
          initialState={{
            pageSize: PAGE_SIZE,
            pageIndex: 0,
          }}
          itemCount={enterpriseList.count}
          data={enterpriseList.results || []}
          fetchData={debouncedFetchData}
          columns={[
            {
              Header: 'Enterprise',
              accessor: 'name',
              Cell: (row) => renderCustomerLink(row),
              disableSortBy: true,
            },
          ]}
        />
      </Container>
    </main>
  );
};

EnterpriseList.propTypes = {
  clearPortalConfiguration: PropTypes.func.isRequired,
};

export default EnterpriseList;
