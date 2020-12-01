import React from 'react';
import { SearchData } from '@edx/frontend-enterprise';

import CourseSearch from './CourseSearch';

function BulkEnrollmentPage() {
  return (
    <SearchData>
      <CourseSearch />
    </SearchData>
  );
}

export default BulkEnrollmentPage;
