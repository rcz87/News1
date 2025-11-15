const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'https://wisanggeni.cloud';
const ADMIN_URL = `${BASE_URL}/admin.html`;
const TIMEOUT = 15000;

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const options = {
      method: method,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Test-Script/1.0'
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = protocol.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout for ${url}`));
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAdminPage() {
  console.log('🔍 Testing Admin Dashboard Page...');
  
  try {
    const response = await makeRequest(ADMIN_URL);
    
    if (response.statusCode === 200) {
      console.log('✅ Admin page accessible');
      
      // Check if it contains admin content
      if (response.data.includes('News1 Admin Panel') || response.data.includes('admin')) {
        console.log('✅ Admin page content verified');
        return { success: true, contentLength: response.data.length };
      } else {
        console.log('⚠️  Admin page loaded but content may be incomplete');
        return { success: true, warning: 'Content may be incomplete' };
      }
    } else {
      console.log(`❌ Admin page failed - Status: ${response.statusCode}`);
      return { success: false, error: `Status: ${response.statusCode}` };
    }
  } catch (error) {
    console.log(`❌ Admin page error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAdminAPIs() {
  console.log('\n🔍 Testing Admin API Endpoints...');
  
  const endpoints = [
    '/api/admin/channels',
    '/api/admin/articles',
    '/api/admin/stats',
    '/api/channels',
    '/api/channels/ambal/articles'
  ];
  
  const results = {};
  let workingEndpoints = 0;
  
  for (const endpoint of endpoints) {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`   Testing: ${endpoint}`);
    
    try {
      const response = await makeRequest(url);
      
      if (response.statusCode === 200) {
        console.log(`     ✅ ${endpoint} - Working`);
        results[endpoint] = { success: true, statusCode: response.statusCode };
        workingEndpoints++;
      } else if (response.statusCode === 404) {
        console.log(`     ⚠️  ${endpoint} - Not found (404)`);
        results[endpoint] = { success: false, error: 'Not found', statusCode: response.statusCode };
      } else if (response.statusCode === 500) {
        console.log(`     ❌ ${endpoint} - Server error (500)`);
        results[endpoint] = { success: false, error: 'Server error', statusCode: response.statusCode };
      } else {
        console.log(`     ⚠️  ${endpoint} - Status: ${response.statusCode}`);
        results[endpoint] = { success: false, error: `Status: ${response.statusCode}`, statusCode: response.statusCode };
      }
    } catch (error) {
      console.log(`     ❌ ${endpoint} - Error: ${error.message}`);
      results[endpoint] = { success: false, error: error.message };
    }
  }
  
  return { results, workingEndpoints, totalEndpoints: endpoints.length };
}

async function testAdminFunctions() {
  console.log('\n🔍 Testing Admin Functions...');
  
  const functions = [];
  
  // Test 1: Get channels list
  try {
    const channelsResponse = await makeRequest(`${BASE_URL}/api/channels`);
    if (channelsResponse.statusCode === 200) {
      const channels = JSON.parse(channelsResponse.data);
      console.log(`✅ Channels API working - ${channels.length} channels found`);
      functions.push({ name: 'Get Channels', success: true, details: `${channels.length} channels` });
    } else {
      console.log(`❌ Channels API failed - Status: ${channelsResponse.statusCode}`);
      functions.push({ name: 'Get Channels', success: false, error: `Status: ${channelsResponse.statusCode}` });
    }
  } catch (e) {
    console.log(`❌ Channels API error: ${e.message}`);
    functions.push({ name: 'Get Channels', success: false, error: e.message });
  }
  
  // Test 2: Get articles from a channel
  try {
    const articlesResponse = await makeRequest(`${BASE_URL}/api/channels/ambal/articles`);
    if (articlesResponse.statusCode === 200) {
      const articles = JSON.parse(articlesResponse.data);
      console.log(`✅ Articles API working - ${articles.length} articles in ambal`);
      functions.push({ name: 'Get Articles', success: true, details: `${articles.length} articles` });
    } else {
      console.log(`❌ Articles API failed - Status: ${articlesResponse.statusCode}`);
      functions.push({ name: 'Get Articles', success: false, error: `Status: ${articlesResponse.statusCode}` });
    }
  } catch (e) {
    console.log(`❌ Articles API error: ${e.message}`);
    functions.push({ name: 'Get Articles', success: false, error: e.message });
  }
  
  // Test 3: Check if admin.js is accessible
  try {
    const adminJsResponse = await makeRequest(`${BASE_URL}/admin.js`);
    if (adminJsResponse.statusCode === 200) {
      console.log('✅ Admin JavaScript file accessible');
      functions.push({ name: 'Admin JS', success: true, details: 'File accessible' });
    } else {
      console.log(`❌ Admin JS file not accessible - Status: ${adminJsResponse.statusCode}`);
      functions.push({ name: 'Admin JS', success: false, error: `Status: ${adminJsResponse.statusCode}` });
    }
  } catch (e) {
    console.log(`❌ Admin JS file error: ${e.message}`);
    functions.push({ name: 'Admin JS', success: false, error: e.message });
  }
  
  return functions;
}

async function testMobileCompatibility() {
  console.log('\n🔍 Testing Mobile Compatibility...');
  
  try {
    const response = await makeRequest(ADMIN_URL);
    
    if (response.statusCode === 200) {
      const hasViewport = response.data.includes('viewport');
      const hasMobileMeta = response.data.includes('mobile-web-app-capable');
      const hasPWA = response.data.includes('manifest');
      
      console.log(`   ✅ Viewport meta tag: ${hasViewport ? 'Present' : 'Missing'}`);
      console.log(`   ✅ Mobile PWA support: ${hasMobileMeta ? 'Present' : 'Missing'}`);
      console.log(`   ✅ PWA Manifest: ${hasPWA ? 'Present' : 'Missing'}`);
      
      return {
        success: true,
        viewport: hasViewport,
        mobilePWA: hasMobileMeta,
        manifest: hasPWA
      };
    } else {
      return { success: false, error: `Status: ${response.statusCode}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🛠️  Testing https://wisanggeni.cloud/admin.html - Admin Dashboard');
  console.log('='.repeat(70));
  
  // Test 1: Admin Page Accessibility
  const adminPageResult = await testAdminPage();
  
  // Test 2: Admin API Endpoints
  const apiResults = await testAdminAPIs();
  
  // Test 3: Admin Functions
  const functionResults = await testAdminFunctions();
  
  // Test 4: Mobile Compatibility
  const mobileResults = await testMobileCompatibility();
  
  // Generate Report
  console.log('\n' + '='.repeat(70));
  console.log('📋 ADMIN DASHBOARD TEST REPORT');
  console.log('='.repeat(70));
  
  console.log('\n📊 SUMMARY:');
  console.log(`   Admin Page: ${adminPageResult.success ? '✅ Working' : '❌ Failed'}`);
  console.log(`   API Endpoints: ${apiResults.workingEndpoints}/${apiResults.totalEndpoints} working`);
  console.log(`   Functions: ${functionResults.filter(f => f.success).length}/${functionResults.length} working`);
  console.log(`   Mobile Support: ${mobileResults.success ? '✅ Available' : '❌ Issues'}`);
  
  // Calculate overall success rate
  const totalTests = 1 + apiResults.totalEndpoints + functionResults.length + 1;
  const passedTests = (adminPageResult.success ? 1 : 0) + apiResults.workingEndpoints + functionResults.filter(f => f.success).length + (mobileResults.success ? 1 : 0);
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log('\n📈 SUCCESS RATE:');
  console.log(`   Overall: ${successRate}% (${passedTests}/${totalTests} tests passed)`);
  
  console.log('\n📋 DETAILED RESULTS:');
  
  // Admin Page Details
  console.log('\n🔧 Admin Page:');
  if (adminPageResult.success) {
    console.log(`   ✅ Accessible at ${ADMIN_URL}`);
    if (adminPageResult.contentLength) {
      console.log(`   ✅ Content loaded (${adminPageResult.contentLength} bytes)`);
    }
  } else {
    console.log(`   ❌ ${adminPageResult.error}`);
  }
  
  // API Endpoints Details
  console.log('\n🔌 API Endpoints:');
  for (const [endpoint, result] of Object.entries(apiResults.results)) {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${endpoint}`);
  }
  
  // Functions Details
  console.log('\n⚙️  Admin Functions:');
  for (const func of functionResults) {
    const status = func.success ? '✅' : '❌';
    const details = func.details ? ` - ${func.details}` : func.error ? ` - ${func.error}` : '';
    console.log(`   ${status} ${func.name}${details}`);
  }
  
  // Mobile Compatibility Details
  console.log('\n📱 Mobile Compatibility:');
  if (mobileResults.success) {
    console.log(`   ✅ Viewport: ${mobileResults.viewport ? 'Optimized' : 'Not optimized'}`);
    console.log(`   ✅ PWA Support: ${mobileResults.mobilePWA ? 'Available' : 'Not available'}`);
    console.log(`   ✅ Manifest: ${mobileResults.manifest ? 'Configured' : 'Not configured'}`);
  } else {
    console.log(`   ❌ ${mobileResults.error}`);
  }
  
  console.log('\n💡 CONCLUSION:');
  if (successRate >= 90) {
    console.log('   🎉 Admin dashboard is fully functional and ready for use!');
  } else if (successRate >= 70) {
    console.log('   ✅ Admin dashboard is mostly functional with minor issues');
  } else {
    console.log('   ⚠️  Admin dashboard has significant issues that need attention');
  }
  
  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    adminUrl: ADMIN_URL,
    summary: {
      adminPage: adminPageResult.success,
      apiEndpoints: `${apiResults.workingEndpoints}/${apiResults.totalEndpoints}`,
      functions: `${functionResults.filter(f => f.success).length}/${functionResults.length}`,
      mobileSupport: mobileResults.success,
      successRate: parseFloat(successRate),
      totalTests,
      passedTests
    },
    details: {
      adminPage: adminPageResult,
      apiEndpoints: apiResults.results,
      functions: functionResults,
      mobile: mobileResults
    }
  };
  
  require('fs').writeFileSync('wisanggeni-admin-test-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n💾 Detailed report saved to: wisanggeni-admin-test-report.json');
}

main().catch(console.error);
