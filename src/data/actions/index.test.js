import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';

import { fetchCourseOutline } from './index';
import {
  STARTED_FETCHING_COURSE_OUTLINE,
  FINISHED_FETCHING_COURSE_OUTLINE,
  GET_COURSE_OUTLINE,
} from '../constants/ActionType';

const mockStore = configureMockStore([thunk]);

describe('actions', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  describe('fetchCourseOutline', () => {
    it('fetches outline and converts flat map to nested tree', () => {
      const courseId = 'course-123 demo test course';
      const responseOutline = {
        root: 'course-123',
        blocks: {
          'course-123': {
            id: 'course-123',
            display_name: 'Root Node',
            student_view_url: 'http://www.example.com/',
            type: 'Course',
            descendants: ['chapter-1', 'chapter-2'],
          },
          'chapter-1': {
            id: 'chapter-1',
            display_name: 'Chapter 1',
            student_view_url: 'http://www.example.com/chapter1',
            type: 'Chapter',
            descendants: ['section-1'],
          },
          'chapter-2': {
            id: 'chapter-2',
            display_name: 'Chapter 2',
            student_view_url: 'http://www.example.com/chapter2',
            type: 'Chapter',
            descendants: [],
          },
          'section-1': {
            id: 'section-1',
            display_name: 'Section 1',
            student_view_url: 'http://www.example.com/chapter1/section2',
            type: 'Section',
            descendants: [],
          },
        },
      };
      fetchMock.getOnce(`http://localhost:18000/api/courses/v1/blocks/?course_id=${encodeURIComponent(courseId)}&username=staff&depth=all&nav_depth=3&block_types_filter=course,chapter,sequential,vertical`, {
        body: JSON.stringify(responseOutline),
        headers: { 'content-type': 'application/json' },
      });

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
          {
            id: 'chapter-2',
            displayName: 'Chapter 2',
            displayUrl: 'http://www.example.com/chapter2',
            type: 'Chapter',
            descendants: [],
          },
        ],
      };

      const expectedActions = [
        { type: STARTED_FETCHING_COURSE_OUTLINE },
        { type: GET_COURSE_OUTLINE, outline: generatedOutline },
        { type: FINISHED_FETCHING_COURSE_OUTLINE },
      ];
      const store = mockStore();

      return store.dispatch(fetchCourseOutline(courseId)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });
});
