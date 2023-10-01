import React from 'react';
import { Card, Row, Col } from '@edx/paragon';
import confirmSpend from '../../images/confirmSpend.png';
import findTheRightCourse from '../../images/findTheRightCourse.png';
import nameYourLearner from '../../images/nameYourLearner.png';

const NoBudgetActivityCard = () => (
  <Card>
    <Card.Section className="bg-light-200 text-center">
      <h4 className="mb-4 text-gray">
        No budget activity yet? Assign a course!
      </h4>
      <Row>
        <Col>
          <img src={findTheRightCourse} alt="placeholder" />
        </Col>
        <Col>
          <img src={nameYourLearner} alt="placeholder" />
        </Col>
        <Col>
          <img src={confirmSpend} alt="placeholder" />
        </Col>
      </Row>
    </Card.Section>
    <Card.Section className="text-center">
      <Row>
        <Col>
          <h5>
            <span className="text-gray">01</span>
            <br />
            Find the right course
          </h5>
          <p>
            Check out your budget’s catalog of courses and select the course you
            want to assign to learner(s).
          </p>
        </Col>
        <Col>
          <h5>
            <span className="text-gray">02</span>
            <br />
            Name your learner(s)
          </h5>
          <p>
            You will be prompted to enter email addresses for the learner or
            learners you want to assign.
          </p>
        </Col>
        <Col>
          <h5>
            <span className="text-gray">03</span>
            <br />
            Confirm spend
          </h5>
          <p>
            Once confirmed, the total cost will be deducted from your budget,
            and you can track your spending right here!
          </p>
        </Col>
      </Row>
    </Card.Section>
  </Card>
);

export default NoBudgetActivityCard;
