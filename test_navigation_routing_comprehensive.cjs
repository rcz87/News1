const puppeteer = require('puppeteer');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testNavigationRouting() {
  console.log('🚀 Starting Comprehensive Navigation Routing Test...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport and timeout
  await page.setViewport({ width: 1200, height: 800 });
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(30000);
  
  const results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    details: []
  };
  
  async function testPage(url, testName, expectedElements = []) {
    results.totalTests++;
    console.log(`🧪 Testing ${testName}: ${url}`);
    
    try {
      const response = await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      if (!response.ok()) {
        throw new Error(`HTTP ${response.status}: ${response.statusText()}`);
      }
      
      // Wait for React to fully render
      await sleep(5000);
      
      // Check for React app
      const hasReactApp = await page.evaluate(() => {
        return document.querySelector('#root') && document.querySelector('#root').children.length > 0;
      });
      
      if (!hasReactApp) {
        throw new Error('React app not loaded');
      }
      
      // Wait additional time for data to load
      await sleep(3000);
      
      // Check for specific elements
      const elementResults = {};
      for (const [elementName, selector] of Object.entries(expectedElements)) {
        const elements = await page.$$(selector);
        elementResults[elementName] = elements.length;
      }
      
      // Check for article cards specifically
      const articleCards = await page.$$('[data-testid^="card-article-"]');
      const articleLinks = await page.$$('a[href*="/article/"]');
      
      console.log(`✅ ${testName}: PASS`);
      console.log(`   📊 Article Cards: ${articleCards.length}`);
      console.log(`   🔗 Article Links: ${articleLinks.length}`);
      
      if (Object.keys(elementResults).length > 0) {
        console.log(`   📋 Element Details:`, elementResults);
      }
      
      results.passedTests++;
      results.details.push({
        test: testName,
        status: 'PASS',
        articleCards: articleCards.length,
        articleLinks: articleLinks.length,
        elements: elementResults
      });
      
    } catch (error) {
      console.log(`❌ ${testName}: FAIL - ${error.message}`);
      results.failedTests++;
      results.details.push({
        test: testName,
        status: 'FAIL',
        error: error.message
      });
    }
    
    console.log('');
  }
  
  // Test 1: Channel Homepages with comprehensive checks
  console.log('📋 Test 1: Channel Homepage Accessibility (Comprehensive)');
  console.log('--------------------------------------------------');
  
  const channels = ['ambal', 'beritadesa', 'voliinfo', 'mjbnews'];
  
  for (const channel of channels) {
    await testPage(`http://localhost:5000/${channel}`, `${channel} homepage`, {
      'ReactRoot': '#root',
      'Layout': '[class*="layout"], [class*="Layout"]',
      'Articles': '[data-testid^="card-article-"]'
    });
  }
  
  // Test 2: Article Pages
  console.log('📋 Test 2: Article Page Accessibility (Comprehensive)');
  console.log('--------------------------------------------------');
  
  const testArticles = [
    { channel: 'ambal', slug: 'masyarakat-kebumen-sekarang-bisa-cetak-stnk' },
    { channel: 'beritadesa', slug: 'classic-car-rally' },
    { channel: 'voliinfo', slug: 'news-1' },
    { channel: 'mjbnews', slug: 'pabrik-es-mjb-kebumen-buka-lowongan-kerja' }
  ];
  
  for (const article of testArticles) {
    await testPage(
      `http://localhost:5000/${article.channel}/article/${article.slug}`, 
      `Article: ${article.channel}/${article.slug}`,
      {
        'ReactRoot': '#root',
        'ArticleContent': 'article, [class*="article"], [class*="Article"]',
        'Title': 'h1, [class*="title"]'
      }
    );
  }
  
  // Test 3: Channel Selector
  console.log('📋 Test 3: Channel Selector Functionality');
  console.log('--------------------------------------------------');
  
  await testPage('http://localhost:5000/', 'Root channel selector', {
    'ReactRoot': '#root',
    'ChannelLinks': 'a[href*="/"]'
  });
  
  // Test 4: Navigation Flow Test
  console.log('📋 Test 4: Navigation Flow Test');
  console.log('--------------------------------------------------');
  
  try {
    console.log('🧪 Testing navigation flow from homepage to article...');
    
    // Go to a channel homepage
    await page.goto('http://localhost:5000/ambal', { waitUntil: 'networkidle2' });
    await sleep(5000);
    
    // Look for article links
    const articleLinks = await page.$$('a[href*="/article/"]');
    
    if (articleLinks.length > 0) {
      // Click the first article link
      await articleLinks[0].click();
      await sleep(3000);
      
      // Check if we navigated to an article page
      const currentUrl = page.url();
      if (currentUrl.includes('/article/')) {
        console.log('✅ Navigation flow: PASS - Successfully navigated to article');
        results.passedTests++;
        results.details.push({
          test: 'Navigation flow',
          status: 'PASS',
          url: currentUrl
        });
      } else {
        throw new Error('Did not navigate to article page');
      }
    } else {
      throw new Error('No article links found on homepage');
    }
  } catch (error) {
    console.log(`❌ Navigation flow: FAIL - ${error.message}`);
    results.failedTests++;
    results.details.push({
      test: 'Navigation flow',
      status: 'FAIL',
      error: error.message
    });
  }
  
  results.totalTests++; // Count the navigation flow test
  
  await browser.close();
  
  // Print summary
  console.log('\n📊 COMPREHENSIVE NAVIGATION ROUTING TEST SUMMARY');
  console.log('================================================================================');
  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`Passed: ${results.passedTests}`);
  console.log(`Failed: ${results.failedTests}`);
  console.log(`Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%\n`);
  
  console.log('📋 DETAILED RESULTS:');
  results.details.forEach((result, index) => {
    console.log(`${index + 1}. ${result.test}: ${result.status}`);
    if (result.articleCards !== undefined) {
      console.log(`   Article Cards: ${result.articleCards}`);
      console.log(`   Article Links: ${result.articleLinks}`);
    }
    if (result.elements) {
      console.log(`   Elements:`, result.elements);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.url) {
      console.log(`   URL: ${result.url}`);
    }
  });
  
  console.log('\n🎯 RECOMMENDATIONS:');
  if (results.failedTests === 0) {
    console.log('✅ All navigation routing tests passed!');
  } else {
    console.log('❌ Issues found that need attention:');
    results.details
      .filter(r => r.status === 'FAIL')
      .forEach(r => console.log(`   • ${r.test}: ${r.error || 'Test failed'}`));
  }
  
  if (results.passedTests === results.totalTests) {
    console.log('\n✅ Navigation routing test completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Navigation routing test completed with issues!');
    process.exit(1);
  }
}

testNavigationRouting().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
