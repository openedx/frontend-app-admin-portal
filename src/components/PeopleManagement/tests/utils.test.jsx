import { getAssignmentsByState, transformLearnerContentAssignment, getTransformedAllocatedAssignments } from '../utils';
import { ASSIGNMENT_TYPES } from '../constants';

describe('getAssignmentsByState', () => {
  const mockAssignments = [
    {
      uuid: '1',
      state: ASSIGNMENT_TYPES.ALLOCATED,
      title: 'Allocated Assignment',
    },
    {
      uuid: '2',
      state: ASSIGNMENT_TYPES.ACCEPTED,
      title: 'Accepted Assignment',
    },
    {
      uuid: '3',
      state: ASSIGNMENT_TYPES.CANCELED,
      title: 'Canceled Assignment',
    },
    {
      uuid: '4',
      state: ASSIGNMENT_TYPES.EXPIRED,
      title: 'Expired Assignment',
    },
    {
      uuid: '5',
      state: ASSIGNMENT_TYPES.ERRORED,
      title: 'Errored Assignment',
    },
    {
      uuid: '6',
      state: ASSIGNMENT_TYPES.REVERSED,
      title: 'Reversed Assignment',
    },
    {
      uuid: '7',
      state: 'unknown',
      title: 'Unknown State Assignment',
    },
  ];

  it('should handle empty array input', () => {
    const result = getAssignmentsByState([]);
    expect(result).toEqual([]);
  });

  it('should handle undefined input', () => {
    const result = getAssignmentsByState(undefined);
    expect(result).toEqual([]);
  });

  it('should handle assignments with missing state', () => {
    const assignmentsWithMissingState = [
      {
        uuid: '8',
        title: 'Assignment with no state',
      },
    ];
    const result = getAssignmentsByState(assignmentsWithMissingState);
    expect(result).toEqual([]);
  });

  it('should handle assignments with unknown state', () => {
    const assignmentsWithUnknownState = [
      {
        uuid: '9',
        state: 'unknown_state',
        title: 'Assignment with unknown state',
      },
    ];
    const result = getAssignmentsByState(assignmentsWithUnknownState);
    expect(result).toEqual([]);
  });

  it('should preserve assignment properties', () => {
    const result = getAssignmentsByState(mockAssignments);
    const allocatedAssignment = result.find(assignment => assignment.uuid === '1');
    expect(allocatedAssignment).toBeDefined();
    expect(allocatedAssignment.title).toBe('Allocated Assignment');
  });
});

describe('transformLearnerContentAssignment', () => {
  const mockLearnerContentAssignment = {
    contentKey: 'course-v1:edX+DemoX+Demo_Course',
    parentContentKey: 'course-v1:edX+DemoX+Demo_Course_2023',
    isAssignedCourseRun: true,
    contentTitle: 'Demo Course',
    contentMetadata: {
      partners: [{ name: 'edX' }],
      courseType: 'verified',
      startDate: '2023-01-01T00:00:00Z',
    },
    earliestPossibleExpiration: {
      date: '2023-12-31T23:59:59Z',
    },
    policyUuid: 'policy-123',
  };

  it('should transform a learner content assignment correctly', () => {
    const result = transformLearnerContentAssignment(mockLearnerContentAssignment);

    expect(result).toEqual({
      displayName: 'Demo Course',
      orgName: 'edX',
      courseType: 'verified',
      courseKey: 'course-v1:edX+DemoX+Demo_Course_2023',
      courseRunStatus: 'assigned',
      startDate: '2023-01-01T00:00:00Z',
      enrollBy: '2023-12-31T23:59:59Z',
      policyUuid: 'policy-123',
    });
  });

  it('should handle missing optional fields', () => {
    const assignmentWithMissingFields = {
      contentKey: 'course-v1:edX+DemoX+Demo_Course',
      contentTitle: 'Demo Course',
      isAssignedCourseRun: false,
    };

    const result = transformLearnerContentAssignment(assignmentWithMissingFields);

    expect(result).toEqual({
      displayName: 'Demo Course',
      orgName: undefined,
      courseType: undefined,
      courseKey: 'course-v1:edX+DemoX+Demo_Course',
      courseRunStatus: 'assigned',
      startDate: undefined,
      enrollBy: undefined,
      policyUuid: undefined,
    });
  });

  it('should use contentKey when isAssignedCourseRun is false', () => {
    const assignment = {
      ...mockLearnerContentAssignment,
      isAssignedCourseRun: false,
    };

    const result = transformLearnerContentAssignment(assignment);

    expect(result.courseKey).toBe('course-v1:edX+DemoX+Demo_Course');
  });

  it('should use parentContentKey when isAssignedCourseRun is true', () => {
    const assignment = {
      ...mockLearnerContentAssignment,
      isAssignedCourseRun: true,
    };

    const result = transformLearnerContentAssignment(assignment);

    expect(result.courseKey).toBe('course-v1:edX+DemoX+Demo_Course_2023');
  });

  it('should fallback to contentKey when parentContentKey is missing', () => {
    const assignment = {
      ...mockLearnerContentAssignment,
      isAssignedCourseRun: true,
      parentContentKey: undefined,
    };

    const result = transformLearnerContentAssignment(assignment);

    expect(result.courseKey).toBe('course-v1:edX+DemoX+Demo_Course');
  });
});

describe('getTransformedAllocatedAssignments', () => {
  const mockAssignments = [
    {
      contentKey: 'course-v1:edX+DemoX+Demo_Course1',
      parentContentKey: 'course-v1:edX+DemoX+Demo_Course1_2023',
      isAssignedCourseRun: true,
      contentTitle: 'Demo Course 1',
      contentMetadata: {
        partners: [{ name: 'edX' }],
        courseType: 'verified',
        startDate: '2023-01-01T00:00:00Z',
      },
      earliestPossibleExpiration: {
        date: '2023-12-31T23:59:59Z',
      },
      policyUuid: 'policy-123',
    },
    {
      contentKey: 'course-v1:edX+DemoX+Demo_Course2',
      contentTitle: 'Demo Course 2',
      isAssignedCourseRun: false,
      contentMetadata: {
        partners: [{ name: 'edX' }],
        courseType: 'audit',
        startDate: '2023-02-01T00:00:00Z',
      },
      earliestPossibleExpiration: {
        date: '2023-12-31T23:59:59Z',
      },
      policyUuid: 'policy-456',
    },
  ];

  it('should transform an array of assignments correctly', () => {
    const result = getTransformedAllocatedAssignments(mockAssignments);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      displayName: 'Demo Course 1',
      orgName: 'edX',
      courseType: 'verified',
      courseKey: 'course-v1:edX+DemoX+Demo_Course1_2023',
      courseRunStatus: 'assigned',
      startDate: '2023-01-01T00:00:00Z',
      enrollBy: '2023-12-31T23:59:59Z',
      policyUuid: 'policy-123',
    });
    expect(result[1]).toEqual({
      displayName: 'Demo Course 2',
      orgName: 'edX',
      courseType: 'audit',
      courseKey: 'course-v1:edX+DemoX+Demo_Course2',
      courseRunStatus: 'assigned',
      startDate: '2023-02-01T00:00:00Z',
      enrollBy: '2023-12-31T23:59:59Z',
      policyUuid: 'policy-456',
    });
  });

  it('should handle empty array input', () => {
    const result = getTransformedAllocatedAssignments([]);
    expect(result).toEqual([]);
  });

  it('should handle assignments with missing optional fields', () => {
    const assignmentsWithMissingFields = [
      {
        contentKey: 'course-v1:edX+DemoX+Demo_Course3',
        contentTitle: 'Demo Course 3',
        isAssignedCourseRun: false,
      },
    ];

    const result = getTransformedAllocatedAssignments(assignmentsWithMissingFields);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      displayName: 'Demo Course 3',
      orgName: undefined,
      courseType: undefined,
      courseKey: 'course-v1:edX+DemoX+Demo_Course3',
      courseRunStatus: 'assigned',
      startDate: undefined,
      enrollBy: undefined,
      policyUuid: undefined,
    });
  });

  it('should maintain the order of assignments', () => {
    const result = getTransformedAllocatedAssignments(mockAssignments);
    expect(result[0].displayName).toBe('Demo Course 1');
    expect(result[1].displayName).toBe('Demo Course 2');
  });
});
