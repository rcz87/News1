const http = require('http');
const { URL } = require('url');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'test-script'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function testClientSideRouting() {
  console.log('🔍 TESTING CLIENT-SIDE ROUTING\n');
  console.log('='.repeat(60));

  // Test 1: Check if the HTML contains the React app
  console.log('\n📋 Testing: HTML Structure');
  const response = await makeRequest('/beritadesa/article/warga-ayah-bayar-pajak-samsat-paten');
  
  if (response.data.includes('<div id="root"></div>')) {
    console.log('✅ React root element found');
  } else {
    console.log('❌ React root element not found');
  }

  if (response.data.includes('/assets/index-')) {
    console.log('✅ React bundle script found');
  } else {
    console.log('❌ React bundle script not found');
  }

  // Test 2: Check if the JavaScript bundle is accessible
  console.log('\n📋 Testing: JavaScript Bundle');
  try {
    const bundleResponse = await makeRequest('/assets/index-BWbwet3W.js');
    if (bundleResponse.statusCode === 200) {
      console.log('✅ JavaScript bundle accessible');
      console.log(`📊 Bundle size: ${bundleResponse.data.length} bytes`);
    } else {
      console.log('❌ JavaScript bundle not accessible');
    }
  } catch (error) {
    console.log('❌ Error accessing JavaScript bundle:', error.message);
  }

  // Test 3: Check API endpoint works
  console.log('\n📋 Testing: API Endpoint');
  try {
    const apiResponse = await makeRequest('/api/channels/beritadesa/articles/warga-ayah-bayar-pajak-samsat-paten');
    if (apiResponse.statusCode === 200) {
      console.log('✅ API endpoint works');
      const articleData = JSON.parse(apiResponse.data);
      console.log(`📝 Article: ${articleData.title}`);
      console.log(`🏷️  Category: ${articleData.category}`);
    } else {
      console.log('❌ API endpoint failed');
    }
  } catch (error) {
    console.log('❌ Error accessing API endpoint:', error.message);
  }

  // Test 4: Check if there are any console errors in the HTML
  console.log('\n📋 Testing: HTML Content Analysis');
  if (response.data.includes('ArticlePage Debug')) {
    console.log('✅ Debug logging found in HTML');
  } else {
    console.log('⚠️  Debug logging not found (expected in production)');
  }

  if (response.data.includes('article-content')) {
    console.log('✅ Article content found in HTML');
  } else {
    console.log('❌ Article content not found in HTML (client-side rendering issue)');
  }

  console.log('\n🎯 DIAGNOSIS');
  console.log('='.repeat(60));
  
  if (response.data.length < 1000) {
    console.log('❌ ISSUE: HTML response too small - client-side routing not working');
    console.log('🔧 SOLUTION: Check React Router configuration and client-side routing');
  } else {
    console.log('✅ HTML response size looks normal');
  }

  console.log('\n📝 RECOMMENDATIONS:');
  console.log('1. Check if React Router is properly configured');
  console.log('2. Verify client-side routing matches server routes');
  console.log('3. Check if the ArticlePage component is properly exported');
  console.log('4. Verify the route pattern: /:channelId/article/:slug');
}

// Run the test
testClientSideRouting().catch(console.error);
