import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Route } from 'react-router-dom';

import CoursewareNav from './CoursewareNav';
import CoursewareContent from './CoursewareContent';
import UnitNav from './CoursewareContent/UnitNav'

class Courseware extends React.Component {
  componentDidMount() {
    this.props.getCourseOutline(this.props.match.params.courseId);
  }

  renderCourseContent(routeProps) {
    if (this.props.unitNodeList) {
      const currentNode = this.props.unitNodeList.find(
        current => current.id == routeProps.match.params.unitId
      );
      const adjacentUnits = this.getAdjacentUnits(routeProps.match.params.unitId);
      return (
        <div>
          <CoursewareContent node={currentNode} />
          <UnitNav 
            previous={adjacentUnits.previous}
            next={adjacentUnits.next}
          />
        </div>
      );
    }
    return null;
  }

  getAdjacentUnits(unitId) {
    let previousPath, nextPath;

    if (this.props.unitNodeList) {
      const nodeIndex = this.props.unitNodeList.findIndex(
        current => current.id == unitId
      );

      if (nodeIndex > 0) {
        previousPath = `${this.props.match.url}/${this.props.unitNodeList[nodeIndex-1].id}`;
      }

      if (nodeIndex < this.props.unitNodeList.length - 1) {
        nextPath = `${this.props.match.url}/${this.props.unitNodeList[nodeIndex+1].id}`;
      }
    }
    return {
      previous: this.getUnitNavOnClick(previousPath),
      next: this.getUnitNavOnClick(nextPath),
    };
  }

  getUnitNavOnClick(path) {
    if (!path) {
      return;
    }

    const unitNavOnClick = (e) => {
      e.preventDefault();
      this.props.history.push(path);
    };

    return unitNavOnClick.bind(this);
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-3">
            <CoursewareNav courseOutline={this.props.courseOutline} />
          </div>
          <div className="col-9">
            <Route
              path={`${this.props.match.url}/:unitId`}
              render={routeProps => this.renderCourseContent(routeProps)}
            />
          </div>

        </div>
      </div>
    );
  }
}

Courseware.defaultProps = {
  courseOutline: {
    displayName: '',
    descendants: [],
  },
  unitNodeList: [],
  getCourseOutline: () => {},
};

Courseware.propTypes = {
  courseOutline: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  unitNodeList: PropTypes.array,
  getCourseOutline: PropTypes.func,
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
    }).isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default withRouter(Courseware);
