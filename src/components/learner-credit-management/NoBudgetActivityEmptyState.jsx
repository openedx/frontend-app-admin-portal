import React from 'react';
import {
  breakpoints, Button, Card, Row, Col, useMediaQuery,
} from '@edx/paragon';
import { Link } from 'react-router-dom';

import { usePathToCatalogTab } from './data';
import nameYourLearners from './assets/nameYourLearners.svg';
import findTheRightCourse from './assets/findTheRightCourse.svg';
import confirmSpend from './assets/confirmSpend.svg';

const NoBudgetActivityEmptyState = () => {
  const pathToCatalogTab = usePathToCatalogTab();
  const isLargeOrGreater = useMediaQuery({ query: `(min-width: ${breakpoints.large.minWidth}px)` });

  return (
    <Card>
      <Card.Section className="bg-light-300 text-center">
        <h3 className="mb-4.5">No budget activity yet? Assign a course!</h3>
        <Row>
          <Col>
            <img src={findTheRightCourse} alt="" />
          </Col>
          {isLargeOrGreater && (
            <>
              <Col>
                <img src={nameYourLearners} alt="" />
              </Col>
              <Col>
                <img src={confirmSpend} alt="" />
              </Col>
            </>
          )}
        </Row>
      </Card.Section>
      <Card.Section className="text-center">
        <Row className="mb-4.5">
          <Col className="mb-4.5 mb-lg-0">
            <h4>
              <span className="d-block text-brand mb-2">01</span>
              Find the right course
            </h4>
            <span>
              Check out your budget&apos;s catalog of courses and select the course you
              want to assign to learners.
            </span>
          </Col>
          <Col className="mb-4.5 mb-lg-0">
            <h4>
              <span className="d-block text-brand mb-2">02</span>
              Name your learners
            </h4>
            <span>
              You will be prompted to enter email addresses for the learner or
              learners you want to assign.
            </span>
          </Col>
          <Col className="mb-4.5 mb-lg-0">
            <h4>
              <span className="d-block text-brand mb-2">03</span>
              Confirm spend
            </h4>
            <span>
              Once confirmed, the total cost will be deducted from your budget,
              and you can track your spending right here!
            </span>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button as={Link} to={pathToCatalogTab}>Get started</Button>
          </Col>
        </Row>
      </Card.Section>
    </Card>
  );
};

export default NoBudgetActivityEmptyState;
