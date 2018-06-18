import {
  FETCH_COURSE_OUTLINE_REQUEST,
  FETCH_COURSE_OUTLINE_SUCCESS,
  FETCH_COURSE_OUTLINE_FAILURE,
} from '../constants/courseOutline';
import LmsApiService from '../services/LmsApiService';

const fetchCourseOutlineRequest = () => ({ type: FETCH_COURSE_OUTLINE_REQUEST });
const fetchCourseOutlineSuccess = (outline, unitNodeList) => ({
  type: FETCH_COURSE_OUTLINE_SUCCESS,
  payload: {
    outline,
    unitNodeList,
  },
});
const fetchCourseOutlineFailure = error => ({
  type: FETCH_COURSE_OUTLINE_FAILURE,
  payload: { error },
});

const transformNode = node => (
  {
    id: node.id,
    displayName: node.display_name,
    displayUrl: node.student_view_url,
    type: node.type,
  }
);

// Return object that contains nested descendant nodes
const createTreeNode = (node, blocks) => (
  {
    ...transformNode(node),
    descendants: node.descendants &&
      node.descendants
        .filter(descendant => blocks[descendant])
        .map(descendant => createTreeNode(blocks[descendant], blocks)),
  }
);


const createUnitNodeList = (node, blocks) => {
  if (node.type === 'vertical') {
    return [transformNode(node, blocks)];
  } else if (!node.descendants) {
    return [];
  }

  const reducer = (accumulator, currentValue) => (
    accumulator.concat(createUnitNodeList(blocks[currentValue], blocks))
  );

  return node.descendants.reduce(reducer, []);
};

const buildNavigationData = (blockData) => {
  const rootBlock = blockData.blocks[blockData.root];
  return {
    outline: createTreeNode(rootBlock, blockData.blocks),
    unitNodeList: createUnitNodeList(rootBlock, blockData.blocks),
  };
};

const fetchCourseOutline = courseId => (
  (dispatch) => {
    dispatch(fetchCourseOutlineRequest());
    return LmsApiService.fetchCourseOutline(courseId)
      .then(response => buildNavigationData(response.data))
      .then((navigationData) => {
        dispatch(fetchCourseOutlineSuccess(navigationData.outline, navigationData.unitNodeList));
      })
      .catch((error) => {
        dispatch(fetchCourseOutlineFailure(error));
      });
  }
);

export { // eslint-disable-line TODO: remove eslint disable when exporting more action creators
  fetchCourseOutline, // eslint-disable-line import/prefer-default-export
};
