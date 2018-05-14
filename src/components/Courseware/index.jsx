import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';

import CoursewareNav from './CoursewareNav';
import CoursewareContent from './CoursewareContent';
import VerticalNav from './CoursewareContent/VerticalNav'

class Courseware extends React.Component {
  componentDidMount() {
    this.props.getCourseOutline(this.props.match.params.courseId);
  }

  renderCourseContent(routeProps) {
    if (this.props) {
      let adjacentNodes = this.getAdjacentVerticalNodes(routeProps.location.state.node);
      console.log(adjacentNodes);
      return (
        <div>
          <CoursewareContent node={routeProps.location.state.node} />
          <VerticalNav 
            previousPath={`${this.props.match.url}/${adjacentNodes.previousNode.id}`}
            previousNode={adjacentNodes.previousNode}
            nextPath={`${this.props.match.url}/${adjacentNodes.nextNode.id}`}
            nextNode={adjacentNodes.nextNode}
          />
        </div>
      );
    }
    return null;
  }

  getAdjacentVerticalNodes(node) {
    return {
      previousNode: this.props.courseOutline.descendants.filter(
        descendant => descendant.verticalIndex == node.verticalIndex-1 
      )[0],
      nextNode: this.props.courseOutline.descendants.filter(
        descendant => descendant.verticalIndex == node.verticalIndex+1 
      )[0],
    }
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
              path={`${this.props.match.url}/:verticalId`}
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
  getCourseOutline: () => {},
};

Courseware.propTypes = {
  courseOutline: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  getCourseOutline: PropTypes.func,
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
    }).isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default Courseware;
