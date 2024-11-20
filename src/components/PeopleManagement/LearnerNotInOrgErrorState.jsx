import React from 'react';
import {
  Card, Hyperlink, Stack, Icon,
} from '@openedx/paragon';
import classNames from 'classnames';
import { Error } from '@openedx/paragon/icons';

const LearnerNotInOrgErrorState = () => (
  <Stack gap={2.5} className="mb-4">
    <Card
      className={classNames(
        'invite-modal-summary-card rounded-0 shadow-none',
        { invalid: true },
      )}
    >
      <Card.Section>
        <Stack direction="horizontal" gap={3}>
          <Icon className="text-danger" src={Error} />
          <div>
            <div className="h4 mb-0">Some people can&apos;t be added.</div>
            <span className="small">Check that all people in the file are registered with your organization.
              <Hyperlink
                destination="https://www.edx.org"
                target="_blank"
              >
                Learn more
              </Hyperlink>
            </span>
          </div>
        </Stack>
      </Card.Section>
    </Card>
  </Stack>
);

export default LearnerNotInOrgErrorState;
