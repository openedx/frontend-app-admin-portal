import { Alert } from '@edx/paragon';
import { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { NEW_ARCHIVED_CONTENT_ALERT_DISMISSED_COOKIE_NAME } from './data/constants';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { enterpriseCurationActions, isArchivedContent } from '../EnterpriseApp/data/enterpriseCurationReducer';

const ContentHighlightArchivedAlert = ({ open, onClose }) => {
  const [archivedContentLocalStorage, setArchivedContentLocalStorage] = useState({});
  const { enterpriseCuration: { enterpriseHighlightedSets, dispatch } } = useContext(EnterpriseAppContext);

  useEffect(() => {
    enterpriseHighlightedSets?.forEach((highlightSet) => {
      highlightSet.highlightedContent.forEach((content) => {
        // if content is not archived; do nothing.
        if (!isArchivedContent(content)) {
          return;
        }
        // content is archived, so update `archivedContentLocalStorage` state.
        /* eslint-disable no-param-reassign */
        setArchivedContentLocalStorage((prevState) => {
          if (!prevState[highlightSet.uuid]) {
            prevState[highlightSet.uuid] = [content.contentKey];
          } else {
            prevState[highlightSet.uuid].push(content.contentKey);
          }
          return prevState;
        });
      });
    });
  }, [enterpriseHighlightedSets]);

  const addArchivedContentToLocalStorage = () => {
    Object.entries(archivedContentLocalStorage).forEach(([highlightSetUUID, courseKey]) => {
      global.localStorage.setItem(
        `${NEW_ARCHIVED_CONTENT_ALERT_DISMISSED_COOKIE_NAME}-${highlightSetUUID}`,
        courseKey,
      );
    });
    dispatch(enterpriseCurationActions.updateDismissedArchivedCourse(false));
    onClose();
  };

  return (
    <Alert
      variant="info"
      dismissible
      show={open}
      onClose={addArchivedContentToLocalStorage}
    >
      <Alert.Heading>Needs Review: Archived Course(s)</Alert.Heading>
      <p>Course(s) in your highlight(s) have been archived and are no longer open for new enrollments.</p>
    </Alert>
  );
};

ContentHighlightArchivedAlert.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ContentHighlightArchivedAlert;
