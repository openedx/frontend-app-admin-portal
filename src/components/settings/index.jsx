import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Container,
  Tabs,
  Tab,
} from '@edx/paragon';
import { useHistory, generatePath } from 'react-router-dom';
import PropTypes from 'prop-types';

import Hero from '../Hero';
import { useSettingsTab } from './data/hooks';
import {
  SETTINGS_TAB_LABELS,
  SETTINGS_TABS_VALUES,
  SETTINGS_TAB_PARAM,
} from './data/constants';

const PAGE_TILE = 'Settings';

const SettingsPage = (props) => {
  const tab = useSettingsTab();

  const history = useHistory();

  /**
   * Given a key from SETTINGS_TABS_VALUES, will change the current router path
   * to the new value
   * @param {string} newTabValue
   */
  const handleTabChange = (newTabValue) => {
    if (SETTINGS_TABS_VALUES[newTabValue]) {
      const newPath = generatePath(
        props.match.path,
        { [SETTINGS_TAB_PARAM]: newTabValue },
      );
      history.push({ pathname: newPath });
    }
  };

  return (
    <>
      <Helmet title={PAGE_TILE} />
      <Hero title={PAGE_TILE} />

      <Container className="py-3" fluid>

        <Tabs
          id="controlled-tab-example"
          activeKey={tab}
          onSelect={(k) => handleTabChange(k)}
        >
          <Tab eventKey={SETTINGS_TABS_VALUES.access} title={SETTINGS_TAB_LABELS.access}>
            Access
          </Tab>
          <Tab eventKey={SETTINGS_TABS_VALUES.lms} title={SETTINGS_TAB_LABELS.lms}>
            LMS
          </Tab>
        </Tabs>
      </Container>
    </>
  );
};

SettingsPage.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default SettingsPage;
