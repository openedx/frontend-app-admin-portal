import {
  generateKey,
  advanceAnalyticsQueryKeys,
  analyticsDataTableKeys,
} from './constants';

describe('generateKey', () => {
  it('should generate query key with correct structure', () => {
    const key = 'skills';
    const uuid = 'enterprise-123';
    const options = { foo: 'bar', baz: 42 };

    const result = generateKey(key, uuid, options);
    expect(result).toEqual(['admin-analytics', 'skills', 'enterprise-123', 'bar', 42]);
  });

  it('should handle empty requestOptions object', () => {
    const result = generateKey('testKey', 'uuid-1', {});
    expect(result).toEqual(['admin-analytics', 'testKey', 'uuid-1']);
  });
});

describe('advanceAnalyticsQueryKeys', () => {
  const enterpriseId = 'ent-001';
  const requestOptions = { region: 'us-east', cohort: 'alpha' };

  it('should return correct key for all', () => {
    expect(advanceAnalyticsQueryKeys.all).toEqual(['admin-analytics']);
  });

  it('should return correct key for skills', () => {
    const result = advanceAnalyticsQueryKeys.skills(enterpriseId, requestOptions);
    expect(result).toEqual(['admin-analytics', 'skills', 'ent-001', 'us-east', 'alpha']);
  });

  it('should return correct key for completions', () => {
    const result = advanceAnalyticsQueryKeys.completions(enterpriseId, requestOptions);
    expect(result).toEqual(['admin-analytics', 'completions', 'ent-001', 'us-east', 'alpha']);
  });

  it('should return correct key for engagements', () => {
    const result = advanceAnalyticsQueryKeys.engagements(enterpriseId, requestOptions);
    expect(result).toEqual(['admin-analytics', 'engagements', 'ent-001', 'us-east', 'alpha']);
  });

  it('should return correct key for enrollments', () => {
    const result = advanceAnalyticsQueryKeys.enrollments(enterpriseId, requestOptions);
    expect(result).toEqual(['admin-analytics', 'enrollments', 'ent-001', 'us-east', 'alpha']);
  });

  it('should return correct key for enrollmentsTable', () => {
    const result = advanceAnalyticsQueryKeys.enrollmentsTable(enterpriseId, requestOptions);
    expect(result).toEqual(['admin-analytics', analyticsDataTableKeys.enrollments, 'ent-001', 'us-east', 'alpha']);
  });

  it('should return correct key for engagementsTable', () => {
    const result = advanceAnalyticsQueryKeys.engagementsTable(enterpriseId, requestOptions);
    expect(result).toEqual(['admin-analytics', analyticsDataTableKeys.engagements, 'ent-001', 'us-east', 'alpha']);
  });

  it('should return correct key for completionsTable', () => {
    const result = advanceAnalyticsQueryKeys.completionsTable(enterpriseId, requestOptions);
    expect(result).toEqual(['admin-analytics', analyticsDataTableKeys.completions, 'ent-001', 'us-east', 'alpha']);
  });

  it('should return correct key for leaderboardTable', () => {
    const result = advanceAnalyticsQueryKeys.leaderboardTable(enterpriseId, requestOptions);
    expect(result).toEqual(['admin-analytics', analyticsDataTableKeys.leaderboard, 'ent-001', 'us-east', 'alpha']);
  });

  it('should return correct key for aggregates', () => {
    const tabKey = 'engagements';
    const result = advanceAnalyticsQueryKeys.aggregates(enterpriseId, requestOptions, tabKey);
    expect(result).toEqual(['admin-analytics', 'aggregates-engagements', 'ent-001', 'us-east', 'alpha']);
  });
});

describe('advanceAnalyticsQueryKeys', () => {
  const enterpriseId = 'ent-001';
  const requestOptions = { region: 'us-east', cohort: 'alpha' };

  it('should return correct key for skills', () => {
    const result = advanceAnalyticsQueryKeys.skills(enterpriseId, requestOptions);
    expect(result).toEqual(['admin-analytics', 'skills', 'ent-001', 'us-east', 'alpha']);
  });

  it('should return correct key for completionsTable', () => {
    const result = advanceAnalyticsQueryKeys.completionsTable(enterpriseId, requestOptions);
    expect(result).toEqual(['admin-analytics', 'completionsTable', 'ent-001', 'us-east', 'alpha']);
  });
});
