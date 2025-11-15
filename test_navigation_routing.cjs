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

// Test navigation routing
async function testNavigationRouting() {
  console.log('🧪 Testing Navigation Routing Between HomePage and ArticlePage\n');
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
        
        // Check if page contains article cards with proper Link elements
        const hasArticleCards = response.body.includes('data-testid="card-article-');
        const hasLinkElements = response.body.includes('<Link ') || response.body.includes('href="/');
        
        if (hasArticleCards && hasLinkElements) {
          console.log(`   📄 Contains article cards with navigation links`);
        } else {
          console.log(`   ⚠️  Missing article cards or navigation links`);
        }
        
        results.details.push({
          test: `${channelId} homepage`,
          status: 'PASS',
          statusCode: response.statusCode,
          hasArticleCards,
          hasLinkElements
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

  // Test 2: Article page accessibility (sample articles)
  console.log('📋 Test 2: Article Page Accessibility');
  console.log('-'.repeat(50));

  // Test a few sample article URLs
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
        
        // Check if article page has proper content
        const hasArticleContent = response.body.includes('article') || response.body.includes('ArticlePage');
        const hasBackNavigation = response.body.includes('href="/') || response.body.includes('Back to');
        
        if (hasArticleContent) {
          console.log(`   📄 Contains article content`);
        } else {
          console.log(`   ⚠️  Missing article content`);
        }
        
        if (hasBackNavigation) {
          console.log(`   🔄 Has back navigation`);
        } else {
          console.log(`   ⚠️  Missing back navigation`);
        }
        
        results.details.push({
          test: `Article page ${articleUrl}`,
          status: 'PASS',
          statusCode: response.statusCode,
          hasArticleContent,
          hasBackNavigation
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

  // Test 3: Link structure in ArticleCard component
  console.log('📋 Test 3: Link Structure Analysis');
  console.log('-'.repeat(50));

  results.totalTests++;
  try {
    console.log('Testing ArticleCard link structure...');
    const response = await makeRequest(`${BASE_URL}/ambal`);
    
    if (response.statusCode === 200) {
      // Check for proper Link component usage
      const hasLinkComponents = response.body.includes('<Link href=');
      const hasOnClickNavigation = response.body.includes('navigate(');
      const hasProperRouting = response.body.includes('/ambal/article/');
      
      if (hasLinkComponents && !hasOnClickNavigation) {
        console.log('✅ ArticleCard uses proper Link components');
        results.passedTests++;
        results.details.push({
          test: 'ArticleCard link structure',
          status: 'PASS',
          hasLinkComponents: true,
          hasOnClickNavigation: false,
          hasProperRouting
        });
      } else if (hasOnClickNavigation) {
        console.log('⚠️  ArticleCard still uses onClick navigation');
        results.failedTests++;
        results.details.push({
          test: 'ArticleCard link structure',
          status: 'PARTIAL',
          hasLinkComponents,
          hasOnClickNavigation: true,
          hasProperRouting
        });
      } else {
        console.log('❌ ArticleCard missing proper navigation');
        results.failedTests++;
        results.details.push({
          test: 'ArticleCard link structure',
          status: 'FAIL',
          hasLinkComponents: false,
          hasOnClickNavigation: false,
          hasProperRouting
        });
      }
    } else {
      console.log(`❌ Cannot analyze link structure (${response.statusCode})`);
      results.failedTests++;
    }
  } catch (error) {
    console.log(`❌ Link structure analysis failed: ${error.message}`);
    results.failedTests++;
  }

  console.log('\n');

  // Test 4: Channel selector functionality
  console.log('📋 Test 4: Channel Selector Functionality');
  console.log('-'.repeat(50));

  results.totalTests++;
  try {
    console.log('Testing root channel selector...');
    const response = await makeRequest(`${BASE_URL}/`);
    
    if (response.statusCode === 200) {
      const hasChannelLinks = response.body.includes('href="/ambal"') || 
                             response.body.includes('href="/beritadesa"') ||
                             response.body.includes('href="/voliinfo"');
      
      if (hasChannelLinks) {
        console.log('✅ Channel selector has proper navigation links');
        results.passedTests++;
        results.details.push({
          test: 'Channel selector',
          status: 'PASS',
          hasChannelLinks: true
        });
      } else {
        console.log('❌ Channel selector missing navigation links');
        results.failedTests++;
        results.details.push({
          test: 'Channel selector',
          status: 'FAIL',
          hasChannelLinks: false
        });
      }
    } else {
      console.log(`❌ Channel selector failed (${response.statusCode})`);
      results.failedTests++;
    }
  } catch (error) {
    console.log(`❌ Channel selector test failed: ${error.message}`);
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
    if (detail.hasArticleCards !== undefined) console.log(`   Article Cards: ${detail.hasArticleCards ? '✅' : '❌'}`);
    if (detail.hasLinkElements !== undefined) console.log(`   Link Elements: ${detail.hasLinkElements ? '✅' : '❌'}`);
    if (detail.hasArticleContent !== undefined) console.log(`   Article Content: ${detail.hasArticleContent ? '✅' : '❌'}`);
    if (detail.hasBackNavigation !== undefined) console.log(`   Back Navigation: ${detail.hasBackNavigation ? '✅' : '❌'}`);
    if (detail.hasLinkComponents !== undefined) console.log(`   Link Components: ${detail.hasLinkComponents ? '✅' : '❌'}`);
    if (detail.hasOnClickNavigation !== undefined) console.log(`   onClick Navigation: ${detail.hasOnClickNavigation ? '❌' : '✅'}`);
    if (detail.hasProperRouting !== undefined) console.log(`   Proper Routing: ${detail.hasProperRouting ? '✅' : '❌'}`);
    if (detail.hasChannelLinks !== undefined) console.log(`   Channel Links: ${detail.hasChannelLinks ? '✅' : '❌'}`);
  });

  console.log('\n🎯 RECOMMENDATIONS:');
  
  const failedTests = results.details.filter(d => d.status === 'FAIL' || d.status === 'ERROR');
  if (failedTests.length > 0) {
    console.log('❌ Issues found that need attention:');
    failedTests.forEach(test => {
      console.log(`   • ${test.test}: ${test.error || 'Navigation failed'}`);
    });
  }

  const partialTests = results.details.filter(d => d.status === 'PARTIAL');
  if (partialTests.length > 0) {
    console.log('⚠️  Partial fixes needed:');
    partialTests.forEach(test => {
      console.log(`   • ${test.test}: Still using onClick navigation`);
    });
  }

  if (results.passedTests === results.totalTests) {
    console.log('🎉 All navigation routing tests passed! Article cards are now using proper Link components.');
  } else {
    console.log('🔧 Some navigation routing issues need to be fixed.');
  }

  return results;
}

// Run the test
async function runTest() {
  try {
    console.log('🚀 Starting Navigation Routing Test...\n');
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
