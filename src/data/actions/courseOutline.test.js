import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { fetchCourseOutline } from './courseOutline';
import {
  STARTED_FETCHING_COURSE_OUTLINE,
  FINISHED_FETCHING_COURSE_OUTLINE,
  GET_COURSE_OUTLINE,
} from '../constants/courseOutline';

const mockStore = configureMockStore([thunk]);
const axiosMock = new MockAdapter(axios);

describe('actions', () => {
  afterEach(() => {
    axiosMock.reset();
    axiosMock.restore();
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
            type: 'course',
            descendants: ['chapter-1', 'chapter-2'],
          },
          'chapter-1': {
            id: 'chapter-1',
            display_name: 'Chapter 1',
            student_view_url: 'http://www.example.com/chapter1',
            type: 'chapter',
            descendants: ['section-1'],
          },
          'chapter-2': {
            id: 'chapter-2',
            display_name: 'Chapter 2',
            student_view_url: 'http://www.example.com/chapter2',
            type: 'chapter',
            descendants: [],
          },
          'section-1': {
            id: 'section-1',
            display_name: 'Section 1',
            student_view_url: 'http://www.example.com/chapter1/section2',
            type: 'sequential',
            descendants: ['unit-1'],
          },
          'unit-1': {
            id: 'unit-1',
            display_name: 'Unit 1',
            student_view_url: 'http://www.example.com/chapter1/section2/unit1',
            type: 'vertical',
            descendants: [],
          },
        },
      };
      axiosMock.onGet(`http://localhost:18000/api/courses/v1/blocks/?course_id=${encodeURIComponent(courseId)}&username=staff&depth=all&nav_depth=3&block_types_filter=course,chapter,sequential,vertical`)
        .replyOnce(200, JSON.stringify(responseOutline));

      const generatedOutline = {
        id: 'course-123',
        displayName: 'Root Node',
        displayUrl: 'http://www.example.com/',
        type: 'course',
        descendants: [
          {
            id: 'chapter-1',
            displayName: 'Chapter 1',
            displayUrl: 'http://www.example.com/chapter1',
            type: 'chapter',
            descendants: [
              {
                id: 'section-1',
                displayName: 'Section 1',
                displayUrl: 'http://www.example.com/chapter1/section2',
                type: 'sequential',
                descendants: [
                  {
                    id: 'unit-1',
                    displayName: 'Unit 1',
                    displayUrl: 'http://www.example.com/chapter1/section2/unit1',
                    type: 'vertical',
                    descendants: [],
                  },
                ],
              },
            ],
          },
          {
            id: 'chapter-2',
            displayName: 'Chapter 2',
            displayUrl: 'http://www.example.com/chapter2',
            type: 'chapter',
            descendants: [],
          },
        ],
      };

      const generatedUnitNodeList = [
        {
          id: 'unit-1',
          displayName: 'Unit 1',
          displayUrl: 'http://www.example.com/chapter1/section2/unit1',
          type: 'vertical',
        },
      ];

      const expectedActions = [
        { type: STARTED_FETCHING_COURSE_OUTLINE },
        {
          type: GET_COURSE_OUTLINE,
          outline: generatedOutline,
          unitNodeList: generatedUnitNodeList,
        },
        { type: FINISHED_FETCHING_COURSE_OUTLINE },
      ];
      const store = mockStore();

      return store.dispatch(fetchCourseOutline(courseId)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });
});
