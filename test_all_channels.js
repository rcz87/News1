#!/usr/bin/env node

import http from 'http';

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test function for channels
async function testChannel(channelId, channelName) {
  console.log(`\n🔍 Testing channel: ${channelName} (${channelId})`);
  
  const tests = [
    {
      name: 'Channel Homepage',
      url: `http://localhost:5000/${channelId}`,
      expectedStatus: 200
    },
    {
      name: 'Channel Articles API',
      url: `http://localhost:5000/api/channels/${channelId}/articles`,
      expectedStatus: 200
    },
    {
      name: 'Channel Featured API',
      url: `http://localhost:5000/api/channels/${channelId}/featured`,
      expectedStatus: 200
    },
    {
      name: 'Channel Categories API',
      url: `http://localhost:5000/api/channels/${channelId}/categories`,
      expectedStatus: 200
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`  📡 Testing: ${test.name}`);
      const response = await makeRequest(test.url);
      
      const success = response.statusCode === test.expectedStatus;
      results.push({
        name: test.name,
        url: test.url,
        success: success,
        statusCode: response.statusCode,
        error: null
      });
      
      if (success) {
        console.log(`    ✅ ${test.name} - Status: ${response.statusCode}`);
        
        // Additional checks for API responses
        if (test.url.includes('/api/')) {
          try {
            const jsonData = JSON.parse(response.data);
            if (Array.isArray(jsonData)) {
              console.log(`    📊 Returned ${jsonData.length} items`);
            } else if (jsonData && typeof jsonData === 'object') {
              console.log(`    📊 Returned object with keys: ${Object.keys(jsonData).join(', ')}`);
            }
          } catch (e) {
            console.log(`    ⚠️  Response is not valid JSON`);
          }
        }
      } else {
        console.log(`    ❌ ${test.name} - Expected: ${test.expectedStatus}, Got: ${response.statusCode}`);
        console.log(`    📄 Response preview: ${response.data.substring(0, 200)}...`);
      }
    } catch (error) {
      results.push({
        name: test.name,
        url: test.url,
        success: false,
        statusCode: null,
        error: error.message
      });
      console.log(`    ❌ ${test.name} - Error: ${error.message}`);
    }
  }
  
  return results;
}

// Main test function
async function testAllChannels() {
  console.log('🚀 Starting comprehensive channel testing...\n');
  
  const channels = [
    { id: 'ambal', name: 'Ambal News' },
    { id: 'beritaangin', name: 'Berita Angin' },
    { id: 'dendelesinfo', name: 'Dendeles Info' },
    { id: 'beritadesa', name: 'Berita Desa' },
    { id: 'kresnanusantara', name: 'Kresna Nusantara' },
    { id: 'inforurutsewu', name: 'Info Urut Sewu' },
    { id: 'duniatengah', name: 'Dunia Tengah' },
    { id: 'voliinfo', name: 'Voli Info' },
    { id: 'beritalaut', name: 'Berita Laut' },
    { id: 'berasbalap', name: 'Beras Balap' },
    { id: 'cakranews', name: 'CAKRANEWS' },
    { id: 'mjbnews', name: 'MJBNEWS' }
  ];
  
  const allResults = {};
  let totalTests = 0;
  let passedTests = 0;
  
  // Test server is running first
  try {
    console.log('🔍 Checking if server is running...');
    await makeRequest('http://localhost:5000/');
    console.log('✅ Server is running on port 5000\n');
  } catch (error) {
    console.log('❌ Server is not running on port 5000');
    console.log('Please start the server with: npm run dev');
    process.exit(1);
  }
  
  // Test each channel
  for (const channel of channels) {
    const results = await testChannel(channel.id, channel.name);
    allResults[channel.id] = results;
    
    results.forEach(result => {
      totalTests++;
      if (result.success) passedTests++;
    });
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Channel Status:');
  for (const [channelId, results] of Object.entries(allResults)) {
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    const status = passed === total ? '✅' : passed > 0 ? '⚠️' : '❌';
    console.log(`  ${status} ${channelId}: ${passed}/${total} tests passed`);
  }
  
  // Show failed tests
  const failedTests = [];
  for (const [channelId, results] of Object.entries(allResults)) {
    results.forEach(result => {
      if (!result.success) {
        failedTests.push({
          channel: channelId,
          test: result.name,
          url: result.url,
          error: result.error || `Status ${result.statusCode}`
        });
      }
    });
  }
  
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach(test => {
      console.log(`  • ${test.channel} - ${test.test}`);
      console.log(`    URL: ${test.url}`);
      console.log(`    Error: ${test.error}\n`);
    });
  }
  
  console.log('\n🎉 Channel testing completed!');
  
  if (failedTests.length > 0) {
    console.log('\n⚠️  Some channels have issues. Please check the failed tests above.');
    process.exit(1);
  } else {
    console.log('\n✅ All channels are working correctly!');
  }
}

// Run the tests
testAllChannels().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
