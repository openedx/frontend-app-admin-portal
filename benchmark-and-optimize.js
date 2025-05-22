const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== MOVING AVERAGE FUNCTION BENCHMARK AND OPTIMIZATION ===');
console.log('\nThis script will:');
console.log('1. Benchmark the current implementation');
console.log('2. Optimize the implementation');
console.log('3. Benchmark the optimized implementation');
console.log('4. Compare the results\n');

// Step 1: Run the benchmark
console.log('Step 1: Running benchmark on original and optimized implementations...');
try {
  execSync('node benchmark.js', { stdio: 'inherit' });
  console.log('Benchmark completed successfully.');
} catch (error) {
  console.error('Error running benchmark:', error);
  process.exit(1);
}

// Step 2: Generate a summary report
console.log('\nStep 2: Generating summary report...');

// Read the benchmark results
const benchmarkResults = JSON.parse(fs.readFileSync('benchmark-results.json', 'utf8'));

// Generate a summary report
console.log('\n=== BENCHMARK SUMMARY ===');
console.log('\nTime Complexity Comparison:');
console.log('-------------------------');
console.log('| Data Size | Period | Original (ms) | Optimized (ms) | Improvement (%) |');
console.log('|-----------|--------|--------------|----------------|-----------------|');

for (const size in benchmarkResults.comparison) {
  for (const period in benchmarkResults.comparison[size]) {
    const result = benchmarkResults.comparison[size][period];
    console.log(
      `| ${size.padEnd(9)} | ${period.padEnd(6)} | ${result.originalTime.toFixed(2).padEnd(12)} | ${result.optimizedTime.toFixed(2).padEnd(14)} | ${result.timeImprovement.toFixed(2).padEnd(15)} |`
    );
  }
}

console.log('\nMemory Usage Comparison:');
console.log('------------------------');
console.log('| Data Size | Period | Original (MB) | Optimized (MB) | Improvement (%) |');
console.log('|-----------|--------|--------------|----------------|-----------------|');

for (const size in benchmarkResults.comparison) {
  for (const period in benchmarkResults.comparison[size]) {
    const result = benchmarkResults.comparison[size][period];
    console.log(
      `| ${size.padEnd(9)} | ${period.padEnd(6)} | ${result.originalMemory.toFixed(2).padEnd(12)} | ${result.optimizedMemory.toFixed(2).padEnd(14)} | ${result.memoryImprovement?.toFixed(2).padEnd(15)} |`
    );
  }
}

// Step 3: Optimize the implementation
console.log('\nStep 3: Optimizing the implementation...');
try {
  execSync('node optimize-utils.js', { stdio: 'inherit' });
  console.log('Optimization completed successfully.');
} catch (error) {
  console.error('Error optimizing implementation:', error);
  process.exit(1);
}

// Step 4: Provide algorithm analysis
console.log('\n=== ALGORITHM ANALYSIS ===');
console.log('\nOriginal Implementation:');
console.log('- Time Complexity: O(n²) - For each element, it creates a slice of the array and maps over it');
console.log('- Space Complexity: O(n) - It creates a new array of the same size as the input');

console.log('\nOptimized Implementation:');
console.log('- Time Complexity: O(n) - It uses a sliding window approach to avoid recalculating the sum for each element');
console.log('- Space Complexity: O(n) - It still creates a new array of the same size as the input');

// Step 5: Provide conclusion
console.log('\n=== CONCLUSION ===');
console.log('The optimized implementation significantly improves the time complexity from O(n²) to O(n).');
console.log('This results in better performance, especially for larger datasets.');
console.log('The space complexity remains O(n) for both implementations.');

// Calculate average improvement
let totalTimeImprovement = 0;
let totalMemoryImprovement = 0;
let count = 0;

for (const size in benchmarkResults.comparison) {
  for (const period in benchmarkResults.comparison[size]) {
    const result = benchmarkResults.comparison[size][period];
    totalTimeImprovement += result.timeImprovement;
    totalMemoryImprovement += result.memoryImprovement;
    count++;
  }
}

const avgTimeImprovement = totalTimeImprovement / count;
const avgMemoryImprovement = totalMemoryImprovement / count;

console.log(`\nAverage time improvement: ${avgTimeImprovement.toFixed(2)}%`);
console.log(`Average memory improvement: ${avgMemoryImprovement.toFixed(2)}%`);

console.log('\nDetailed results are available in benchmark-results.json');
console.log('\n=== BENCHMARK AND OPTIMIZATION COMPLETE ===');
