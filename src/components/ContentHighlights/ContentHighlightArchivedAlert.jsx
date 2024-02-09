import { Alert } from '@edx/paragon';
import { useContext, useState } from 'react';
import { NEW_ARCHIVED_CONTENT_ALERT_DISMISSED_COOKIE_NAME } from './data/constants';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { enterpriseCurationActions, isArchivedContent } from '../EnterpriseApp/data/enterpriseCurationReducer';

const ContentHighlightArchivedAlert = () => {
  const archivedContentCookies = {};
  const [isOpen, setIsOpen] = useState(true);

  const { enterpriseCuration: { enterpriseHighlightedSets, dispatch } } = useContext(EnterpriseAppContext);
  enterpriseHighlightedSets.forEach(set => {
    set.highlightedContent.forEach(content => {
      if (isArchivedContent(content)) {
        if (archivedContentCookies[set.uuid]) {
          archivedContentCookies[set.uuid].push(content.contentKey);
        } else {
          archivedContentCookies[set.uuid] = [content.contentKey];
        }
      }
    });
  });

  const setArchivedContentCookies = () => {
    Object.entries(archivedContentCookies).forEach(([highlightSetUUID, courseKey]) => {
      global.localStorage.setItem(
        `${NEW_ARCHIVED_CONTENT_ALERT_DISMISSED_COOKIE_NAME}-${highlightSetUUID}`,
        courseKey,
      );
    });
    dispatch(enterpriseCurationActions.updateDismissedArchivedCourse(false));
    setIsOpen(false);
  };

  return (
    <Alert
      variant="info"
      dismissible
      closeLabel="Dismiss"
      show={isOpen}
      onClose={setArchivedContentCookies}
    >
      <Alert.Heading>Needs Review: Archived Course(s)</Alert.Heading>
      <p>Course(s) in your highlight(s) have been archived and are no longer open for new enrollments.</p>
    </Alert>
  );
};

export default ContentHighlightArchivedAlert;
