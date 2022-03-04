import React, { useCallback, useState, useMemo } from 'react';
import SubsidyRequestManagementTable from '../../components/SubsidyRequestManagementTable';

const CouponCodeRequests = () => {
  const [codeRequests, setCodeRequests] = useState({
    requests: [],
    pageCount: 0,
    itemCount: 0,
  });
  /* eslint-disable no-unused-vars */
  const [codeRequestsOverview, setCodeRequestsOverview] = useState();
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isLoadingRequestsOverview, setIsLoadingRequestsOverview] = useState(false);
  /* eslint-enable no-unused-vars */

  const isLoading = isLoadingRequests || isLoadingRequestsOverview;

  // TODO: fetch requests overview data for table filters once overview endpoint PR is merged
  // and remove hardcoded data.
  // See https://github.com/edx/enterprise-access/pull/24 for more details.

  // useEffect(
  //   () => {
  //     const fetchOverview = async () => {
  //       setIsLoadingRequestsOverview(true);
  //       try {
  //         const response = await EnterpriseAccessApiService.getCodeRequestOverview(enterpriseId);
  //         const data = camelCaseObject(response.data);
  //         console.log('fetchOverview', data);
  //         // setCodeRequests({
  //         //   requests,
  //         //   pageCount: data.numPages,
  //         //   itemCount: data.count,
  //         // });
  //       } catch (err) {
  //         logError(err);
  //       } finally {
  //         setIsLoadingRequestsOverview(false);
  //       }
  //     };
  //     fetchOverview();
  //   },
  //   [],
  // );
  const overviewData = useMemo(
    () => ([
      {
        name: 'requested',
        number: 0,
        value: 'requested',
      },
      {
        name: 'declined',
        number: 0,
        value: 'declined',
      },
    ]),
    [],
  );

  const transformRequests = requests => requests.map((request) => ({
    uuid: request.uuid,
    emailAddress: String(request.lmsUserId), // TODO: we need the requesters' email here
    courseName: request.courseName || 'Course Name', // TODO: requests are missing course name
    courseId: request.courseId,
    requestDate: request.created,
    requestStatus: request.state,
  }));

  /**
   * Fetches license requests data from the API on initial component mount, and
   * pagination/filter/sort changes.
   *
   * @param {Object} args See Paragon documentation on the args passed to the
   * callback fn of `fetchData`.
   */
  const handleFetchData = useCallback(
    (args) => {
      const fetchRequests = async () => {
        setIsLoadingRequests(true);
        try {
          const options = {
            page: args.pageIndex + 1,
            page_size: PAGE_SIZE,
          };
          const response = await EnterpriseAccessApiService.getLicenseRequests(enterpriseId, options);
          const data = camelCaseObject(response.data);
          const requests = transformRequests(data.results);
          setLicenseRequests({
            requests,
            pageCount: data.numPages,
            itemCount: data.count,
          });
        } catch (err) {
          logError(err);
        } finally {
          setIsLoadingRequests(false);
        }
      };
      fetchRequests();
    },
    [],
  );

  const handleApprove = (row) => console.log('approve', row);
  const handleDecline = (row) => console.log('decline', row);

  return (
    <SubsidyRequestManagementTable
      data={data}
      fetchData={handleFetchData}
      requestStatusFilterChoices={overviewData}
      onApprove={handleApprove}
      onDecline={handleDecline}
    />
  );
};

export default CouponCodeRequests;
