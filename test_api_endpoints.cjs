const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; APITest/1.0)',
        'Accept': 'application/json'
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

async function testAPIEndpoints() {
  console.log('🧪 Testing API Endpoints');
  console.log('========================\n');

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  // Test 1: Get all channels
  try {
    console.log('📍 Test 1: GET /api/channels');
    const response = await makeRequest('/api/channels');
    
    if (response.statusCode === 200) {
      try {
        const data = JSON.parse(response.body);
        console.log(`✅ Status: 200 OK`);
        console.log(`📊 Channels found: ${data.length}`);
        console.log(`📋 Sample channels: ${data.slice(0, 3).map(c => c.id).join(', ')}`);
        results.passed++;
        results.details.push('✅ /api/channels: 200 OK');
      } catch (parseError) {
        console.log(`❌ JSON parse error: ${parseError.message}`);
        results.failed++;
        results.details.push('❌ /api/channels: Invalid JSON');
      }
    } else {
      console.log(`❌ Status: ${response.statusCode}`);
      results.failed++;
      results.details.push(`❌ /api/channels: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    results.failed++;
    results.details.push(`❌ /api/channels: ${error.message}`);
  }

  console.log('');

  // Test 2: Get beritadesa articles
  try {
    console.log('📍 Test 2: GET /api/channels/beritadesa/articles');
    const response = await makeRequest('/api/channels/beritadesa/articles');
    
    if (response.statusCode === 200) {
      try {
        const data = JSON.parse(response.body);
        console.log(`✅ Status: 200 OK`);
        console.log(`📊 Articles found: ${data.length}`);
        if (data.length > 0) {
          console.log(`📋 Sample articles: ${data.slice(0, 3).map(a => a.slug).join(', ')}`);
        }
        results.passed++;
        results.details.push('✅ /api/channels/beritadesa/articles: 200 OK');
      } catch (parseError) {
        console.log(`❌ JSON parse error: ${parseError.message}`);
        console.log(`📄 Raw response: ${response.body.substring(0, 200)}...`);
        results.failed++;
        results.details.push('❌ /api/channels/beritadesa/articles: Invalid JSON');
      }
    } else {
      console.log(`❌ Status: ${response.statusCode}`);
      console.log(`📄 Error response: ${response.body}`);
      results.failed++;
      results.details.push(`❌ /api/channels/beritadesa/articles: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    results.failed++;
    results.details.push(`❌ /api/channels/beritadesa/articles: ${error.message}`);
  }

  console.log('');

  // Test 3: Get specific article by slug
  try {
    console.log('📍 Test 3: GET /api/channels/beritadesa/articles/classic-car-rally');
    const response = await makeRequest('/api/channels/beritadesa/articles/classic-car-rally');
    
    if (response.statusCode === 200) {
      try {
        const data = JSON.parse(response.body);
        console.log(`✅ Status: 200 OK`);
        console.log(`📰 Article title: ${data.title}`);
        console.log(`📝 Has content: ${!!data.content}`);
        console.log(`🌐 Has HTML: ${!!data.htmlContent}`);
        results.passed++;
        results.details.push('✅ /api/channels/beritadesa/articles/classic-car-rally: 200 OK');
      } catch (parseError) {
        console.log(`❌ JSON parse error: ${parseError.message}`);
        console.log(`📄 Raw response: ${response.body.substring(0, 200)}...`);
        results.failed++;
        results.details.push('❌ /api/channels/beritadesa/articles/classic-car-rally: Invalid JSON');
      }
    } else {
      console.log(`❌ Status: ${response.statusCode}`);
      console.log(`📄 Error response: ${response.body}`);
      results.failed++;
      results.details.push(`❌ /api/channels/beritadesa/articles/classic-car-rally: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    results.failed++;
    results.details.push(`❌ /api/channels/beritadesa/articles/classic-car-rally: ${error.message}`);
  }

  console.log('');

  // Test 4: Get article by slug (the problematic one)
  try {
    console.log('📍 Test 4: GET /api/channels/beritadesa/articles/warga-ayah-bayar-pajak-samsat-paten');
    const response = await makeRequest('/api/channels/beritadesa/articles/warga-ayah-bayar-pajak-samsat-paten');
    
    if (response.statusCode === 200) {
      try {
        const data = JSON.parse(response.body);
        console.log(`✅ Status: 200 OK`);
        console.log(`📰 Article title: ${data.title}`);
        console.log(`📝 Has content: ${!!data.content}`);
        console.log(`🌐 Has HTML: ${!!data.htmlContent}`);
        results.passed++;
        results.details.push('✅ /api/channels/beritadesa/articles/warga-ayah-bayar-pajak-samsat-paten: 200 OK');
      } catch (parseError) {
        console.log(`❌ JSON parse error: ${parseError.message}`);
        console.log(`📄 Raw response: ${response.body.substring(0, 200)}...`);
        results.failed++;
        results.details.push('❌ /api/channels/beritadesa/articles/warga-ayah-bayar-pajak-samsat-paten: Invalid JSON');
      }
    } else {
      console.log(`❌ Status: ${response.statusCode}`);
      console.log(`📄 Error response: ${response.body}`);
      results.failed++;
      results.details.push(`❌ /api/channels/beritadesa/articles/warga-ayah-bayar-pajak-samsat-paten: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    results.failed++;
    results.details.push(`❌ /api/channels/beritadesa/articles/warga-ayah-bayar-pajak-samsat-paten: ${error.message}`);
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

  return results;
}

// Run the test
testAPIEndpoints().catch(console.error);
