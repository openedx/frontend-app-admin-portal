import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Button,
  Icon,
  OverlayTrigger,
  Popover,
} from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

const SubscriptionsHelpPopover = ({ enterpriseSlug }) => (
  <OverlayTrigger
    trigger="click"
    placement="bottom"
    overlay={(
      <Popover>
        <Popover.Title as="h3">Customer Support can help</Popover.Title>
        <Popover.Content>
          <ul className="pl-4">
            <li>
              Manage your individual subscription cohorts
            </li>
            <li>
              Add new cohorts to your Subscription Management page
            </li>
            <li>
              Help maximize the efficacy of your learning program
            </li>
          </ul>
          <Button as={Link} to={`/${enterpriseSlug}/admin/support`} variant="brand" size="sm" block>
            Contact Customer Support
          </Button>
        </Popover.Content>
      </Popover>
    )}
  >
    <Button variant="tertiary" className="d-flex align-items-center">
      <Icon src={Info} className="d-inline-block mr-2" />
      Need help?
    </Button>
  </OverlayTrigger>
);

SubscriptionsHelpPopover.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

export default SubscriptionsHelpPopover;
