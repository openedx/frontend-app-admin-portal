import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { Alert } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';

import LmsApiService from '../../data/services/LmsApiService';
import ContentHighlightRoutes from './ContentHighlightRoutes';
import Hero from '../Hero';
import ContentHighlightsContextProvider from './ContentHighlightsContext';
import ContentHighlightToast from './ContentHighlightToast';
import { EnterpriseAppContext, TEnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { withLocation } from '../../hoc';
import { GROUP_TYPE_BUDGET } from '../PeopleManagement/constants';

type ContentHighlightsToastProps = {
  toastText: string;
  uuid: string;
};

const ContentHighlights = ({ location }) => {
  const navigate = useNavigate();
  const { state: locationState } = location;
  const [toasts, setToasts] = useState<ContentHighlightsToastProps[]>([]);
  const isEdxStaff = getAuthenticatedUser().administrator;
  const [hasBudgetGroup, setHasBudgetGroup] = useState(false);
  const {
    enterpriseCuration: { enterpriseCuration },
  }: TEnterpriseAppContext = useContext(EnterpriseAppContext);
  const intl = useIntl();

  useEffect(() => {
    async function fetchGroupsData() {
      try {
        const response = await LmsApiService.fetchEnterpriseGroups();
        response.data.results.forEach((group) => {
          if (group.groupType === GROUP_TYPE_BUDGET) {
            setHasBudgetGroup(true);
          }
        });
      } catch (error) {
        logError(error);
      }
    }
    if (isEdxStaff) {
      fetchGroupsData();
    }
  }, [isEdxStaff]);

  useEffect(() => {
    if (locationState?.highlightToast && enterpriseCuration?.toastText) {
      const newToast = {
        toastText: enterpriseCuration.toastText,
        uuid: uuidv4(),
      };
      setToasts((prevState) => [...prevState, newToast]);
      const newState = { ...locationState };
      delete newState.highlightToast;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
    if (locationState?.archiveCourses) {
      setToasts((prevState) => [...prevState, {
        toastText: intl.formatMessage({
          id: 'highlights.page.archived.courses.deleted.toast.message',
          defaultMessage: 'Archived courses deleted',
          description: 'Toast message shown when archived courses are deleted',
        }),
        uuid: uuidv4(),
      }]);
      const newState = { ...locationState };
      delete newState.archiveCourses;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
    if (locationState?.deletedHighlightSet) {
      setToasts((prevState) => [...prevState, {
        toastText: intl.formatMessage({
          id: 'highlights.page.highlight.deleted.toast.message',
          defaultMessage: '{highlightTitle} deleted',
          description: 'Toast message shown when hightlight set is deleted',
        }, { highlightTitle: `"${enterpriseCuration?.toastText}"` }),
        uuid: uuidv4(),
      }]);
      const newState = { ...locationState };
      delete newState.deletedHighlightSet;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
    if (locationState?.addHighlightSet) {
      setToasts((prevState) => [...prevState, {
        toastText: intl.formatMessage({
          id: 'highlights.page.highlight.added.toast.message',
          defaultMessage: '{highlightTitle} added',
          description: 'Toast message shown when hightlight set is added',
        }, { highlightTitle: `"${enterpriseCuration?.toastText}"` }),
        uuid: uuidv4(),
      }]);
      const newState = { ...locationState };
      delete newState.addHighlightSet;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
  }, [enterpriseCuration?.toastText, navigate, location, locationState, intl]);

  return (
    <ContentHighlightsContextProvider>
      <Hero
        title={intl.formatMessage({
          id: 'highlights.page.hero.title',
          defaultMessage: 'Highlights',
          description: 'Hero title for the highlights page.',
        })}
      />
      {hasBudgetGroup && (
        <Alert variant="warning" className="mt-4 mb-0" icon={WarningFilled}>
          <Alert.Heading>
            <FormattedMessage
              id="highlights.page.custom.groups.enabled.warning.alert.title"
              defaultMessage="Highlights hidden for administrators with custom groups enabled"
              description="Warning title shown to admin when highlights are hidden due to custom groups."
            />
          </Alert.Heading>
          <p>
            <FormattedMessage
              id="highlights.page.custom.groups.enabled.warning.alert.messge"
              defaultMessage="edX staff are able to view the highlights tab, but because this customer has custom groups enabled, administrators will not be able to see this tab, and users will not see highlights on their learner portal. This is just temporary as highlights are not currently compatible with custom groups."
              description="Warning message shown to admin when highlights are hidden due to custom groups."
            />
          </p>
        </Alert>
      )}
      <ContentHighlightRoutes />
      {toasts.map(({ toastText, uuid }) => (
        <ContentHighlightToast toastText={toastText} key={uuid} />
      ))}
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
};

export default withLocation(ContentHighlights);
