const fs = require('fs');
const path = require('path');

// Path to the utils.js file
const utilsFilePath = path.join(__dirname, 'src', 'components', 'AdvanceAnalyticsV2', 'data', 'utils.js');

// Read the current utils.js file
let utilsContent = fs.readFileSync(utilsFilePath, 'utf8');

// Original implementation pattern to match
const originalImplementationPattern = `const calculateMovingAverage = (timeSeriesData, countKey, period) => {
  const modifiedData = [];
  for (let i = 0; i < timeSeriesData.length; i++) {
    // Set start to 0 for the first \`N\` entries where \`N\` is the \`period\`.
    const start = i < period ? 0 : (i - period + 1);
    const end = i + 1;

    // Calculate moving average for the given period.
    const arraySlice = timeSeriesData.slice(start, end).map((item) => item[countKey]);
    const movingAverage = sum(arraySlice) / arraySlice.length;
    modifiedData.push({ ...timeSeriesData[i], [countKey]: movingAverage });
  }
  return modifiedData;
};`;

// Optimized implementation
const optimizedImplementation = `const calculateMovingAverage = (timeSeriesData, countKey, period) => {
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
};`;

// Replace the original implementation with the optimized one
const updatedContent = utilsContent.replace(originalImplementationPattern, optimizedImplementation);

// Create a backup of the original file
fs.writeFileSync(`${utilsFilePath}.bak`, utilsContent);
console.log(`Backup created at ${utilsFilePath}.bak`);

// Write the updated content back to the file
fs.writeFileSync(utilsFilePath, updatedContent);
console.log(`Optimized implementation written to ${utilsFilePath}`);

console.log('\nOptimization complete. The calculateMovingAverage function has been replaced with an optimized version.');
console.log('Time complexity has been improved from O(n²) to O(n).');
console.log('Run the benchmark to see the performance improvement.');
