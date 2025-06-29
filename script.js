import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics for detailed analysis
const slowRequests = new Rate('slow_requests_rate');
const verySlowRequests = new Rate('very_slow_requests_rate');
const responseTimeBuckets = new Trend('response_time_buckets');

export const options = {
  stages: [
    { duration: '10s', target: 50 },
    { duration: '50s', target: 100 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    // Multiple thresholds for better analysis
    'http_req_duration': [
      'p(50)<50',     // 50% under 50ms (excellent)
      'p(75)<100',    // 75% under 100ms (good)
      'p(90)<150',    // 90% under 150ms (acceptable)
      'p(95)<200',    // 95% under 200ms (your target)
      'p(99)<400',    // 99% under 400ms
    ],
    'http_req_failed': ['rate<0.01'],
    'slow_requests_rate': ['rate<0.05'],      // <5% requests over 200ms
    'very_slow_requests_rate': ['rate<0.01'], // <1% requests over 500ms
  },
};

export default function () {
  const response = http.get('http://localhost:8080/api/categories', {
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
  
  const responseTime = response.timings.duration;
  
  // Categorize response times
  slowRequests.add(responseTime > 200);
  verySlowRequests.add(responseTime > 500);
  responseTimeBuckets.add(responseTime);
  
  // Detailed checks
  const isSuccess = check(response, {
    'status_200': (r) => r.status === 200,
    'fast_response': (r) => r.timings.duration < 200,
    'acceptable_response': (r) => r.timings.duration < 500,
    'has_content': (r) => r.body && r.body.length > 0,
  });
  
  // Log slow requests for debugging
  if (responseTime > 300) {
    console.log(`⚠️ Slow request: ${responseTime.toFixed(2)}ms at ${new Date().toISOString()}`);
  }
  
  sleep(0.1); // Small pause between requests
}

export function handleSummary(data) {
  const metrics = data.metrics;
  const duration = metrics.http_req_duration.values;
  const reqs = metrics.http_reqs.values;
  
  console.log('\n🔍 COMPREHENSIVE PERFORMANCE ANALYSIS');
  console.log('=====================================\n');
  
  // Current Results
  console.log('📊 CURRENT PERFORMANCE:');
  console.log(`   Total Requests: ${reqs.count.toLocaleString()}`);
  console.log(`   Requests/sec: ${reqs.rate.toFixed(1)}`);
  console.log(`   Success Rate: ${((1 - metrics.http_req_failed.values.rate) * 100).toFixed(2)}%`);
  console.log(`   Average Response: ${duration.avg.toFixed(2)}ms`);
  
  console.log('\n📈 RESPONSE TIME DISTRIBUTION:');
  console.log(`   P50 (Median): ${(duration['p(50)'] || 0).toFixed(2)}ms`);
  console.log(`   P75: ${(duration['p(75)'] || 0).toFixed(2)}ms`);
  console.log(`   P90: ${(duration['p(90)'] || 0).toFixed(2)}ms`);
  console.log(`   P95: ${(duration['p(95)'] || 0).toFixed(2)}ms ← TARGET: <200ms`);
  console.log(`   P99: ${(duration['p(99)'] || 0).toFixed(2)}ms`);
  console.log(`   Max: ${(duration.max || 0).toFixed(2)}ms`);
  
  // Gap Analysis
  const p95 = duration['p(95)'];
  const gapMs = p95 - 200;
  const gapPercent = ((gapMs / 200) * 100);
  
  console.log('\n🎯 GAP ANALYSIS:');
  if (p95 > 200) {
    console.log(`   Current P95: ${p95.toFixed(2)}ms`);
    console.log(`   Target P95: 200ms`);
    console.log(`   Gap: +${gapMs.toFixed(2)}ms (${gapPercent.toFixed(1)}% over target)`);
    console.log(`   Status: FAILED ❌`);
  } else {
    console.log(`   Status: PASSED ✅`);
    console.log(`   Margin: ${(200 - p95).toFixed(2)}ms under target`);
  }
  
  // Performance Grade
  console.log('\n⭐ PERFORMANCE GRADE:');
  let grade, recommendation;
  if (p95 < 100) {
    grade = 'A+'; recommendation = 'Excellent performance!';
  } else if (p95 < 150) {
    grade = 'A'; recommendation = 'Very good performance';
  } else if (p95 < 200) {
    grade = 'B+'; recommendation = 'Good performance, close to target';
  } else if (p95 < 250) {
    grade = 'B'; recommendation = 'Acceptable, needs minor optimization';
  } else if (p95 < 300) {
    grade = 'C'; recommendation = 'Needs improvement';
  } else {
    grade = 'D'; recommendation = 'Poor performance, needs major optimization';
  }
  
  console.log(`   Grade: ${grade}`);
  console.log(`   Assessment: ${recommendation}`);
  
  // Specific recommendations based on current performance
  if (p95 > 200) {
    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
    console.log('=================================');
    
    if (gapMs <= 50) {
      console.log('🔧 QUICK WINS (Gap < 50ms):');
      console.log('   1. Enable response caching (Redis/Memcached)');
      console.log('   2. Add database indexes on frequently queried columns');
      console.log('   3. Enable HTTP compression (Gzip)');
      console.log('   4. Optimize database connection pool settings');
    } else if (gapMs <= 100) {
      console.log('🔧 MEDIUM EFFORT (Gap 50-100ms):');
      console.log('   1. Implement all quick wins above');
      console.log('   2. Review and optimize database queries');
      console.log('   3. Consider connection pooling optimization');
      console.log('   4. Add application-level caching');
      console.log('   5. Review server resource allocation');
    } else {
      console.log('🔧 MAJOR OPTIMIZATION NEEDED (Gap > 100ms):');
      console.log('   1. Complete database performance audit');
      console.log('   2. Implement comprehensive caching strategy');
      console.log('   3. Consider database sharding/replication');
      console.log('   4. Review application architecture');
      console.log('   5. Scale server resources (CPU/Memory)');
    }
    
    console.log('\n🎯 IMMEDIATE ACTION ITEMS:');
    console.log('   1. Check server resources during peak load');
    console.log('   2. Profile database query performance');
    console.log('   3. Monitor garbage collection (if applicable)');
    console.log('   4. Review application logs for bottlenecks');
  }
  
  // Success story if passed
  if (p95 <= 200) {
    console.log('\n🎉 CONGRATULATIONS!');
    console.log('   Your API meets the P95 < 200ms requirement!');
    console.log('   Consider this performance as your baseline.');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('   1. Implement recommended optimizations');
  console.log('   2. Re-run this test to measure improvement');
  console.log('   3. Set up continuous performance monitoring');
  console.log('   4. Document performance baseline');
  
  return {
    'performance-analysis.json': JSON.stringify({
      summary: {
        p95_target: 200,
        p95_actual: p95,
        gap_ms: gapMs,
        gap_percent: gapPercent,
        status: p95 <= 200 ? 'PASSED' : 'FAILED',
        grade: grade,
        total_requests: reqs.count,
        success_rate: (1 - metrics.http_req_failed.values.rate) * 100
      },
      detailed_metrics: data.metrics
    }, null, 2)
  };
}