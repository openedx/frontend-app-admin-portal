import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

function CoursewareContent(props) {
  return (
    <div>
      <Helmet>
        <title>Course</title>
      </Helmet>
      <div className="embed-responsive embed-responsive-1by1" key={props.node.id}>
        <iframe src={props.node.displayUrl} title={props.node.displayName} />
      </div>
    </div>
  );
}

CoursewareContent.defaultProps = {
  node: {
    id: '',
    displayUrl: '',
    displayName: '',
  },
};

CoursewareContent.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayUrl: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
  }),
};

export default CoursewareContent;
