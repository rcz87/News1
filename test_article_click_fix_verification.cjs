const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

async function testArticleClickFix() {
  console.log('🔧 Testing Article Click Fix Verification...\n');

  let browser;
  let results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    errors: []
  };

  try {
    // Check if dev server is running
    console.log('📡 Checking development server...');
    try {
      const response = await fetch('http://localhost:5000');
      if (!response.ok) {
        throw new Error('Server not responding');
      }
      console.log('✅ Development server is running\n');
    } catch (error) {
      console.log('❌ Development server not found. Starting server...');
      try {
        execSync('npm run dev', { stdio: 'inherit', detached: true });
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('✅ Development server started\n');
      } catch (startError) {
        console.log('❌ Failed to start development server');
        process.exit(1);
      }
    }

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set up console logging
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Warning: React has detected a change in the order of Hooks')) {
        results.errors.push(`REACT HOOKS ERROR: ${text}`);
      } else if (text.includes('Error')) {
        results.errors.push(`ERROR: ${text}`);
      }
    });

    page.on('pageerror', error => {
      results.errors.push(`PAGE ERROR: ${error.message}`);
    });

    // Test channels with articles
    const testChannels = [
      { name: 'BeritaLaut', path: '/beritalaut', expectedArticles: 3 },
      { name: 'CakraNews', path: '/cakranews', expectedArticles: 1 },
      { name: 'Ambal', path: '/ambal', expectedArticles: 3 }
    ];

    for (const channel of testChannels) {
      console.log(`📰 Testing channel: ${channel.name}`);
      results.totalTests++;

      try {
        // Navigate to channel page
        await page.goto(`http://localhost:5000${channel.path}`, { 
          waitUntil: 'networkidle2',
          timeout: 10000 
        });

        // Wait for articles to load
        await page.waitForSelector('[data-testid^="card-article-"]', { timeout: 5000 });

        // Get first article
        const articles = await page.$$('[data-testid^="card-article-"]');
        
        if (articles.length === 0) {
          results.errors.push(`${channel.name}: No articles found`);
          results.failedTests++;
          continue;
        }

        console.log(`📄 Found ${articles.length} articles`);

        // Test first article click
        const firstArticle = articles[0];
        const articleInfo = await page.evaluate(el => {
          const title = el.querySelector('h3, h4')?.textContent?.trim() || 'Unknown';
          const testId = el.getAttribute('data-testid') || 'unknown';
          return { title, testId };
        }, firstArticle);

        console.log(`🔗 Testing article: ${articleInfo.title.substring(0, 50)}...`);

        // Click article
        await firstArticle.click();

        // Wait for navigation to article page
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 });

        // Check if we're on article page
        const currentUrl = page.url();
        if (currentUrl.includes('/article/')) {
          console.log('✅ Successfully navigated to article page');
          
          // Check for React hooks errors
          await page.waitForTimeout(2000); // Wait for any React errors to appear
          
          if (results.errors.filter(e => e.includes('REACT HOOKS ERROR')).length === 0) {
            console.log('✅ No React hooks errors detected');
            results.passedTests++;
          } else {
            console.log('❌ React hooks errors still present');
            results.failedTests++;
          }
        } else {
          console.log('❌ Failed to navigate to article page');
          results.failedTests++;
        }

        // Go back to channel page for next test
        await page.goBack();

      } catch (error) {
        console.log(`❌ Error testing ${channel.name}: ${error.message}`);
        results.errors.push(`${channel.name}: ${error.message}`);
        results.failedTests++;
      }

      console.log(''); // Empty line for readability
    }

  } catch (error) {
    console.error('❌ Test execution error:', error);
    results.errors.push(`EXECUTION ERROR: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Print results
  console.log('================================================================================');
  console.log('🎯 ARTICLE CLICK FIX VERIFICATION RESULTS');
  console.log('================================================================================');
  console.log(`📊 Total Tests: ${results.totalTests}`);
  console.log(`✅ Passed: ${results.passedTests}`);
  console.log(`❌ Failed: ${results.failedTests}`);
  console.log(`🚨 Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 Error Details:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  const successRate = results.totalTests > 0 ? (results.passedTests / results.totalTests * 100).toFixed(1) : 0;
  console.log(`\n📈 Success Rate: ${successRate}%`);

  if (results.passedTests === results.totalTests && results.errors.length === 0) {
    console.log('\n🎉 ALL TESTS PASSED! React hooks fix is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. React hooks fix may need additional work.');
  }

  console.log('================================================================================');

  return results;
}

// Run the test
testArticleClickFix().catch(console.error);
