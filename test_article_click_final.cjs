const puppeteer = require('puppeteer');

// Channel configuration
const channels = [
  { id: 'beritadesa', name: 'BeritaDesa', baseUrl: 'http://localhost:5000' },
  { id: 'beritalaut', name: 'BeritaLaut', baseUrl: 'http://localhost:5000' },
  { id: 'cakranews', name: 'CakraNews', baseUrl: 'http://localhost:5000' },
  { id: 'mjbnews', name: 'MJBNews', baseUrl: 'http://localhost:5000' },
  { id: 'ambal', name: 'Ambal', baseUrl: 'http://localhost:5000' },
  { id: 'inforurutsewu', name: 'InfoUrutSewu', baseUrl: 'http://localhost:5000' },
  { id: 'dendelesinfo', name: 'DendelesInfo', baseUrl: 'http://localhost:5000' },
  { id: 'kresnanusantara', name: 'KresnaNusantara', baseUrl: 'http://localhost:5000' },
  { id: 'voliinfo', name: 'VoliInfo', baseUrl: 'http://localhost:5000' },
  { id: 'berasbalap', name: 'BerasBalap', baseUrl: 'http://localhost:5000' },
  { id: 'beritaangin', name: 'BeritaAngin', baseUrl: 'http://localhost:5000' },
  { id: 'duniatengah', name: 'DuniaTengah', baseUrl: 'http://localhost:5000' }
];

async function testArticleClicks() {
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging from the page
  page.on('console', msg => {
    console.log('PAGE LOG:', msg.text());
  });
  
  // Enable request/response logging for debugging
  page.on('request', request => {
    if (request.url().includes('/api/') || request.url().includes('uploads/')) {
      console.log('REQUEST:', request.method(), request.url());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/') || response.url().includes('uploads/')) {
      console.log('RESPONSE:', response.status(), response.url());
    }
  });
  
  const results = {
    totalChannels: channels.length,
    channelsTested: 0,
    totalArticles: 0,
    successfulClicks: 0,
    failedClicks: 0,
    imageErrors: 0,
    channelResults: []
  };
  
  console.log('🚀 Starting comprehensive article click test...\n');
  
  for (const channel of channels) {
    console.log(`\n📰 Testing channel: ${channel.name} (${channel.id})`);
    
    const channelResult = {
      id: channel.id,
      name: channel.name,
      articlesFound: 0,
      articlesTested: 0,
      successfulClicks: 0,
      failedClicks: 0,
      imageErrors: 0,
      errors: []
    };
    
    try {
      // Navigate to channel homepage
      const channelUrl = `${channel.baseUrl}/${channel.id}`;
      console.log(`📍 Navigating to: ${channelUrl}`);
      
      await page.goto(channelUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Look for article cards
      const articleCards = await page.$$('[data-testid^="card-article-"]');
      console.log(`📄 Found ${articleCards.length} article cards`);
      
      if (articleCards.length === 0) {
        console.log('⚠️  No article cards found, checking for alternative selectors...');
        
        // Try alternative selectors
        const alternativeCards = await page.$$('a[href*="/article/"]');
        console.log(`📄 Found ${alternativeCards.length} alternative article links`);
        
        if (alternativeCards.length === 0) {
          channelResult.errors.push('No articles found on channel page');
          results.channelResults.push(channelResult);
          continue;
        }
      }
      
      // Test up to 3 articles per channel
      const cardsToTest = articleCards.length > 0 ? articleCards.slice(0, 3) : (await page.$$('a[href*="/article/"]')).slice(0, 3);
      channelResult.articlesFound = cardsToTest.length;
      
      for (let i = 0; i < cardsToTest.length; i++) {
        const card = cardsToTest[i];
        console.log(`\n🔗 Testing article ${i + 1}/${cardsToTest.length}`);
        
        try {
          // Get article info before clicking
          let articleInfo = {};
          
          if (articleCards.length > 0) {
            // Get data-testid attribute
            const testId = await page.evaluate(el => el.getAttribute('data-testid'), card);
            articleInfo.testId = testId;
            
            // Get article title
            const titleElement = await card.$('h3, h2');
            if (titleElement) {
              articleInfo.title = await page.evaluate(el => el.textContent.trim(), titleElement);
            }
            
            // Get image src
            const imgElement = await card.$('img');
            if (imgElement) {
              articleInfo.imageSrc = await page.evaluate(el => el.getAttribute('src'), imgElement);
            }
          } else {
            // For alternative links
            const href = await page.evaluate(el => el.getAttribute('href'), card);
            articleInfo.href = href;
            articleInfo.title = await page.evaluate(el => el.textContent.trim(), card);
          }
          
          console.log('📋 Article info:', articleInfo);
          
          // Check for image errors before clicking
          if (articleInfo.imageSrc) {
            const imageLoadResult = await page.evaluate((imgSrc) => {
              return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve({ success: true, width: img.width, height: img.height });
                img.onerror = () => resolve({ success: false, error: 'Image failed to load' });
                img.src = imgSrc;
              });
            }, articleInfo.imageSrc);
            
            if (!imageLoadResult.success) {
              console.log('⚠️  Image failed to load:', articleInfo.imageSrc);
              channelResult.imageErrors++;
              results.imageErrors++;
            } else {
              console.log('✅ Image loaded successfully:', imageLoadResult);
            }
          }
          
          // Click the article
          console.log('🖱️  Clicking article...');
          await card.click();
          
          // Wait for navigation
          await page.waitForNavigation({ 
            waitUntil: 'networkidle2',
            timeout: 15000 
          });
          
          // Wait a bit more for content to load
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if we're on an article page
          const currentUrl = page.url();
          console.log('📍 Current URL after click:', currentUrl);
          
          if (currentUrl.includes('/article/')) {
            console.log('✅ Successfully navigated to article page');
            
            // Check if article content loaded
            const articleContent = await page.$('[data-testid="article-content"]');
            if (articleContent) {
              console.log('✅ Article content found');
              
              // Check for images in article content
              const articleImages = await page.$$('[data-testid="article-content"] img');
              console.log(`🖼️  Found ${articleImages.length} images in article content`);
              
              // Test each image
              for (let j = 0; j < articleImages.length; j++) {
                const img = articleImages[j];
                const imgSrc = await page.evaluate(el => el.getAttribute('src'), img);
                
                const imgResult = await page.evaluate((src) => {
                  return new Promise((resolve) => {
                    const testImg = new Image();
                    testImg.onload = () => resolve({ success: true });
                    testImg.onerror = () => resolve({ success: false });
                    testImg.src = src;
                  });
                }, imgSrc);
                
                if (!imgResult.success) {
                  console.log(`⚠️  Article image ${j + 1} failed to load:`, imgSrc);
                  channelResult.imageErrors++;
                  results.imageErrors++;
                } else {
                  console.log(`✅ Article image ${j + 1} loaded successfully`);
                }
              }
              
              channelResult.successfulClicks++;
              results.successfulClicks++;
            } else {
              console.log('⚠️  Article content not found');
              channelResult.failedClicks++;
              results.failedClicks++;
            }
          } else {
            console.log('❌ Failed to navigate to article page');
            channelResult.failedClicks++;
            results.failedClicks++;
          }
          
          channelResult.articlesTested++;
          results.totalArticles++;
          
          // Go back to channel page for next article
          await page.goBack({ waitUntil: 'networkidle2', timeout: 10000 });
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`❌ Error testing article ${i + 1}:`, error.message);
          channelResult.errors.push(`Article ${i + 1}: ${error.message}`);
          channelResult.failedClicks++;
          results.failedClicks++;
          
          // Try to go back to channel page
          try {
            await page.goto(channelUrl, { waitUntil: 'networkidle2', timeout: 10000 });
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (backError) {
            console.error('Error going back to channel page:', backError.message);
          }
        }
      }
      
      results.channelsTested++;
      
    } catch (error) {
      console.error(`❌ Error testing channel ${channel.name}:`, error.message);
      channelResult.errors.push(`Channel error: ${error.message}`);
    }
    
    results.channelResults.push(channelResult);
    
    console.log(`\n📊 Channel ${channel.name} summary:`);
    console.log(`   Articles found: ${channelResult.articlesFound}`);
    console.log(`   Articles tested: ${channelResult.articlesTested}`);
    console.log(`   Successful clicks: ${channelResult.successfulClicks}`);
    console.log(`   Failed clicks: ${channelResult.failedClicks}`);
    console.log(`   Image errors: ${channelResult.imageErrors}`);
    if (channelResult.errors.length > 0) {
      console.log(`   Errors: ${channelResult.errors.join(', ')}`);
    }
  }
  
  await browser.close();
  
  // Generate final report
  console.log('\n' + '='.repeat(80));
  console.log('🎯 FINAL ARTICLE CLICK TEST REPORT');
  console.log('='.repeat(80));
  console.log(`📊 Overall Statistics:`);
  console.log(`   Total channels: ${results.totalChannels}`);
  console.log(`   Channels tested: ${results.channelsTested}`);
  console.log(`   Total articles tested: ${results.totalArticles}`);
  console.log(`   Successful clicks: ${results.successfulClicks}`);
  console.log(`   Failed clicks: ${results.failedClicks}`);
  console.log(`   Image errors: ${results.imageErrors}`);
  
  const successRate = results.totalArticles > 0 ? 
    ((results.successfulClicks / results.totalArticles) * 100).toFixed(2) : 0;
  console.log(`   Success rate: ${successRate}%`);
  
  console.log('\n📋 Channel Details:');
  results.channelResults.forEach(channel => {
    console.log(`\n📰 ${channel.name} (${channel.id}):`);
    console.log(`   Articles: ${channel.articlesFound} found, ${channel.articlesTested} tested`);
    console.log(`   Clicks: ${channel.successfulClicks} success, ${channel.failedClicks} failed`);
    console.log(`   Images: ${channel.imageErrors} errors`);
    if (channel.errors.length > 0) {
      console.log(`   Errors: ${channel.errors.join('; ')}`);
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Article click test completed!');
  console.log('='.repeat(80));
  
  return results;
}

// Run the test
testArticleClicks().then(results => {
  console.log('\n🎉 Test completed successfully!');
  process.exit(results.failedClicks > 0 ? 1 : 0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
