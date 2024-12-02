// Jest test for utils.js

import { createIntl } from '@edx/frontend-platform/i18n';
import {
  applyCalculation, applyGranularity, constructChartHoverTemplate, calculateMarkerSizes,
} from './utils';
import { CALCULATION, GRANULARITY } from './constants';

describe('utils', () => {
  describe('applyCalculation', () => {
    it('should calculate moving average correctly', () => {
      const sampleData = [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 20 },
        { date: '2024-01-03', count: 30 },
        { date: '2024-01-04', count: 40 },
        { date: '2024-01-05', count: 50 },
      ];
      const result = applyCalculation(sampleData, 'count', CALCULATION.MOVING_AVERAGE_3_PERIODS);
      expect(result).toEqual([
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 15 },
        { date: '2024-01-03', count: 20 },
        { date: '2024-01-04', count: 30 },
        { date: '2024-01-05', count: 40 },
      ]);
    });
    it('should calculate moving average over 7 periods correctly', () => {
      const sampleData = [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 20 },
        { date: '2024-01-03', count: 30 },
        { date: '2024-01-04', count: 40 },
        { date: '2024-01-05', count: 50 },
        { date: '2024-01-06', count: 60 },
        { date: '2024-01-07', count: 70 },
        { date: '2024-01-08', count: 80 },
        { date: '2024-01-09', count: 90 },
        { date: '2024-01-10', count: 100 },
      ];
      const result = applyCalculation(sampleData, 'count', CALCULATION.MOVING_AVERAGE_7_PERIODS);
      expect(result).toEqual([
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 15 },
        { date: '2024-01-03', count: 20 },
        { date: '2024-01-04', count: 25 },
        { date: '2024-01-05', count: 30 },
        { date: '2024-01-06', count: 35 },
        { date: '2024-01-07', count: 40 },
        { date: '2024-01-08', count: 50 },
        { date: '2024-01-09', count: 60 },
        { date: '2024-01-10', count: 70 },
      ]);
    });
    it('should calculate total correctly', () => {
      const sampleData = [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 20 },
        { date: '2024-01-03', count: 30 },
        { date: '2024-01-04', count: 40 },
        { date: '2024-01-05', count: 50 },
        { date: '2024-01-06', count: 60 },
        { date: '2024-01-07', count: 70 },
        { date: '2024-01-08', count: 80 },
        { date: '2024-01-09', count: 90 },
        { date: '2024-01-10', count: 100 },
      ];
      const result = applyCalculation(sampleData, 'count', CALCULATION.TOTAL);
      expect(result).toEqual([
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 20 },
        { date: '2024-01-03', count: 30 },
        { date: '2024-01-04', count: 40 },
        { date: '2024-01-05', count: 50 },
        { date: '2024-01-06', count: 60 },
        { date: '2024-01-07', count: 70 },
        { date: '2024-01-08', count: 80 },
        { date: '2024-01-09', count: 90 },
        { date: '2024-01-10', count: 100 },
      ]);
    });
    it('should calculate running total correctly', () => {
      const sampleData = [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 20 },
        { date: '2024-01-03', count: 30 },
        { date: '2024-01-04', count: 40 },
        { date: '2024-01-05', count: 50 },
        { date: '2024-01-06', count: 60 },
        { date: '2024-01-07', count: 70 },
        { date: '2024-01-08', count: 80 },
        { date: '2024-01-09', count: 90 },
        { date: '2024-01-10', count: 100 },
      ];
      const result = applyCalculation(sampleData, 'count', CALCULATION.RUNNING_TOTAL);
      expect(result).toEqual([
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 30 },
        { date: '2024-01-03', count: 60 },
        { date: '2024-01-04', count: 100 },
        { date: '2024-01-05', count: 150 },
        { date: '2024-01-06', count: 210 },
        { date: '2024-01-07', count: 280 },
        { date: '2024-01-08', count: 360 },
        { date: '2024-01-09', count: 450 },
        { date: '2024-01-10', count: 550 },
      ]);
    });
  });
  describe('applyGranularity', () => {
    it('should apply daily granularity correctly', () => {
      const sampleData = [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 20 },
        { date: '2024-01-03', count: 30 },
        { date: '2024-01-04', count: 40 },
        { date: '2024-01-05', count: 50 },
        { date: '2024-01-06', count: 60 },
        { date: '2024-01-07', count: 70 },
        { date: '2024-01-08', count: 80 },
        { date: '2024-01-09', count: 90 },
        { date: '2024-01-10', count: 100 },
      ];
      const result = applyGranularity(sampleData, 'date', 'count', GRANULARITY.DAILY);
      expect(result).toEqual([
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 20 },
        { date: '2024-01-03', count: 30 },
        { date: '2024-01-04', count: 40 },
        { date: '2024-01-05', count: 50 },
        { date: '2024-01-06', count: 60 },
        { date: '2024-01-07', count: 70 },
        { date: '2024-01-08', count: 80 },
        { date: '2024-01-09', count: 90 },
        { date: '2024-01-10', count: 100 },
      ]);
    });
    it('should apply weekly granularity correctly', () => {
      const sampleData = [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 20 },
        { date: '2024-01-03', count: 30 },
        { date: '2024-01-04', count: 40 },
        { date: '2024-01-05', count: 50 },
        { date: '2024-01-06', count: 60 },
        { date: '2024-01-07', count: 70 },
        { date: '2024-01-08', count: 80 },
        { date: '2024-01-09', count: 90 },
        { date: '2024-01-10', count: 100 },
      ];
      const result = applyGranularity(sampleData, 'date', 'count', GRANULARITY.WEEKLY);
      expect(result).toEqual([
        { date: '2024-01-01', count: 210 },
        { date: '2024-01-07', count: 340 },
      ]);
    });
    it('should apply monthly granularity correctly', () => {
      const sampleData = [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 20 },
        { date: '2024-01-03', count: 30 },
        { date: '2024-01-04', count: 40 },
        { date: '2024-02-05', count: 50 },
        { date: '2024-02-06', count: 60 },
        { date: '2024-02-07', count: 70 },
        { date: '2024-02-08', count: 80 },
        { date: '2024-03-09', count: 90 },
        { date: '2024-03-10', count: 100 },
      ];
      const result = applyGranularity(sampleData, 'date', 'count', GRANULARITY.MONTHLY);
      expect(result).toEqual([
        { date: '2024-01-01', count: 100 },
        { date: '2024-02-05', count: 260 },
        { date: '2024-03-09', count: 190 },
      ]);
    });
    it('should apply quarterly granularity correctly', () => {
      const sampleData = [
        { date: '2023-11-01', count: 5 },
        { date: '2024-01-01', count: 10 },
        { date: '2024-02-02', count: 20 },
        { date: '2024-03-03', count: 30 },
        { date: '2024-04-04', count: 40 },
        { date: '2024-05-05', count: 50 },
        { date: '2024-06-06', count: 60 },
        { date: '2024-07-07', count: 70 },
        { date: '2024-08-08', count: 80 },
        { date: '2024-09-09', count: 90 },
        { date: '2024-10-10', count: 100 },
        { date: '2024-11-10', count: 100 },
        { date: '2024-12-10', count: 100 },
        { date: '2025-01-10', count: 100 },
        { date: '2025-02-10', count: 100 },
      ];
      const result = applyGranularity(sampleData, 'date', 'count', GRANULARITY.QUARTERLY);
      expect(result).toEqual([
        { date: '2023-11-01', count: 5 },
        { date: '2024-01-01', count: 60 },
        { date: '2024-04-04', count: 150 },
        { date: '2024-07-07', count: 240 },
        { date: '2024-10-10', count: 300 },
        { date: '2025-01-10', count: 200 },
      ]);
    });
  });
  describe('calculateMarkerSizes', () => {
    it('should calculate correct marker sizes based on a property', () => {
      const data = {
        topSkills: [
          {
            skill_name: 'Test Skill 1',
            completions: 5,
          },
          {
            skill_name: 'Test Skill 2',
            completions: 10,
          },
          {
            skill_name: 'Test Skill 3',
            completions: 15,
          },
        ],
      };
      const expectedSizes = [10, 35, 60];

      const result = calculateMarkerSizes(data?.topSkills, 'completions');

      expect(result).toEqual(expectedSizes);
    });

    it('should return empty array if data is empty', () => {
      const result = calculateMarkerSizes([], 'completions');
      expect(result).toEqual([]);
    });
  });
});

describe('constructChartHoverTemplate', () => {
  const intl = createIntl({
    locale: 'en',
    messages: {},
  });

  it('should construct a hover template', () => {
    const hoverInfo = { skill: 'value1', enrollments: 'value2' };
    const result = constructChartHoverTemplate(intl, hoverInfo);
    expect(result).toBe('Skill: value1<br>Enrollments: value2');
  });
});
