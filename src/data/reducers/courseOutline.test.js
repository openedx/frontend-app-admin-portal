import courseOutline from './courseOutline';
import {
  FETCH_COURSE_OUTLINE_REQUEST,
  FETCH_COURSE_OUTLINE_SUCCESS,
  FETCH_COURSE_OUTLINE_FAILURE,
} from '../constants/courseOutline';

const initialState = {
  outline: undefined,
  unitNodeList: undefined,
  loading: false,
  error: null,
};

describe('courseOutline reducer', () => {
  it('has initial state', () => {
    expect(courseOutline(undefined, {})).toEqual(initialState);
  });

  it('updates fetch outline request state', () => {
    const expected = {
      ...initialState,
      loading: true,
    };
    expect(courseOutline(undefined, {
      type: FETCH_COURSE_OUTLINE_REQUEST,
    })).toEqual(expected);
  });

  it('updates fetch outline success state', () => {
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
    expect(courseOutline(undefined, {
      type: FETCH_COURSE_OUTLINE_SUCCESS,
      payload: {
        outline: generatedOutline,
      },
    })).toEqual(expected);
  });

  it('updates fetch outline failure state', () => {
    const error = Error('Network Request');
    const expected = {
      ...initialState,
      error,
    };
    expect(courseOutline(undefined, {
      type: FETCH_COURSE_OUTLINE_FAILURE,
      payload: { error },
    })).toEqual(expected);
  });
});
