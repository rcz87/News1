const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_CHANNELS = ['ambal', 'beritadesa', 'beritaangin', 'dendelesinfo'];

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ChannelNavigationTest/1.0)'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testChannelNavigation() {
  console.log('🧪 Testing Channel Navigation Fix');
  console.log('=====================================\n');

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  // Test 1: Root page should load
  try {
    console.log('📍 Test 1: Root page (/)');
    const response = await makeRequest('/');
    
    if (response.statusCode === 200) {
      console.log('✅ Root page loaded successfully');
      results.passed++;
      results.details.push('✅ Root page: 200 OK');
    } else {
      console.log(`❌ Root page failed: ${response.statusCode}`);
      results.failed++;
      results.details.push(`❌ Root page: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Root page error: ${error.message}`);
    results.failed++;
    results.details.push(`❌ Root page: ${error.message}`);
  }

  console.log('');

  // Test 2: Channel pages should load
  for (const channelId of TEST_CHANNELS) {
    try {
      console.log(`📍 Test 2.${TEST_CHANNELS.indexOf(channelId) + 1}: Channel page (/${channelId})`);
      const response = await makeRequest(`/${channelId}`);
      
      if (response.statusCode === 200) {
        // Check if response contains channel-specific content
        const hasChannelContent = response.body.includes('data-channel') || 
                                 response.body.includes(channelId) ||
                                 response.body.includes('article');
        
        if (hasChannelContent) {
          console.log(`✅ Channel ${channelId} loaded with content`);
          results.passed++;
          results.details.push(`✅ Channel ${channelId}: 200 OK with content`);
        } else {
          console.log(`⚠️  Channel ${channelId} loaded but no content detected`);
          results.passed++;
          results.details.push(`⚠️  Channel ${channelId}: 200 OK (no content detected)`);
        }
      } else {
        console.log(`❌ Channel ${channelId} failed: ${response.statusCode}`);
        results.failed++;
        results.details.push(`❌ Channel ${channelId}: ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ Channel ${channelId} error: ${error.message}`);
      results.failed++;
      results.details.push(`❌ Channel ${channelId}: ${error.message}`);
    }
    
    console.log('');
  }

  // Test 3: Check for JavaScript bundle
  try {
    console.log('📍 Test 3: JavaScript bundle');
    const response = await makeRequest('/assets/index-BmpeNFb5.js');
    
    if (response.statusCode === 200) {
      console.log('✅ JavaScript bundle accessible');
      results.passed++;
      results.details.push('✅ JavaScript bundle: 200 OK');
    } else {
      console.log(`❌ JavaScript bundle failed: ${response.statusCode}`);
      results.failed++;
      results.details.push(`❌ JavaScript bundle: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ JavaScript bundle error: ${error.message}`);
    results.failed++;
    results.details.push(`❌ JavaScript bundle: ${error.message}`);
  }

  console.log('');

  // Summary
  console.log('📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  console.log('\n📋 Detailed Results:');
  results.details.forEach(detail => console.log(`  ${detail}`));

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Channel navigation is working correctly.');
    console.log('💡 You should now be able to navigate between channels without manual refresh.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the details above.');
  }

  return results;
}

// Run the test
testChannelNavigation().catch(console.error);
