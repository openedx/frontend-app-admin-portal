import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@edx/paragon';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  formatDate, formatPrice, useBudgetId, usePathToCatalogTab, useSubsidyAccessPolicy,
} from './data';
import nameYourLearner from './assets/reading.svg';

const AssignMoreCoursesEmptyStateMinimal = () => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const pathToCatalogTab = usePathToCatalogTab();

  if (!subsidyAccessPolicy) {
    return null;
  }

  const availableBalance = subsidyAccessPolicy.aggregates.spendAvailableUsd;
  const subsidyExpirationDate = subsidyAccessPolicy.subsidyExpirationDatetime;

  return (
    <Card className="assign-more-courses-empty-state-minimal" orientation="horizontal">
      <Card.ImageCap
        src={nameYourLearner}
        className="bg-light-300 d-flex justify-content-center py-3"
      />
      <Card.Body className="assign-more-courses__card-body">
        <Card.Section className="h-100 d-flex align-items-center">
          <div>
            <h3>
              <FormattedMessage
                id="lcm.budget.detail.page.assign.more.courses.empty.state.title"
                defaultMessage="Assign more courses to maximize your budget."
                description="Title for the empty state card on the budget detail page"
              />
            </h3>
            <span>
              <FormattedMessage
                id="lcm.budget.detail.page.assign.more.courses.empty.state.subtitle"
                defaultMessage="Your budget's available balance of {availableBalance} will
                expire on {subsidyExpirationDate}."
                description="Subtitle for the empty state card on the budget detail page"
                values={{
                  availableBalance: formatPrice(availableBalance),
                  subsidyExpirationDate: formatDate(subsidyExpirationDate),
                }}
              />
            </span>
          </div>
        </Card.Section>
      </Card.Body>
      <Card.Footer className="assign-more-courses__card-footer justify-content-end">
        <Button
          as={Link}
          to={pathToCatalogTab}
        >
          <FormattedMessage
            id="lcm.budget.detail.page.assign.more.courses.empty.state.assign.courses.button"
            defaultMessage="Assign courses"
            description="Button text to assign more courses"
          />
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default AssignMoreCoursesEmptyStateMinimal;
