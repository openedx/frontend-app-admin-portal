const { execSync } = require('child_process');
const fs = require('fs');

console.log('Running benchmark...');

// Run the benchmark
try {
  execSync('node benchmark.js', { stdio: 'inherit' });
  console.log('Benchmark completed successfully.');
} catch (error) {
  console.error('Error running benchmark:', error);
  process.exit(1);
}

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
      `| ${size.padEnd(9)} | ${period.padEnd(6)} | ${result.originalMemory.toFixed(2).padEnd(12)} | ${result.optimizedMemory.toFixed(2).padEnd(14)} | ${result.memoryImprovement.toFixed(2).padEnd(15)} |`
    );
  }
}

console.log('\n=== ALGORITHM ANALYSIS ===');
console.log('\nOriginal Implementation:');
console.log('- Time Complexity: O(n²) - For each element, it creates a slice of the array and maps over it');
console.log('- Space Complexity: O(n) - It creates a new array of the same size as the input');

console.log('\nOptimized Implementation:');
console.log('- Time Complexity: O(n) - It uses a sliding window approach to avoid recalculating the sum for each element');
console.log('- Space Complexity: O(n) - It still creates a new array of the same size as the input');

console.log('\n=== CONCLUSION ===');
console.log('The optimized implementation significantly improves the time complexity from O(n²) to O(n).');
console.log('This results in better performance, especially for larger datasets.');
console.log('The space complexity remains O(n) for both implementations.');

console.log('\nDetailed results are available in benchmark-results.json');
