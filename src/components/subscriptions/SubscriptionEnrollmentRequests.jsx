import React, { useMemo } from 'react';
import EnrollmentRequestManagementTable from '../EnrollmentRequestManagementTable';

const SubscriptionEnrollmentRequests = () => {
  const overviewData = useMemo(
    () => ([
      {
        name: 'requested',
        number: 2,
        value: 'requested',
      },
      {
        name: 'declined',
        number: 1,
        value: 'declined',
      },
    ]),
    [],
  );

  const data = useMemo(
    () => ([
      {
        emailAddress: 'erlich.bachman@piedpiper.com',
        courseName: 'Data Science: R Basics',
        courseKey: 'edX+DemoX',
        requestDate: '2018-12-03T21:39:24.395101Z',
        requestStatus: 'requested',
      },
      {
        emailAddress: 'richard.hendricks@piedpiper.com',
        courseName: 'Computing in Python I: Fundamentals and Procedural Programming',
        courseKey: 'edX+DemoX',
        requestDate: '2019-12-03T21:39:24.395101Z',
        requestStatus: 'requested',
      },
      {
        emailAddress: 'gilfoyle@piedpiper.com',
        courseName: 'Course Name',
        courseKey: 'edX+DemoX',
        requestDate: '2020-12-03T21:39:24.395101Z',
        requestStatus: 'declined',
      },
    ]),
    [],
  );

  const handleFetchData = (args) => {
    // TODO: implement API call to fetch requests data. this function is called on initial
    // component mount, and pagination/filter/sort changes.
    console.log('handleFetchData', args);
  };

  const handleApprove = (row) => console.log('approve', row);
  const handleDecline = (row) => console.log('decline', row);

  return (
    <EnrollmentRequestManagementTable
      data={data}
      fetchData={handleFetchData}
      requestFilterChoices={overviewData}
      onApprove={handleApprove}
      onDecline={handleDecline}
    />
  );
};

export default SubscriptionEnrollmentRequests;
