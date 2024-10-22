import { CardView, Container, DataTable, TextFilter } from "@openedx/paragon";
import { useIntl } from "@edx/frontend-platform/i18n";

import OrgMemberCard from "./OrgMemberCard";

const PeopleManagementTable = () => {
  const pageSize = 10;
  const intl = useIntl();
  // const tableColumns = [
  //   {
  //     Header: "Name",
  //     accessor: "name",
  //   },
  //   {
  //     Header: "Email",
  //     accessor: "email",
  //   },
  //   {
  //     Header: "Joined org",
  //     accessor: "joinedOrg",
  //   },
  //   {
  //     Header: "Enrollments",
  //     accessor: "enrollments",
  //   },
  // ];

  return (
    <DataTable
      className="pt-4 mt-4"
      isFilterable
      isSortable
      defaultColumnValues={{ Filter: TextFilter }}
      // isLoading={isFetching}
      isPaginated
      manualPagination
      initialState={{
        pageSize,
        pageIndex: 0,
      }}
      // itemCount={paginatedData.itemCount}
      // pageCount={paginatedData.pageCount}
      // fetchData={fetchData}
      // data={paginatedData.data}
      data={[
        {
          name: "April Ludgate",
          email: "aprilludgate@pawnee.gov",
          joinedOrg: "Jan 21, 2021",
          enrollments: 3,
        },
        {
          name: "Ben Wyatt",
          email: "benwyatt@pawnee.gov",
          joinedOrg: "Oct 31, 2022",
          enrollments: 1,
        },
      ]}
      columns={tableColumns}>
      <DataTable.TableControlBar />
      <CardView
        className="d-block"
        CardComponent={OrgMemberCard}
        columnSizes={{ xs: 12 }}
      />
      {/* <DataTable.Table /> */}
      {/* <DataTable.EmptyTable
      content={intl.formatMessage({
        id: 'peopleManagement.dataTable.empty',
        defaultMessage: 'No results found.',
        description: 'Message displayed when the table has no data.',
      })}
    /> */}
      <DataTable.TableFooter />
    </DataTable>
  );
};

export default PeopleManagementTable;
