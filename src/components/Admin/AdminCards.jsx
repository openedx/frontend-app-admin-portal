import React from 'react';
import PropTypes from 'prop-types';

import NumberCard from '../../components/NumberCard';

import { features } from '../../config';

class AdminCards extends React.Component {
  constructor(props) {
    super(props);

    this.cards = {
      numberOfUsers: {
        ref: React.createRef(),
        description: 'total number of learners registered',
        iconClassName: 'fa fa-users',
        actions: [{
          label: 'Which learners are registered but not yet enrolled in any courses?',
          slug: 'registered',
        }],
      },
      enrolledLearners: {
        ref: React.createRef(),
        description: 'learners enrolled in at least one course',
        iconClassName: 'fa fa-check',
        actions: [{
          label: 'How many courses are learners enrolled in?',
          slug: 'enrolled',
        }, {
          label: 'Who is no longer enrolled in a current course?',
          slug: 'unenrolled',
        }],
      },
      activeLearners: {
        ref: React.createRef(),
        description: 'active learners in the past week',
        iconClassName: 'fa fa-eye',
        actions: [{
          label: 'Who are my top active learners?',
          slug: 'active',
        }, {
          label: 'Who has not been active for over a week?',
          slug: 'inactive-week',
        }, {
          label: 'Who has not been active for over a month?',
          slug: 'inactive-month',
        }],
      },
      courseCompletions: {
        ref: React.createRef(),
        description: 'course completions',
        iconClassName: 'fa fa-trophy',
        actions: [{
          label: 'How many courses have been completed by learners?',
          slug: 'completed',
        }, {
          label: 'Who completed a course in the past week?',
          slug: 'completed-week',
        }],
      },
    };
  }

  renderCard({ title, cardKey }) {
    const card = this.cards[cardKey];

    return (
      <div
        className="col-xs-12 col-md-6 col-xl-3 mb-3"
        key={cardKey}
      >
        <NumberCard
          title={title}
          description={card.description}
          iconClassName={card.iconClassName}
          // Only use the card detail actions if the feature flag is enabled
          detailActions={features.DASHBOARD_V2 ? card.actions : null}
        />
      </div>
    );
  }

  render() {
    const {
      activeLearners,
      numberOfUsers,
      courseCompletions,
      enrolledLearners,
    } = this.props;

    const data = {
      activeLearners: activeLearners.past_week,
      numberOfUsers,
      courseCompletions,
      enrolledLearners,
    };

    return (
      <div className="row mt-3 equal-col-height">
        {Object.keys(this.cards).map(cardKey =>
          this.renderCard({ title: data[cardKey], cardKey }))}
      </div>
    );
  }
}

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
