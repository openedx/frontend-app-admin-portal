import { useState } from 'react';
import { Hyperlink, PageBanner } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { ADMIN_ROLES_SURVEY_DISMISSED_COOKIE_NAME } from '../EnterpriseApp/data/constants';
import { configuration } from '../../config';

const AdminRolesSurveyBanner = () => {
  const surveyUrl = configuration.ENTERPRISE_ADMIN_ROLES_SURVEY_URL;

  const [show, setShow] = useState(
    !global.localStorage.getItem(ADMIN_ROLES_SURVEY_DISMISSED_COOKIE_NAME),
  );

  const handleDismiss = () => {
    global.localStorage.setItem(ADMIN_ROLES_SURVEY_DISMISSED_COOKIE_NAME, 'true');
    setShow(false);
  };

  return (
    <PageBanner
      show={show}
      dismissible
      variant="accentB"
      onDismiss={handleDismiss}
    >
      <FormattedMessage
        id="adminPortal.pageBanner.adminRolesSurvey.part1"
        defaultMessage="✨ Help shape our new feature! Give us 5 minutes of "
      />
      <Hyperlink
        className="mx-1"
        target="_blank"
        destination={surveyUrl}
      >
        <FormattedMessage
          id="adminPortal.pageBanner.adminRolesSurvey.part2"
          defaultMessage="feedback"
        />
      </Hyperlink>
      <FormattedMessage
        id="adminPortal.pageBanner.adminRolesSurvey.part3"
        defaultMessage="on admin roles so we can build it right for you."
      />
    </PageBanner>
  );
};

export default AdminRolesSurveyBanner;
