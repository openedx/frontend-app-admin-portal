import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { Alert } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';

import LmsApiService from '../../data/services/LmsApiService';

import './FeatureAnnouncementBanner.scss';

const FeatureAnnouncementBanner = ({ enterpriseSlug }) => {
  const [enterpriseNotificationBanner, setEnterpriseNotificationBanner] = useState({
    title: null,
    text: null,
    notificationId: null,
  });
  const [isRead, setIsRead] = useState(false);

  const markAsRead = () => {
    setIsRead(true);
    LmsApiService.markBannerNotificationAsRead({
      enterprise_slug: enterpriseSlug,
      notification_id: enterpriseNotificationBanner.notificationId,
    });
  };

  useEffect(() => {
    LmsApiService.fetchEnterpriseBySlug(enterpriseSlug)
      .then((response) => {
        if (response.data && response.data.enterprise_notification_banner) {
          setEnterpriseNotificationBanner({
            title: response.data.enterprise_notification_banner.title,
            text: response.data.enterprise_notification_banner.text,
            notificationId: response.data.enterprise_notification_banner.id,
          });
        }
      })
      .catch((error) => {
        // We can ignore errors here as user will se the banner in the next page refresh.
        logError(error);
      });
  }, [enterpriseSlug]);

  if (isRead || !enterpriseNotificationBanner.text || !enterpriseNotificationBanner.title) {
    return null;
  }

  return (
    <div>
      <Alert variant="info" dismissible onClose={markAsRead}>
        <Alert.Heading>{enterpriseNotificationBanner.title}</Alert.Heading>
        <ReactMarkdown linkTarget="_blank">{enterpriseNotificationBanner.text}</ReactMarkdown>
      </Alert>
    </div>
  );
};

FeatureAnnouncementBanner.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

export default FeatureAnnouncementBanner;
