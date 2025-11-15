const puppeteer = require('puppeteer');

async function testSimpleArticleVerification() {
  console.log('🔧 Simple Article Verification Test...\n');

  let browser;
  let results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    errors: []
  };

  try {
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
    
    // Set up console logging for React hooks errors
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

    // Test direct article URLs
    const testArticles = [
      { 
        name: 'BeritaLaut Article', 
        url: 'http://localhost:5000/beritalaut/article/satlantas-polres-kebumen-buka-samsat-paten-dikecamatan-ayah' 
      },
      { 
        name: 'CakraNews Article', 
        url: 'http://localhost:5000/cakranews/article/launch-announcement' 
      },
      { 
        name: 'Ambal Article', 
        url: 'http://localhost:5000/ambal/article/satlantas-polres-kebumen-buka-malam-hari' 
      }
    ];

    for (const article of testArticles) {
      console.log(`📄 Testing: ${article.name}`);
      results.totalTests++;

      try {
        // Navigate directly to article page
        const response = await page.goto(article.url, { 
          waitUntil: 'networkidle2',
          timeout: 10000 
        });

        if (!response.ok()) {
          throw new Error(`HTTP ${response.status()}`);
        }

        // Wait for article content to load
        await page.waitForSelector('[data-testid="article-content"]', { timeout: 5000 });

        // Check if article title is present
        const title = await page.$eval('h1', el => el.textContent?.trim()).catch(() => null);
        
        if (title) {
          console.log(`✅ Article loaded: ${title.substring(0, 50)}...`);
          results.passedTests++;
        } else {
          console.log('❌ No article title found');
          results.failedTests++;
        }

        // Wait a bit to catch any React errors
        await page.waitForTimeout(2000);

      } catch (error) {
        console.log(`❌ Error testing ${article.name}: ${error.message}`);
        results.errors.push(`${article.name}: ${error.message}`);
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
  console.log('🎯 SIMPLE ARTICLE VERIFICATION RESULTS');
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

  // Check specifically for React hooks errors
  const hooksErrors = results.errors.filter(e => e.includes('REACT HOOKS ERROR'));
  if (hooksErrors.length === 0) {
    console.log('\n✅ NO REACT HOOKS ERRORS DETECTED!');
  } else {
    console.log(`\n❌ ${hooksErrors.length} React hooks errors still present`);
  }

  if (results.passedTests === results.totalTests && hooksErrors.length === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Article pages are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed.');
  }

  console.log('================================================================================');

  return results;
}

// Run the test
testSimpleArticleVerification().catch(console.error);
