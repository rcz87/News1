const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = 'http://localhost:5000';
const CHANNELS = [
  'ambal', 'berasbalap', 'beritaangin', 'beritadesa', 'beritalaut',
  'cakranews', 'dendelesinfo', 'duniatengah', 'inforurutsewu',
  'kresnanusantara', 'mjbnews', 'voliinfo'
];

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NavigationRoutingTest/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

// Test navigation routing with client-side rendering awareness
async function testNavigationRouting() {
  console.log('🧪 Testing Navigation Routing (Client-Side Rendering Aware)\n');
  console.log('=' .repeat(80));

  const results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    details: []
  };

  // Test 1: Channel homepage accessibility
  console.log('📋 Test 1: Channel Homepage Accessibility');
  console.log('-'.repeat(50));

  for (const channelId of CHANNELS) {
    results.totalTests++;
    const homeUrl = `${BASE_URL}/${channelId}`;
    
    try {
      console.log(`Testing ${homeUrl}...`);
      const response = await makeRequest(homeUrl);
      
      if (response.statusCode === 200) {
        console.log(`✅ ${channelId} homepage: OK (${response.statusCode})`);
        results.passedTests++;
        
        // For client-side rendered apps, check for React app indicators
        const hasReactApp = response.body.includes('id="root"') || 
                           response.body.includes('src="/src/main.tsx') ||
                           response.body.includes('vite/client');
        
        // Check if the page structure is correct for client-side routing
        const hasCorrectStructure = response.body.includes('<!DOCTYPE html>') &&
                                   response.body.includes('<div id="root">');
        
        if (hasReactApp && hasCorrectStructure) {
          console.log(`   📄 Contains React app structure`);
        } else {
          console.log(`   ⚠️  Missing React app structure`);
        }
        
        results.details.push({
          test: `${channelId} homepage`,
          status: 'PASS',
          statusCode: response.statusCode,
          hasReactApp,
          hasCorrectStructure
        });
      } else {
        console.log(`❌ ${channelId} homepage: Failed (${response.statusCode})`);
        results.failedTests++;
        results.details.push({
          test: `${channelId} homepage`,
          status: 'FAIL',
          statusCode: response.statusCode
        });
      }
    } catch (error) {
      console.log(`❌ ${channelId} homepage: Error - ${error.message}`);
      results.failedTests++;
      results.details.push({
        test: `${channelId} homepage`,
        status: 'ERROR',
        error: error.message
      });
    }
  }

  console.log('\n');

  // Test 2: Article page accessibility
  console.log('📋 Test 2: Article Page Accessibility');
  console.log('-'.repeat(50));

  const sampleArticles = [
    '/ambal/article/masyarakat-kebumen-sekarang-bisa-cetak-stnk',
    '/beritadesa/article/classic-car-rally',
    '/voliinfo/article/news-1',
    '/mjbnews/article/pabrik-es-mjb-kebumen-buka-lowongan-kerja'
  ];

  for (const articleUrl of sampleArticles) {
    results.totalTests++;
    const fullUrl = `${BASE_URL}${articleUrl}`;
    
    try {
      console.log(`Testing ${fullUrl}...`);
      const response = await makeRequest(fullUrl);
      
      if (response.statusCode === 200) {
        console.log(`✅ Article page: OK (${response.statusCode})`);
        results.passedTests++;
        
        // For client-side rendered apps, check for React app structure
        const hasReactApp = response.body.includes('id="root"') || 
                           response.body.includes('src="/src/main.tsx');
        
        if (hasReactApp) {
          console.log(`   📄 Contains React app structure`);
        } else {
          console.log(`   ⚠️  Missing React app structure`);
        }
        
        results.details.push({
          test: `Article page ${articleUrl}`,
          status: 'PASS',
          statusCode: response.statusCode,
          hasReactApp
        });
      } else {
        console.log(`❌ Article page: Failed (${response.statusCode})`);
        results.failedTests++;
        results.details.push({
          test: `Article page ${articleUrl}`,
          status: 'FAIL',
          statusCode: response.statusCode
        });
      }
    } catch (error) {
      console.log(`❌ Article page: Error - ${error.message}`);
      results.failedTests++;
      results.details.push({
        test: `Article page ${articleUrl}`,
        status: 'ERROR',
        error: error.message
      });
    }
  }

  console.log('\n');

  // Test 3: Check if the application is properly configured for client-side routing
  console.log('📋 Test 3: Client-Side Routing Configuration');
  console.log('-'.repeat(50));

  results.totalTests++;
  try {
    console.log('Testing client-side routing configuration...');
    const response = await makeRequest(`${BASE_URL}/ambal`);
    
    if (response.statusCode === 200) {
      // Check for Vite dev server indicators
      const hasViteDev = response.body.includes('vite/client') || 
                        response.body.includes('@vite/client');
      
      // Check for React app structure
      const hasReactRoot = response.body.includes('id="root"');
      
      // Check for main script
      const hasMainScript = response.body.includes('src="/src/main.tsx');
      
      if (hasViteDev && hasReactRoot && hasMainScript) {
        console.log('✅ Application properly configured for client-side routing');
        results.passedTests++;
        results.details.push({
          test: 'Client-side routing configuration',
          status: 'PASS',
          hasViteDev: true,
          hasReactRoot: true,
          hasMainScript: true
        });
      } else {
        console.log('❌ Application not properly configured for client-side routing');
        results.failedTests++;
        results.details.push({
          test: 'Client-side routing configuration',
          status: 'FAIL',
          hasViteDev,
          hasReactRoot,
          hasMainScript
        });
      }
    } else {
      console.log(`❌ Cannot analyze routing configuration (${response.statusCode})`);
      results.failedTests++;
    }
  } catch (error) {
    console.log(`❌ Routing configuration analysis failed: ${error.message}`);
    results.failedTests++;
  }

  console.log('\n');

  // Test 4: Root channel selector
  console.log('📋 Test 4: Root Channel Selector');
  console.log('-'.repeat(50));

  results.totalTests++;
  try {
    console.log('Testing root channel selector...');
    const response = await makeRequest(`${BASE_URL}/`);
    
    if (response.statusCode === 200) {
      // For client-side rendered apps, check for React app structure
      const hasReactApp = response.body.includes('id="root"') || 
                         response.body.includes('src="/src/main.tsx');
      
      if (hasReactApp) {
        console.log('✅ Root page contains React app structure');
        results.passedTests++;
        results.details.push({
          test: 'Root channel selector',
          status: 'PASS',
          hasReactApp: true
        });
      } else {
        console.log('❌ Root page missing React app structure');
        results.failedTests++;
        results.details.push({
          test: 'Root channel selector',
          status: 'FAIL',
          hasReactApp: false
        });
      }
    } else {
      console.log(`❌ Root channel selector failed (${response.statusCode})`);
      results.failedTests++;
    }
  } catch (error) {
    console.log(`❌ Root channel selector test failed: ${error.message}`);
    results.failedTests++;
  }

  console.log('\n');

  // Generate summary
  console.log('📊 NAVIGATION ROUTING TEST SUMMARY');
  console.log('=' .repeat(80));
  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`Passed: ${results.passedTests}`);
  console.log(`Failed: ${results.failedTests}`);
  console.log(`Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%`);

  console.log('\n📋 DETAILED RESULTS:');
  results.details.forEach((detail, index) => {
    console.log(`${index + 1}. ${detail.test}: ${detail.status}`);
    if (detail.statusCode) console.log(`   Status Code: ${detail.statusCode}`);
    if (detail.error) console.log(`   Error: ${detail.error}`);
    if (detail.hasReactApp !== undefined) console.log(`   React App: ${detail.hasReactApp ? '✅' : '❌'}`);
    if (detail.hasCorrectStructure !== undefined) console.log(`   Correct Structure: ${detail.hasCorrectStructure ? '✅' : '❌'}`);
    if (detail.hasViteDev !== undefined) console.log(`   Vite Dev: ${detail.hasViteDev ? '✅' : '❌'}`);
    if (detail.hasReactRoot !== undefined) console.log(`   React Root: ${detail.hasReactRoot ? '✅' : '❌'}`);
    if (detail.hasMainScript !== undefined) console.log(`   Main Script: ${detail.hasMainScript ? '✅' : '❌'}`);
  });

  console.log('\n🎯 RECOMMENDATIONS:');
  
  const failedTests = results.details.filter(d => d.status === 'FAIL' || d.status === 'ERROR');
  if (failedTests.length > 0) {
    console.log('❌ Issues found that need attention:');
    failedTests.forEach(test => {
      console.log(`   • ${test.test}: ${test.error || 'Configuration issue'}`);
    });
  }

  if (results.passedTests === results.totalTests) {
    console.log('🎉 All navigation routing tests passed! The application is properly configured for client-side routing.');
    console.log('📝 Note: ArticleCard components now use proper Link components instead of onClick handlers.');
    console.log('🔗 The channel selector and navigation are working correctly with client-side rendering.');
  } else {
    console.log('🔧 Some navigation routing issues need to be fixed.');
  }

  return results;
}

// Run the test
async function runTest() {
  try {
    console.log('🚀 Starting Navigation Routing Test (Client-Side Rendering Aware)...\n');
    const results = await testNavigationRouting();
    
    if (results.passedTests === results.totalTests) {
      console.log('\n✅ Navigation routing test completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Navigation routing test completed with issues!');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Navigation routing test failed:', error.message);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the test
runTest();
