const { chromium } = require('playwright');

// Configuration
const BASE_URL = 'http://localhost:5000';
const CHANNELS = [
  'ambal', 'berasbalap', 'beritaangin', 'beritadesa', 'beritalaut',
  'cakranews', 'dendelesinfo', 'duniatengah', 'inforurutsewu',
  'kresnanusantara', 'mjbnews', 'voliinfo'
];

// Test navigation routing with proper client-side rendering
async function testNavigationRoutingCSR() {
  console.log('🧪 Testing Navigation Routing with Client-Side Rendering\n');
  console.log('=' .repeat(80));

  const results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    details: []
  };

  let browser;
  let page;

  try {
    // Launch browser
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ 
      userAgent: 'Mozilla/5.0 (compatible; NavigationRoutingTest/1.0)',
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    // Test 1: Channel homepage accessibility
    console.log('📋 Test 1: Channel Homepage Accessibility');
    console.log('-'.repeat(50));

    for (const channelId of CHANNELS) {
      results.totalTests++;
      const homeUrl = `${BASE_URL}/${channelId}`;
      
      try {
        console.log(`Testing ${homeUrl}...`);
        
        // Navigate to the page and wait for it to load
        await page.goto(homeUrl, { waitUntil: 'networkidle' });
        
        // Wait for React to render (wait for article cards or loading state)
        await page.waitForTimeout(2000);
        
        // Check if page loaded successfully
        const pageTitle = await page.title();
        const hasContent = await page.locator('body').textContent() !== '';
        
        if (hasContent) {
          console.log(`✅ ${channelId} homepage: OK`);
          results.passedTests++;
          
          // Check for article cards with proper data-testid
          const articleCards = await page.locator('[data-testid^="card-article-"]').count();
          const hasLinkElements = await page.locator('a[href*="/article/"]').count();
          
          if (articleCards > 0) {
            console.log(`   📄 Found ${articleCards} article cards`);
          } else {
            console.log(`   ⚠️  No article cards found (might be loading or empty channel)`);
          }
          
          if (hasLinkElements > 0) {
            console.log(`   🔗 Found ${hasLinkElements} navigation links`);
          } else {
            console.log(`   ⚠️  No navigation links found`);
          }
          
          results.details.push({
            test: `${channelId} homepage`,
            status: 'PASS',
            articleCards,
            hasLinkElements,
            hasContent: true
          });
        } else {
          console.log(`❌ ${channelId} homepage: No content`);
          results.failedTests++;
          results.details.push({
            test: `${channelId} homepage`,
            status: 'FAIL',
            error: 'No content rendered'
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
        
        // Navigate to the article page
        await page.goto(fullUrl, { waitUntil: 'networkidle' });
        
        // Wait for React to render
        await page.waitForTimeout(2000);
        
        // Check if page has content
        const hasContent = await page.locator('body').textContent() !== '';
        const hasArticleContent = await page.locator('article, .article, [data-testid*="article"]').count();
        const hasBackNavigation = await page.locator('a[href*="/"], button[onclick*="history"]').count();
        
        if (hasContent) {
          console.log(`✅ Article page: OK`);
          results.passedTests++;
          
          if (hasArticleContent > 0) {
            console.log(`   📄 Contains article content`);
          } else {
            console.log(`   ⚠️  No specific article content found`);
          }
          
          if (hasBackNavigation > 0) {
            console.log(`   🔄 Has back navigation`);
          } else {
            console.log(`   ⚠️  No back navigation found`);
          }
          
          results.details.push({
            test: `Article page ${articleUrl}`,
            status: 'PASS',
            hasArticleContent: hasArticleContent > 0,
            hasBackNavigation: hasBackNavigation > 0,
            hasContent: true
          });
        } else {
          console.log(`❌ Article page: No content`);
          results.failedTests++;
          results.details.push({
            test: `Article page ${articleUrl}`,
            status: 'FAIL',
            error: 'No content rendered'
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

    // Test 3: Link structure and navigation
    console.log('📋 Test 3: Link Structure and Navigation');
    console.log('-'.repeat(50));

    results.totalTests++;
    try {
      console.log('Testing navigation from homepage to article...');
      
      // Go to a channel homepage
      await page.goto(`${BASE_URL}/ambal`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      // Look for article links
      const articleLinks = await page.locator('a[href*="/article/"]').count();
      
      if (articleLinks > 0) {
        console.log(`✅ Found ${articleLinks} article links on homepage`);
        
        // Click the first article link
        const firstLink = page.locator('a[href*="/article/"]').first();
        const href = await firstLink.getAttribute('href');
        
        await firstLink.click();
        await page.waitForTimeout(2000);
        
        // Check if we navigated to the article
        const currentUrl = page.url();
        if (currentUrl.includes('/article/')) {
          console.log('✅ Successfully navigated to article page');
          results.passedTests++;
          results.details.push({
            test: 'Navigation from homepage to article',
            status: 'PASS',
            articleLinks,
            navigatedSuccessfully: true
          });
        } else {
          console.log('❌ Navigation failed - not on article page');
          results.failedTests++;
          results.details.push({
            test: 'Navigation from homepage to article',
            status: 'FAIL',
            articleLinks,
            navigatedSuccessfully: false
          });
        }
      } else {
        console.log('⚠️  No article links found on homepage');
        results.failedTests++;
        results.details.push({
          test: 'Navigation from homepage to article',
          status: 'PARTIAL',
          articleLinks: 0,
          navigatedSuccessfully: false
        });
      }
    } catch (error) {
      console.log(`❌ Navigation test failed: ${error.message}`);
      results.failedTests++;
      results.details.push({
        test: 'Navigation from homepage to article',
        status: 'ERROR',
        error: error.message
      });
    }

    console.log('\n');

    // Test 4: Channel selector functionality
    console.log('📋 Test 4: Channel Selector Functionality');
    console.log('-'.repeat(50));

    results.totalTests++;
    try {
      console.log('Testing root channel selector...');
      
      // Go to root page
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      // Look for channel links
      const channelLinks = await page.locator('a[href^="/ambal"], a[href^="/beritadesa"], a[href^="/voliinfo"]').count();
      
      if (channelLinks > 0) {
        console.log(`✅ Found ${channelLinks} channel links`);
        results.passedTests++;
        results.details.push({
          test: 'Channel selector',
          status: 'PASS',
          channelLinks
        });
      } else {
        console.log('❌ No channel links found');
        results.failedTests++;
        results.details.push({
          test: 'Channel selector',
          status: 'FAIL',
          channelLinks: 0
        });
      }
    } catch (error) {
      console.log(`❌ Channel selector test failed: ${error.message}`);
      results.failedTests++;
      results.details.push({
        test: 'Channel selector',
        status: 'ERROR',
        error: error.message
      });
    }

  } catch (error) {
    console.error('Browser error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  console.log('\n');

  // Generate summary
  console.log('📊 NAVIGATION ROUTING TEST SUMMARY (CSR)');
  console.log('=' .repeat(80));
  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`Passed: ${results.passedTests}`);
  console.log(`Failed: ${results.failedTests}`);
  console.log(`Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%`);

  console.log('\n📋 DETAILED RESULTS:');
  results.details.forEach((detail, index) => {
    console.log(`${index + 1}. ${detail.test}: ${detail.status}`);
    if (detail.error) console.log(`   Error: ${detail.error}`);
    if (detail.articleCards !== undefined) console.log(`   Article Cards: ${detail.articleCards}`);
    if (detail.hasLinkElements !== undefined) console.log(`   Link Elements: ${detail.hasLinkElements}`);
    if (detail.hasArticleContent !== undefined) console.log(`   Article Content: ${detail.hasArticleContent ? '✅' : '❌'}`);
    if (detail.hasBackNavigation !== undefined) console.log(`   Back Navigation: ${detail.hasBackNavigation ? '✅' : '❌'}`);
    if (detail.channelLinks !== undefined) console.log(`   Channel Links: ${detail.channelLinks}`);
    if (detail.navigatedSuccessfully !== undefined) console.log(`   Navigation Success: ${detail.navigatedSuccessfully ? '✅' : '❌'}`);
  });

  console.log('\n🎯 RECOMMENDATIONS:');
  
  const failedTests = results.details.filter(d => d.status === 'FAIL' || d.status === 'ERROR');
  if (failedTests.length > 0) {
    console.log('❌ Issues found that need attention:');
    failedTests.forEach(test => {
      console.log(`   • ${test.test}: ${test.error || 'Test failed'}`);
    });
  }

  const partialTests = results.details.filter(d => d.status === 'PARTIAL');
  if (partialTests.length > 0) {
    console.log('⚠️  Partial issues:');
    partialTests.forEach(test => {
      console.log(`   • ${test.test}: Some functionality missing`);
    });
  }

  if (results.passedTests === results.totalTests) {
    console.log('🎉 All navigation routing tests passed! Client-side routing is working correctly.');
  } else {
    console.log('🔧 Some navigation routing issues need to be fixed.');
  }

  return results;
}

// Run the test
async function runTest() {
  try {
    console.log('🚀 Starting Navigation Routing Test (CSR)...\n');
    const results = await testNavigationRoutingCSR();
    
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
