import React from 'react';
import { Helmet } from 'react-helmet';

const CourseSearch = () => {
  const { enterpriseConfig } = {
    enterpriseConfig: {}, // todo: where to get this from?
  };
  const PAGE_TITLE = `Search courses - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />

    </>
  );
};

export default CourseSearch;
