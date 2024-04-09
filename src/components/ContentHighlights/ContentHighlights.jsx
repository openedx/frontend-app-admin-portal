import React, { useEffect, useState, useContext } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { Alert } from '@edx/paragon';
import { WarningFilled } from '@edx/paragon/icons';

import LmsApiService from '../../data/services/LmsApiService';
import ContentHighlightRoutes from './ContentHighlightRoutes';
import Hero from '../Hero';
import ContentHighlightsContextProvider from './ContentHighlightsContext';
import ContentHighlightToast from './ContentHighlightToast';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { withLocation } from '../../hoc';

const ContentHighlights = ({ location, enterpriseGroupsV1 }) => {
  const navigate = useNavigate();
  const { state: locationState } = location;
  const [toasts, setToasts] = useState([]);
  const isEdxStaff = getAuthenticatedUser().administrator;
  const [isSubGroup, setIsSubGroup] = useState(false);
  const { enterpriseCuration: { enterpriseCuration } } = useContext(EnterpriseAppContext);

  useEffect(() => {
    async function fetchGroupsData() {
      try {
        const response = await LmsApiService.fetchEnterpriseGroups();
        response.data.results.forEach((group) => {
          if (group.applies_to_all_contexts === false) {
            setIsSubGroup(true);
          }
        });
      } catch (error) {
        logError(error);
      }
    }
    if (enterpriseGroupsV1 && isEdxStaff) {
      fetchGroupsData();
    }
  }, [enterpriseGroupsV1, isEdxStaff]);
  useEffect(() => {
    if (locationState?.highlightToast) {
      setToasts((prevState) => [...prevState, {
        toastText: enterpriseCuration?.toastText,
        uuid: uuidv4(),
      }]);
      const newState = { ...locationState };
      delete newState.highlightToast;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
    if (locationState?.archiveCourses) {
      setToasts((prevState) => [...prevState, {
        toastText: 'Archived courses deleted',
        uuid: uuidv4(),
      }]);
      const newState = { ...locationState };
      delete newState.archiveCourses;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
    if (locationState?.deletedHighlightSet) {
      setToasts((prevState) => [...prevState, {
        toastText: `"${enterpriseCuration?.toastText}" deleted`,
        uuid: uuidv4(),
      }]);
      const newState = { ...locationState };
      delete newState.deletedHighlightSet;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
    if (locationState?.addHighlightSet) {
      setToasts((prevState) => [...prevState, {
        toastText: `"${enterpriseCuration?.toastText}" added`,
        uuid: uuidv4(),
      }]);
      const newState = { ...locationState };
      delete newState.addHighlightSet;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
  }, [enterpriseCuration?.toastText, navigate, location, locationState]);
  return (
    <ContentHighlightsContextProvider>
      <Hero title="Highlights" />
      {isSubGroup && (
        <Alert variant="warning" className="mt-4 mb-0" icon={WarningFilled}>
          <Alert.Heading>Highlights hidden for administrators with custom groups enabled</Alert.Heading>
          <p>
            edX staff are able to view the highlights tab, but because this customer has custom
            groups enabled, administrators will not be able to see this tab, and users will not
            see highlights on their learner portal. This is just temporary as highlights are
            not currently compatible with custom groups.
          </p>
        </Alert>
      )}
      <ContentHighlightRoutes />
      {toasts.map(({ toastText, uuid }) => (<ContentHighlightToast toastText={toastText} key={uuid} />))}
    </ContentHighlightsContextProvider>
  );
};

ContentHighlights.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
    state: PropTypes.shape({
      addHighlightSet: PropTypes.bool,
      deletedHighlightSet: PropTypes.bool,
      archiveCourses: PropTypes.bool,
      highlightToast: PropTypes.bool,
    }),
  }),
  enterpriseGroupsV1: PropTypes.bool,
};

const mapStateToProps = state => ({
  enterpriseGroupsV1: state.portalConfiguration.enterpriseFeatures?.enterpriseGroupsV1,
});

export default connect(mapStateToProps)(withLocation(ContentHighlights));
