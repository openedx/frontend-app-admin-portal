import { camelCaseObject } from '@edx/frontend-platform';

const rawTestCourseData = require('./testCourseData.json');
const rawTestCourseHighlights = require('./testCourseHighlights.json');

export const testCourseHighlightsData = camelCaseObject(rawTestCourseHighlights);
rawTestCourseData.forEach((element, index) => {
  if (!element.objectID) {
    rawTestCourseData[index].objectId = index + 1;
  }
});
export const testCourseData = rawTestCourseData.map(x => x);
