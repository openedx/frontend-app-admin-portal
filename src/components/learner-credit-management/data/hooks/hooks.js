import { useMemo, useState } from 'react';

import { CONTENT_TYPE_COURSE } from '../constants';

// eslint-disable-next-line import/prefer-default-export
export const useSelectedCourse = () => {
  const [course, setCourse] = useState(null);
  const isCourse = useMemo(
    () => course?.contentType === CONTENT_TYPE_COURSE,
    [course],
  );
  return [course, setCourse, isCourse];
};
