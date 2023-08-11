import { testCourseHighlightsData, testCourseData } from './utils';
import { initialStateValue, ContentHighlightsContext } from './context';

const rawTestCourseData = require('./testCourseData.json');
const rawTestCourseHighlights = require('./testCourseHighlights.json');
const testCourseAggregation = require('./testCourseAggregation.json');
const testHighlightSet = require('./testHighlightSet.json');

export {
  initialStateValue,
  ContentHighlightsContext,
  rawTestCourseData,
  rawTestCourseHighlights,
  testCourseAggregation,
  testHighlightSet,
  testCourseData,
  testCourseHighlightsData,
};
