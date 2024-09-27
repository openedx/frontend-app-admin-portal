import React from 'react';
import { Helmet } from 'react-helmet';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Button, Card, Container, useToggle,
} from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';

import cardImage from './images/ZeroStateImage.svg';
import Hero from '../Hero';

const PeopleManagementPage = () => {
  const intl = useIntl();
  const PAGE_TITLE = intl.formatMessage({
    id: 'admin.portal.people.management.page',
    defaultMessage: 'People Management',
    description: 'Title for the people management page.',
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isModalOpen, openModal, closeModal] = useToggle(false);

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <Container className="container-mw-xl ml-3 mt-4">
        <ActionRow className="mb-4">
          <span className="flex-column">
            <h3>
              <FormattedMessage
                id="admin.portal.people.management.page.title"
                defaultMessage="Your Learner Credit groups"
                description="Title for people management zero state."
              />
            </h3>
            <FormattedMessage
              id="admin.portal.people.management.page.subtitle"
              defaultMessage="Monitor group learning progress, assign more courses, and invite members to new Learner Credit budgets."
              description="Subtitle for people management zero state."
            />
          </span>
          <ActionRow.Spacer />
          <Button iconBefore={Add} onClick={openModal}>
            <FormattedMessage
              id="admin.portal.people.management.page.newgroup.button"
              defaultMessage="Create group"
              description="CTA button text to open new group modal."
            />
          </Button>
        </ActionRow>
        <Card>
          <Card.ImageCap
            className="mh-100"
            src={cardImage}
            srcAlt="Two people carrying a cartoon arrow"
          />
          <span className="text-center align-self-center">
            <h2 className="h3 mb-3 mt-3">
              <FormattedMessage
                id="highlights.highlights.tab.zero.state.header.message"
                defaultMessage="You don't have any groups yet."
                description="Header message shown to admin there's no groups created yet."
              />
            </h2>
            <p>
              <FormattedMessage
                id="highlights.highlights.tab.zero.state.detail.message"
                defaultMessage="Once a group is created, you can track members' progress, assign extra courses, and invite them to additional budgets."
                description="Detail message shown to admin benefits of creating a group."
              />
            </p>
          </span>
        </Card>
      </Container>
    </>
  );
};

export default PeopleManagementPage;
