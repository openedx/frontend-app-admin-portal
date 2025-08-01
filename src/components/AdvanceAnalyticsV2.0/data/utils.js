import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { CHART_TYPES, CALCULATION } from './constants';
import messages from '../messages';

dayjs.extend(utc);
dayjs.extend(quarterOfYear);

const simulateURL = (activeTab, chartType) => {
  if (!Object.values(CHART_TYPES).includes(chartType)) {
    return activeTab;
  }
  return `${activeTab}/stats`;
};

/**
 * Constructs a chart hover template.
 *
 * @param {Object} intl - Internationalization object.
 * @param {Object} hoverInfo - Object containing hover information to show over chart data points.
 * @returns {string} The constructed chart hover template.
 */
export function constructChartHoverTemplate(intl, hoverInfo) {
  return Object.entries(hoverInfo)
    .map(([key, value]) => `${intl.formatMessage(messages[key])}: ${value}`)
    .join('<br>');
}

export default simulateURL;

/**
Apply granularity on the given data.

Given data `timeSeriesData` should be a list of objects with date and count keys.
Date entry should be against the given `dateKey` and count entry should be against the given `countKey`.
`granularity` should be one of the following values: 'day', 'week', 'month', 'quarter', 'year'.

 e.g. If granularity is 'week', the data will be grouped by week. It will do so by
 1. picking first element of the data.
 2. pick the subsequent entries that have the same `week` as the item from Point#1 and accumulate the count.
 3. If the week is different, add the accumulated count to the modified data and start accumulating for the new week.

  @param {Array} timeSeriesData - List of objects with date and count keys.
  @param {String} dateKey - Key to access the date entry in the given data.
  @param {String} countKey - Key to access the count entry in the given data.
  @param {OpUnitType} granularity - Granularity to apply on the given data.
*/
export const applyGranularity = (timeSeriesData, dateKey, countKey, granularity) => {
  if (timeSeriesData.length <= 1) {
    return timeSeriesData;
  }
  const modifiedData = [];
  let modifiedEntry = timeSeriesData[0];
  // Apply granularity on the given data.
  for (let i = 1; i < timeSeriesData.length; i++) {
    const item = timeSeriesData[i];
    const dateEntry = item[dateKey];
    const countEntry = item[countKey];
    const modifiedDate = modifiedEntry[dateKey];

    // If start-of value for the iteration is same as the start-of value for the modified entry, add the count.
    if (dayjs.utc(dateEntry).startOf(granularity).isSame(dayjs.utc(modifiedDate).startOf(granularity))) {
      modifiedEntry[countKey] += countEntry;
    } else {
      modifiedData.push(modifiedEntry);
      modifiedEntry = item;
    }
  }
  modifiedData.push(modifiedEntry);
  return modifiedData;
};

/**
Calculate moving average for the given time series data.

period will denote the number of periods to consider for the moving average calculation.
e.g. 3 would mean 3-day moving average.

 For a 3-period moving average, the calculation will be as follows:
  1. First item will be the same as the original data.
  2. Second item will be the average of the first 2 items.
  3. Third item will be the average of the first 3 items.
  4. And so on...

  @param {Array} timeSeriesData - List of objects with date and count keys.
  @param {String} countKey - Key to access the count entry in the given data.
  @param {Number} period - Number of periods to consider for the moving average calculation.
*/
const calculateMovingAverage = (timeSeriesData, countKey, period) => {
  const modifiedData = [];
  for (let i = 0; i < timeSeriesData.length; i++) {
    // Set start to 0 for the first `N` entries where `N` is the `period`.
    const start = i < period ? 0 : (i - period + 1);
    const end = i + 1;

    // Calculate moving average for the given period.
    const arraySlice = timeSeriesData.slice(start, end).map((item) => item[countKey]);
    const sumOfArraySlice = arraySlice.reduce((prev, next) => prev + next, 0);
    const movingAverage = sumOfArraySlice / arraySlice.length;
    modifiedData.push({ ...timeSeriesData[i], [countKey]: movingAverage });
  }
  return modifiedData;
};

/**
Apply calculation on the given time series data.

calculation should be one of the following values:
  'total', 'running_total', 'moving_average_3_periods', 'moving_average_7_periods'.

  e.g. If calculation is 'running_total', the data will be modified to have a running total.
  It will do so by:
  1. Start with 0.
  2. Add the count of the first element and insert it in the modified data.
  3. Add the count of the second element to the total and insert it in the modified data.
  4. And so on...

  @param {Array} timeSeriesData - List of objects with date and count keys.
  @param {String} countKey - Key to access the count entry in the given data.
  @param {String} calculation - Calculation to apply on the given data.
*/
export const applyCalculation = (timeSeriesData, countKey, calculation) => {
  // Noting to do if calculation is TOTAL.
  if (calculation === CALCULATION.TOTAL) {
    return timeSeriesData;
  }

  // Apply running total calculation
  if (calculation === CALCULATION.RUNNING_TOTAL) {
    let runningTotal = 0;
    const modifiedData = [];
    for (let i = 0; i < timeSeriesData.length; i++) {
      runningTotal += timeSeriesData[i][countKey];
      modifiedData.push({ ...timeSeriesData[i], [countKey]: runningTotal });
    }
    return modifiedData;
  }

  // Apply moving average calculation
  if (calculation === CALCULATION.MOVING_AVERAGE_3_PERIODS) {
    return calculateMovingAverage(timeSeriesData, countKey, 3);
  }
  if (calculation === CALCULATION.MOVING_AVERAGE_7_PERIODS) {
    return calculateMovingAverage(timeSeriesData, countKey, 7);
  }

  // If no calculation is applied,
  return timeSeriesData;
};

/**
 * Calculates the marker sizes for a set of data objects based on a specified numeric property.
 * Marker sizes are mapped to a range between a minimum and maximum size.
 *
 * @param {Array<Object>} dataArray - An array of objects containing the data.
 * @param {string} property - The key of the numeric property used to calculate the sizes (e.g., 'completions').
 * @param {number} [minSize=10] - The minimum marker size in pixels.
 * @param {number} [maxSize=60] - The maximum marker size in pixels.
 * @returns {Array<number>} - An array of marker sizes corresponding to the values of the specified property.
 */
export const calculateMarkerSizes = (dataArray = [], property, minSize = 10, maxSize = 60) => {
  if (!dataArray.length || !property) {
    return [];
  }

  const propertyValues = dataArray.map(d => d[property]);
  const minValue = Math.min(...propertyValues);
  const maxValue = Math.max(...propertyValues);

  return dataArray.map(item => {
    if (maxValue - minValue === 0) {
      return minSize; // Avoid division by zero if all values are the same
    }

    // Scale the marker size between minSize and maxSize based on the specified property
    return ((item[property] - minValue) / (maxValue - minValue)) * (maxSize - minSize) + minSize;
  });
};

/**
 * Groups an array of records by a specified key and sums specified numeric fields within each group.
 *
 * @param {Array<Object>} records - The array of objects to process.
 * @param {string} groupByKey - The key in each object to group by (e.g., "courseKey" or "courseSubject").
 * @param {Array<string>} fieldsToSum - Array of numeric field names to sum for each group
 * (e.g., ["enrollmentCount", "learningTimeHours"]).
 * @returns {Array<Object>} A new array of objects grouped by the specified key with summed numeric fields.
 */
export const sumEntitiesByMetric = (records, groupByKey, fieldsToSum = []) => {
  const result = {};

  records?.forEach(record => {
    const key = record[groupByKey];
    if (!result[key]) {
      // Shallow copy of record excluding groupByKey + enrollType
      const { enrollType, ...rest } = record;
      result[key] = { ...rest };
      result[key][groupByKey] = key; // re-add the grouping key explicitly
      // Initialize all summable fields to 0
      fieldsToSum.forEach(field => {
        result[key][field] = 0;
      });
    }
    // Sum each specified numeric field
    fieldsToSum.forEach(field => {
      result[key][field] += record[field] || 0;
    });
  });

  return Object.values(result);
};

/** * Generates a date string which is 90 days before today in 'YYYY-MM-DD' format.
 * This is used as the default start date for analytics filters.
 * @return {string} The date string in 'YYYY-MM-DD' format.
 */
export const get90DayPriorDate = () => {
  const today = new Date();
  const newStartDate = new Date(today.setDate(today.getDate() - 90))
    .toISOString()
    .split('T')[0];
  return newStartDate;
};
