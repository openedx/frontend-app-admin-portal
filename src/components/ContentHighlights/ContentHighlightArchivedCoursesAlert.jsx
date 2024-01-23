import { Alert } from '@edx/paragon';
import { useContext, useState } from 'react';
import dayjs from 'dayjs';
import { NEW_ARCHIVED_COURSE_ALERT_DISMISSED_COOKIE_NAME, archivedHighlightsCoursesCookies } from './data/constants';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { enterpriseCurationActions } from '../EnterpriseApp/data/enterpriseCurationReducer';

const ContentHighlightArchivedCoursesAlert = () => {
  const archivedCoursesCookies = {};
  const [isOpen, setIsOpen] = useState(true);

  const { enterpriseCuration: { enterpriseHighlightedContents, dispatch } } = useContext(EnterpriseAppContext);
  enterpriseHighlightedContents.forEach(content => {
    content.highlightedContent.forEach(course => {
      if (course.courseRunStatuses?.length === 1 && course.courseRunStatuses.includes('archived')) {
        if (archivedCoursesCookies[content.uuid]) {
          archivedCoursesCookies[content.uuid].push(course.contentKey);
        } else {
          archivedCoursesCookies[content.uuid] = [course.contentKey];
        }
      }
    });
  });

  const setArchivedCourseCookies = () => {
    const currentDate = dayjs();
    // Chrome sets an cap on expiration limit for cookies to 400 days
    // https://developer.chrome.com/blog/cookie-max-age-expires
    const cookieExpiration = currentDate.add(400, 'day').format();
    archivedHighlightsCoursesCookies.set(
      NEW_ARCHIVED_COURSE_ALERT_DISMISSED_COOKIE_NAME,
      archivedCoursesCookies,
      { expires: new Date(cookieExpiration) },
    );
    dispatch(enterpriseCurationActions.updateDismissedArchivedCourse(false));
    setIsOpen(false);
  };

  return (
    <Alert
      variant="info"
      dismissible
      closeLabel="Dismiss"
      show={isOpen}
      onClose={setArchivedCourseCookies}
    >
      <Alert.Heading>Needs Review: Archived Course(s)</Alert.Heading>
      <p>Course(s) in your highlight(s) have been archived and are no longer open for new enrollments.</p>
    </Alert>
  );
};

export default ContentHighlightArchivedCoursesAlert;
