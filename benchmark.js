const { performance } = require('perf_hooks');
const path = require('path');
const fs = require('fs');

// Import the functions from benchmark-utils.js
const {
  applyCalculationOriginal,
  applyCalculationOptimized
} = require('./benchmark-utils');

// Define the calculation constants directly
const CALCULATION = {
  TOTAL: 'total',
  RUNNING_TOTAL: 'running-total',
  MOVING_AVERAGE_3_PERIODS: 'moving-average-3-period',
  MOVING_AVERAGE_7_PERIODS: 'moving-average-7-period',
};

// Add the 5-period moving average for our benchmark
const BENCHMARK_CALCULATION = {
  ...CALCULATION,
  MOVING_AVERAGE_5_PERIODS: 'moving-average-5-period',
};

// Function to generate test data
function generateTestData(size) {
  const data = [];
  const startDate = new Date('2023-01-01');

  for (let i = 0; i < size; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 100) + 1 // Random count between 1 and 100
    });
  }

  return data;
}

// Function to measure memory usage
function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100, // Resident Set Size in MB
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100, // Total Size of the Heap in MB
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100, // Heap actually Used in MB
  };
}

// Function to run benchmark for a specific implementation
async function runImplementationBenchmark(implementation, implementationName) {
  const dataSizes = [10, 100, 1000, 10000];
  const periods = [3, 5, 7];
  const results = {};

  console.log(`\nStarting benchmark for ${implementationName} implementation...`);

  for (const size of dataSizes) {
    results[size] = {};
    const testData = generateTestData(size);

    for (const period of periods) {
      const calculationType = `MOVING_AVERAGE_${period}_PERIODS`;

      // Measure execution time
      const startTime = performance.now();
      const memoryBefore = getMemoryUsage();

      // Apply the calculation using the specified implementation
      implementation(testData, 'count', BENCHMARK_CALCULATION[calculationType]);

      const endTime = performance.now();
      const memoryAfter = getMemoryUsage();

      // Calculate metrics
      const executionTime = endTime - startTime;
      const memoryUsage = {
        rss: memoryAfter.rss - memoryBefore.rss,
        heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
        heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
      };

      results[size][period] = {
        executionTime,
        memoryUsage,
      };

      console.log(`Size: ${size}, Period: ${period}`);
      console.log(`  Execution Time: ${executionTime.toFixed(2)} ms`);
      console.log(`  Memory Usage (Heap Used): ${memoryUsage.heapUsed.toFixed(2)} MB`);
    }
  }

  return results;
}

// Function to compare benchmark results
function compareResults(originalResults, optimizedResults) {
  const comparison = {};

  for (const size in originalResults) {
    comparison[size] = {};

    for (const period in originalResults[size]) {
      const originalTime = originalResults[size][period].executionTime;
      const optimizedTime = optimizedResults[size][period].executionTime;
      const timeImprovement = ((originalTime - optimizedTime) / originalTime) * 100;

      const originalMemory = originalResults[size][period].memoryUsage.heapUsed;
      const optimizedMemory = optimizedResults[size][period].memoryUsage.heapUsed;
      const memoryImprovement = ((originalMemory - optimizedMemory) / originalMemory) * 100;

      comparison[size][period] = {
        originalTime,
        optimizedTime,
        timeImprovement,
        originalMemory,
        optimizedMemory,
        memoryImprovement,
      };
    }
  }

  return comparison;
}

// Main benchmark function
async function runBenchmark() {
  // Run benchmark for original implementation
  const originalResults = await runImplementationBenchmark(applyCalculationOriginal, 'original');

  // Run benchmark for optimized implementation
  const optimizedResults = await runImplementationBenchmark(applyCalculationOptimized, 'optimized');

  // Compare results
  const comparison = compareResults(originalResults, optimizedResults);

  console.log('\nComparison Results:');
  console.log(JSON.stringify(comparison, null, 2));

  // Save results to file
  const benchmarkResults = {
    original: originalResults,
    optimized: optimizedResults,
    comparison,
  };

  fs.writeFileSync('benchmark-results.json', JSON.stringify(benchmarkResults, null, 2));
  console.log('\nBenchmark results saved to benchmark-results.json');

  return benchmarkResults;
}

// Run the benchmark
runBenchmark().catch(console.error);
