import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@openedx/paragon';

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
            <h3>Assign more courses to maximize your budget.</h3>
            <span>
              Your budget&apos;s available balance of {formatPrice(availableBalance)} will
              expire on {formatDate(subsidyExpirationDate)}.
            </span>
          </div>
        </Card.Section>
      </Card.Body>
      <Card.Footer className="assign-more-courses__card-footer justify-content-end">
        <Button
          as={Link}
          to={pathToCatalogTab}
        >
          Assign courses
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default AssignMoreCoursesEmptyStateMinimal;
