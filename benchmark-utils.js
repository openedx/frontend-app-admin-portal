const { sum } = require('lodash');

/**
 * Original implementation of calculateMovingAverage
 *
 * Calculate moving average for the given time series data.
 *
 * period will denote the number of periods to consider for the moving average calculation.
 * e.g. 3 would mean 3-day moving average.
 *
 * For a 3-period moving average, the calculation will be as follows:
 *  1. First item will be the same as the original data.
 *  2. Second item will be the average of the first 2 items.
 *  3. Third item will be the average of the first 3 items.
 *  4. And so on...
 *
 * @param {Array} timeSeriesData - List of objects with date and count keys.
 * @param {String} countKey - Key to access the count entry in the given data.
 * @param {Number} period - Number of periods to consider for the moving average calculation.
 */
const calculateMovingAverage = (timeSeriesData, countKey, period) => {
  const modifiedData = [];
  for (let i = 0; i < timeSeriesData.length; i++) {
    // Set start to 0 for the first `N` entries where `N` is the `period`.
    const start = i < period ? 0 : (i - period + 1);
    const end = i + 1;

    // Calculate moving average for the given period.
    const arraySlice = timeSeriesData.slice(start, end).map((item) => item[countKey]);
    const movingAverage = sum(arraySlice) / arraySlice.length;
    modifiedData.push({ ...timeSeriesData[i], [countKey]: movingAverage });
  }
  return modifiedData;
};

/**
 * Optimized implementation of calculateMovingAverage
 *
 * This implementation uses a sliding window approach to calculate the moving average,
 * which reduces the time complexity from O(n²) to O(n).
 *
 * @param {Array} timeSeriesData - List of objects with date and count keys.
 * @param {String} countKey - Key to access the count entry in the given data.
 * @param {Number} period - Number of periods to consider for the moving average calculation.
 */
const calculateMovingAverageOptimized = (timeSeriesData, countKey, period) => {
  if (timeSeriesData.length === 0) {
    return [];
  }

  const modifiedData = [];
  let windowSum = 0;
  let count = 0;

  // Process the first window
  for (let i = 0; i < Math.min(period, timeSeriesData.length); i++) {
    windowSum += timeSeriesData[i][countKey];
    count++;
    modifiedData.push({
      ...timeSeriesData[i],
      [countKey]: windowSum / count
    });
  }

  // Process the rest using sliding window
  for (let i = period; i < timeSeriesData.length; i++) {
    windowSum += timeSeriesData[i][countKey] - timeSeriesData[i - period][countKey];
    modifiedData.push({
      ...timeSeriesData[i],
      [countKey]: windowSum / period
    });
  }

  return modifiedData;
};

/**
 * Apply calculation on the given time series data using the original implementation.
 *
 * @param {Array} timeSeriesData - List of objects with date and count keys.
 * @param {String} countKey - Key to access the count entry in the given data.
 * @param {String} calculation - Calculation to apply on the given data.
 */
const applyCalculationOriginal = (timeSeriesData, countKey, calculation) => {
  // Extract the period from the calculation string
  const match = calculation.match(/moving-average-(\d+)-period/);
  if (match) {
    const period = parseInt(match[1], 10);
    return calculateMovingAverage(timeSeriesData, countKey, period);
  }
  return timeSeriesData;
};

/**
 * Apply calculation on the given time series data using the optimized implementation.
 *
 * @param {Array} timeSeriesData - List of objects with date and count keys.
 * @param {String} countKey - Key to access the count entry in the given data.
 * @param {String} calculation - Calculation to apply on the given data.
 */
const applyCalculationOptimized = (timeSeriesData, countKey, calculation) => {
  // Extract the period from the calculation string
  const match = calculation.match(/moving-average-(\d+)-period/);
  if (match) {
    const period = parseInt(match[1], 10);
    return calculateMovingAverageOptimized(timeSeriesData, countKey, period);
  }
  return timeSeriesData;
};

module.exports = {
  calculateMovingAverage,
  calculateMovingAverageOptimized,
  applyCalculationOriginal,
  applyCalculationOptimized
};
