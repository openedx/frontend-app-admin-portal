import React from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Award, Check, Groups, RemoveRedEye,
} from '@openedx/paragon/icons';

import NumberCard from './cards/NumberCard';

const AdminCards = ({
  activeLearners,
  numberOfUsers,
  courseCompletions,
  enrolledLearners,
}) => {
  const intl = useIntl();

  const cards = {
    numberOfUsers: {
      ref: React.createRef(),
      description: intl.formatMessage({
        id: 'adminPortal.cards.registeredLearners',
        defaultMessage: 'total number of learners registered',
      }),
      icon: Groups,
      actions: [{
        label: intl.formatMessage({
          id: 'adminPortal.cards.registeredUnenrolledLearners',
          defaultMessage: 'Which learners are registered but not yet enrolled in any courses?',
        }),
        slug: 'registered-unenrolled-learners',
      }],
    },
    enrolledLearners: {
      ref: React.createRef(),
      description: intl.formatMessage({
        id: 'adminPortal.cards.enrolledOneCourse',
        defaultMessage: 'learners enrolled in at least one course',
      }),
      icon: Check,
      actions: [{
        label: intl.formatMessage({
          id: 'adminPortal.cards.enrolledLearners',
          defaultMessage: 'How many courses are learners enrolled in?',
        }),
        slug: 'enrolled-learners',
      }, {
        label: intl.formatMessage({
          id: 'adminPortal.cards.enrolledLearnersInactiveCourses',
          defaultMessage: 'Who is no longer enrolled in a current course?',
        }),
        slug: 'enrolled-learners-inactive-courses',
      }],
    },
    activeLearners: {
      ref: React.createRef(),
      description: intl.formatMessage({
        id: 'adminPortal.cards.activeLearnersPastWeek',
        defaultMessage: 'active learners in the past week',
      }),
      icon: RemoveRedEye,
      actions: [{
        label: intl.formatMessage({
          id: 'adminPortal.cards.learnersActiveWeek',
          defaultMessage: 'Who are my top active learners?',
        }),
        slug: 'learners-active-week',
      }, {
        label: intl.formatMessage({
          id: 'adminPortal.cards.learnersInactiveWeek',
          defaultMessage: 'Who has not been active for over a week?',
        }),
        slug: 'learners-inactive-week',
      }, {
        label: intl.formatMessage({
          id: 'adminPortal.cards.learnersInactiveMonth',
          defaultMessage: 'Who has not been active for over a month?',
        }),
        slug: 'learners-inactive-month',
      }],
    },
    courseCompletions: {
      ref: React.createRef(),
      description: 'course completions',
      icon: Award,
      actions: [{
        label: intl.formatMessage({
          id: 'adminPortal.cards.completedLearners',
          defaultMessage: 'How many courses have been completed by learners?',
        }),
        slug: 'completed-learners',
      }, {
        label: intl.formatMessage({
          id: 'adminPortal.cards.completedLearnersWeek',
          defaultMessage: 'Who completed a course in the past week?',
        }),
        slug: 'completed-learners-week',
      }],
    },
  };

  const renderCard = ({ title, cardKey }) => {
    const card = cards[cardKey];

    return (
      <div
        className="col-xs-12 col-md-6 col-xl-3 mb-3 d-flex"
        key={cardKey}
      >
        <NumberCard
          id={cardKey}
          title={title}
          description={card.description}
          icon={card.icon}
          detailActions={card.actions}
        />
      </div>
    );
  };

  const data = {
    activeLearners: activeLearners.past_week,
    numberOfUsers,
    courseCompletions,
    enrolledLearners,
  };

  return Object.keys(cards).map(cardKey => (
    renderCard({
      title: data[cardKey],
      cardKey,
    })
  ));
};

AdminCards.propTypes = {
  activeLearners: PropTypes.shape({
    past_week: PropTypes.number.isRequired,
    past_month: PropTypes.number.isRequired,
  }).isRequired,
  numberOfUsers: PropTypes.number.isRequired,
  courseCompletions: PropTypes.number.isRequired,
  enrolledLearners: PropTypes.number.isRequired,
};

export default AdminCards;
