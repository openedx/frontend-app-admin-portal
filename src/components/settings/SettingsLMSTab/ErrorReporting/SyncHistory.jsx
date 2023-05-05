import React, { useEffect, useState } from 'react';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import {
  ActionRow, AlertModal, Breadcrumb, Button, Card, Hyperlink,
  Icon, Image, Skeleton, Toast, useToggle,
} from '@edx/paragon';
import { CheckCircle, Error, Sync } from '@edx/paragon/icons';
import { getStatus } from '../utils';
import { getTimeAgo } from './utils';
import handleErrors from '../../utils';
import { channelMapping, formatTimestamp } from '../../../../utils';
import ConfigError from '../../ConfigError';
import LmsApiService from '../../../../data/services/LmsApiService';

import {
  ACTIVATE_TOAST_MESSAGE, BLACKBOARD_TYPE, CANVAS_TYPE, CORNERSTONE_TYPE,
  DEGREED2_TYPE, errorToggleModalText, INACTIVATE_TOAST_MESSAGE, MOODLE_TYPE, SAP_TYPE,
} from '../../data/constants';
import ErrorReportingTable from './ErrorReportingTable';

const SyncHistory = () => {
  // the simple redirect is used for going back to the lms page
  const vars = (window.location.pathname).split('lms/');
  const redirectPath = `${vars[0]}lms/`;
  const configInfo = vars[1].split('/');
  const configChannel = configInfo[0];
  const configId = configInfo[1];

  // the redirect with params is used when editing an existing config
  let fullLink = `${((window.location.href).split('lms/'))[0]}lms/?`;
  const queryParams = new URLSearchParams({
    lms: configChannel,
    id: configId,
  });
  fullLink += queryParams.toString();

  const [config, setConfig] = useState();
  const [errorModalText, setErrorModalText] = useState();
  const [errorIsOpen, openError, closeError] = useToggle(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [reloadPage, setReloadPage] = useState(false);

  const getSubheaders = () => {
    const sub1 = (getStatus(config) === 'Active' ? `${getStatus(config)}` : null);
    const sub2 = channelMapping[config.channelCode].displayName;
    const sub3 = `Last modified on ${formatTimestamp({ timestamp: config.lastModifiedAt })}`;
    return (
      <span className="d-flex">
        {sub1 && (<span>{sub1}<span className="p-2">•</span></span>)}
        <span>{sub2}<span className="p-2">•</span></span>
        <span>{sub3}</span>
      </span>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      let response;
      switch (configChannel) {
        case BLACKBOARD_TYPE:
          response = await LmsApiService.fetchSingleBlackboardConfig(configId); break;
        case CANVAS_TYPE:
          response = await LmsApiService.fetchSingleCanvasConfig(configId); break;
        case CORNERSTONE_TYPE:
          response = await LmsApiService.fetchSingleCornerstoneConfig(configId); break;
        case DEGREED2_TYPE:
          response = await LmsApiService.fetchSingleDegreed2Config(configId); break;
        case MOODLE_TYPE:
          response = await LmsApiService.fetchSingleMoodleConfig(configId); break;
        case SAP_TYPE:
          response = await LmsApiService.fetchSingleSuccessFactorsConfig(configId); break;
        default:
          break;
      }
      return camelCaseObject(response.data);
    };
    fetchData()
      .then((response) => {
        setConfig(response);
      })
      .catch((error) => {
        handleErrors(error);
      });
  }, [configChannel, configId, reloadPage]);

  const getLastSync = () => {
    if (config.lastSyncErroredAt != null) {
      const timeStamp = getTimeAgo(config.lastSyncErroredAt);
      return (
        <Card.Status icon={Sync} variant="danger">
          <span className="d-flex h4">Recent sync error:&nbsp; {timeStamp}
            <Icon src={Error} className="ml-2" />
          </span>
        </Card.Status>
      );
    }
    if (config.lastSyncAttemptedAt != null) {
      const timeStamp = getTimeAgo(config.lastSyncAttemptedAt);
      return (
        <Card.Status icon={Sync} variant="success">
          <span className="d-flex h4">Last sync:&nbsp; {timeStamp}
            <Icon src={CheckCircle} className="ml-2" />
          </span>
        </Card.Status>
      );
    }
    return null;
  };

  const onClick = (input) => {
    // if configuration is being toggled
    if (input !== null) {
      setReloadPage(true);
      setToastMessage(input);
    } else {
      // if configuration is being deleted
      window.location.href = redirectPath;
    }
  };

  const toggleConfig = async (toggle) => {
    const configOptions = {
      active: toggle,
      enterprise_customer: config.enterpriseCustomer,
    };
    let err;
    try {
      await channelMapping[config.channelCode].update(configOptions, config.id);
    } catch (error) {
      err = handleErrors(error);
    }
    if (err) {
      setErrorModalText(errorToggleModalText);
      openError();
    } else {
      onClick(toggle ? ACTIVATE_TOAST_MESSAGE : INACTIVATE_TOAST_MESSAGE);
    }
  };

  const createActionRow = () => {
    if (getStatus(config) === 'Active') {
      return (
        <ActionRow>
          <Button onClick={() => toggleConfig(false)} variant="tertiary">Disable</Button>
          <Hyperlink destination={fullLink}>
            <Button variant="outline-primary">Configure</Button>
          </Hyperlink>
        </ActionRow>
      );
    }
    if (getStatus(config) === 'Inactive') {
      return (
        <ActionRow>
          <Button onClick={() => setShowDeleteModal(true)} variant="tertiary">Delete</Button>
          <Hyperlink destination={fullLink}>
            <Button variant="tertiary">Configure</Button>
          </Hyperlink>
          <Button onClick={() => toggleConfig(true)} variant="outline-primary">Enable</Button>
        </ActionRow>
      );
    }
    return ( // if incomplete
      <ActionRow>
        <Button onClick={() => setShowDeleteModal(true)} variant="tertiary">Delete</Button>
        <Hyperlink destination={fullLink}>
          <Button variant="outline-primary">Configure</Button>
        </Hyperlink>
      </ActionRow>
    );
  };

  return (
    <div className="p-4">
      <AlertModal
        title="Delete integration?"
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        hasCloseButton
        footerNode={(
          <ActionRow>
            <Button
              variant="tertiary"
              data-testid="cancel-delete-config"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              data-testid="confirm-delete-config"
              onClick={() => onClick()}
            >
              Delete
            </Button>
          </ActionRow>
        )}
      >
        <p>
          Are you sure you want to delete this learning platform integration?
          Once deleted, any saved integration data will be lost.
        </p>
      </AlertModal>
      <ConfigError
        isOpen={errorIsOpen}
        close={closeError}
        configTextOverride={errorModalText}
      />
      {!config && (
        <span data-testid="skeleton"><Skeleton count={4} /></span>
      )}
      {config && (
        <>
          <Breadcrumb
            links={[
              { label: 'Learning Platform', url: `${redirectPath}` },
            ]}
            activeLabel={config.displayName}
          />
          <Card className="mt-4">
            <Card.Section
              actions={(
                createActionRow()
          )}
            >
              <h2>
                <Image
                  className="lms-icon mr-2"
                  src={channelMapping[configChannel].icon}
                />
                {config.displayName}
              </h2>
              <p className="x-small pt-3">
                {getSubheaders()}
              </p>
            </Card.Section>
            {getLastSync()}
          </Card>
          <ErrorReportingTable
            config={config}
          />
        </>
      )}
      {toastMessage && (
        <Toast onClose={() => setToastMessage(null)} show={toastMessage !== null}>{toastMessage}</Toast>
      )}
    </div>
  );
};

export default SyncHistory;
