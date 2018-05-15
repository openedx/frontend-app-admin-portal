import courseOutline from './courseOutline';
import {
  STARTED_FETCHING_COURSE_OUTLINE,
  GET_COURSE_OUTLINE,
  FINISHED_FETCHING_COURSE_OUTLINE,
} from '../constants/ActionType';

const initialState = {
  outline: {},
  startedFetching: false,
  finishedFetching: false,
};

describe('courseOutline reducer', () => {
  it('has initial state', () => {
    expect(courseOutline(undefined, {})).toEqual(initialState);
  });

  it('adds outline', () => {
    const generatedOutline = {
      id: 'course-123',
      displayName: 'Root Node',
      displayUrl: 'http://www.example.com/',
      type: 'Course',
      descendants: [
        {
          id: 'chapter-1',
          displayName: 'Chapter 1',
          displayUrl: 'http://www.example.com/chapter1',
          type: 'Chapter',
          descendants: [
            {
              id: 'section-1',
              displayName: 'Section 1',
              displayUrl: 'http://www.example.com/chapter1/section2',
              type: 'Section',
              descendants: [],
            },
          ],
        },
      ],
    };
    const expected = {
      ...initialState,
      outline: generatedOutline,
    };
    expect(courseOutline(undefined, { type: GET_COURSE_OUTLINE, outline: generatedOutline }))
      .toEqual(expected);
  });

  it('updates started fetching posts state', () => {
    const expected = {
      ...initialState,
      startedFetching: true,
      finishedFetching: false,
    };
    expect(courseOutline(undefined, { type: STARTED_FETCHING_COURSE_OUTLINE })).toEqual(expected);
  });

  it('updates finished fetching posts state', () => {
    const expected = {
      ...initialState,
      startedFetching: false,
      finishedFetching: true,
    };
    expect(courseOutline(undefined, { type: FINISHED_FETCHING_COURSE_OUTLINE })).toEqual(expected);
  });
});
