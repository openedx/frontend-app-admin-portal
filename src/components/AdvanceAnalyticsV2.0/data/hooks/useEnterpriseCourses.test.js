import { renderHook } from '@testing-library/react';
import useEnterpriseCourses, { transformCourseOptions } from './useEnterpriseCourses';

describe('useEnterpriseCourses', () => {
  it('returns an empty data array and isLoading false', () => {
    const { result } = renderHook(() => useEnterpriseCourses());
    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});

describe('transformCourseOptions', () => {
  it('transforms valid course objects into select options', () => {
    const input = [
      { course_key: 'course-v1:edX+TST101+2024', course_title: 'Test Course 1' },
      { course_key: 'course-v1:edX+TST102+2024', course_title: 'Test Course 2' },
    ];

    const result = transformCourseOptions(input);

    expect(result).toEqual([
      { value: 'course-v1:edX+TST101+2024', label: 'Test Course 1' },
      { value: 'course-v1:edX+TST102+2024', label: 'Test Course 2' },
    ]);
  });

  it('handles missing keys or titles gracefully', () => {
    const input = [
      { course_key: null, course_title: null },
      {},
    ];

    const result = transformCourseOptions(input);

    expect(result).toEqual([
      { value: '', label: '' },
      { value: '', label: '' },
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(transformCourseOptions([])).toEqual([]);
  });

  it('returns empty array if no argument is passed', () => {
    expect(transformCourseOptions()).toEqual([]);
  });
});

describe('useEnterpriseCourses', () => {
  it('returns an empty array and isLoading=false', () => {
    const { result } = renderHook(() => useEnterpriseCourses());

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
