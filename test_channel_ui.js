#!/usr/bin/env node

import http from 'http';

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test function to check UI elements
function checkUIElements(html, channelName) {
  const checks = {
    hasChannelName: html.includes(channelName),
    hasHeader: html.includes('<header') || html.includes('Header'),
    hasFooter: html.includes('<footer') || html.includes('Footer'),
    hasNavigation: html.includes('nav') || html.includes('navigation'),
    hasMainContent: html.includes('<main') || html.includes('main'),
    hasArticleCards: html.includes('article') || html.includes('ArticleCard'),
    hasChannelLinks: html.includes('href="/') || html.includes('Link'),
    hasResponsiveDesign: html.includes('responsive') || html.includes('mobile') || html.includes('md:'),
    hasLoadingStates: html.includes('loading') || html.includes('Loading') || html.includes('skeleton'),
  };
  
  return checks;
}

// Test individual article pages
async function testArticlePages(channelId) {
  console.log(`  📄 Testing article pages for ${channelId}`);
  
  try {
    // Get articles list
    const articlesResponse = await makeRequest(`http://localhost:5000/api/channels/${channelId}/articles`);
    const articles = JSON.parse(articlesResponse.data);
    
    if (articles.length === 0) {
      console.log(`    ℹ️  No articles found for ${channelId}`);
      return { success: true, tested: 0 };
    }
    
    // Test first 2 articles to avoid too many requests
    const articlesToTest = articles.slice(0, 2);
    let tested = 0;
    let passed = 0;
    
    for (const article of articlesToTest) {
      try {
        tested++;
        const articleUrl = `http://localhost:5000/${channelId}/article/${article.slug}`;
        const articleResponse = await makeRequest(articleUrl);
        
        if (articleResponse.statusCode === 200) {
          passed++;
          console.log(`    ✅ Article: ${article.title.substring(0, 50)}...`);
          
          // Check if article page has proper structure
          const uiChecks = checkUIElements(articleResponse.data, article.title);
          const hasContent = articleResponse.data.length > 1000;
          
          if (!hasContent) {
            console.log(`      ⚠️  Article content seems short`);
          }
        } else {
          console.log(`    ❌ Article failed: ${article.title} - Status: ${articleResponse.statusCode}`);
        }
      } catch (error) {
        console.log(`    ❌ Article error: ${article.title} - ${error.message}`);
      }
    }
    
    return { success: passed === tested, tested, passed };
  } catch (error) {
    console.log(`    ❌ Failed to get articles: ${error.message}`);
    return { success: false, tested: 0, passed: 0 };
  }
}

// Test category pages
async function testCategoryPages(channelId) {
  console.log(`  📂 Testing category pages for ${channelId}`);
  
  try {
    // Get categories list
    const categoriesResponse = await makeRequest(`http://localhost:5000/api/channels/${channelId}/categories`);
    const categories = JSON.parse(categoriesResponse.data);
    
    if (categories.length === 0) {
      console.log(`    ℹ️  No categories found for ${channelId}`);
      return { success: true, tested: 0 };
    }
    
    // Test first 2 categories
    const categoriesToTest = categories.slice(0, 2);
    let tested = 0;
    let passed = 0;
    
    for (const category of categoriesToTest) {
      try {
        tested++;
        const categoryUrl = `http://localhost:5000/${channelId}/category/${category}`;
        const categoryResponse = await makeRequest(categoryUrl);
        
        if (categoryResponse.statusCode === 200) {
          passed++;
          console.log(`    ✅ Category: ${category}`);
        } else {
          console.log(`    ❌ Category failed: ${category} - Status: ${categoryResponse.statusCode}`);
        }
      } catch (error) {
        console.log(`    ❌ Category error: ${category} - ${error.message}`);
      }
    }
    
    return { success: passed === tested, tested, passed };
  } catch (error) {
    console.log(`    ❌ Failed to get categories: ${error.message}`);
    return { success: false, tested: 0, passed: 0 };
  }
}

// Main UI test function
async function testChannelUI() {
  console.log('🎨 Starting comprehensive UI testing for all channels...\n');
  
  const channels = [
    { id: 'ambal', name: 'Ambal News' },
    { id: 'beritaangin', name: 'Berita Angin' },
    { id: 'dendelesinfo', name: 'Dendeles Info' },
    { id: 'beritadesa', name: 'Berita Desa' },
    { id: 'kresnanusantara', name: 'Kresna Nusantara' },
    { id: 'inforurutsewu', name: 'Info Urut Sewu' },
    { id: 'duniatengah', name: 'Dunia Tengah' },
    { id: 'voliinfo', name: 'Voli Info' },
    { id: 'beritalaut', name: 'Berita Laut' },
    { id: 'berasbalap', name: 'Beras Balap' },
    { id: 'cakranews', name: 'CAKRANEWS' },
    { id: 'mjbnews', name: 'MJBNEWS' }
  ];
  
  // Test channel selector page first
  console.log('🏠 Testing Channel Selector Page');
  try {
    const homeResponse = await makeRequest('http://localhost:5000/');
    if (homeResponse.statusCode === 200) {
      console.log('✅ Channel selector page loads successfully');
      
      // Check if all channels are listed
      let channelsFound = 0;
      channels.forEach(channel => {
        if (homeResponse.data.includes(channel.id) && homeResponse.data.includes(channel.name)) {
          channelsFound++;
        }
      });
      
      console.log(`📊 Found ${channelsFound}/${channels.length} channels in selector`);
      
      if (channelsFound < channels.length) {
        console.log('⚠️  Some channels might be missing from the selector');
      }
    } else {
      console.log(`❌ Channel selector failed - Status: ${homeResponse.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Channel selector error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  let totalUITests = 0;
  let passedUITests = 0;
  const uiResults = {};
  
  // Test each channel's UI
  for (const channel of channels) {
    console.log(`\n🎨 Testing UI for: ${channel.name} (${channel.id})`);
    
    try {
      // Test channel homepage
      const homepageResponse = await makeRequest(`http://localhost:5000/${channel.id}`);
      
      if (homepageResponse.statusCode === 200) {
        console.log(`  ✅ Homepage loads successfully`);
        
        // Check UI elements
        const uiChecks = checkUIElements(homepageResponse.data, channel.name);
        const passedChecks = Object.values(uiChecks).filter(Boolean).length;
        const totalChecks = Object.keys(uiChecks).length;
        
        console.log(`  📊 UI Elements: ${passedChecks}/${totalChecks} checks passed`);
        
        // Show specific UI issues
        if (!uiChecks.hasChannelName) {
          console.log(`    ⚠️  Channel name not found in page`);
        }
        if (!uiChecks.hasHeader) {
          console.log(`    ⚠️  Header element missing`);
        }
        if (!uiChecks.hasFooter) {
          console.log(`    ⚠️  Footer element missing`);
        }
        if (!uiChecks.hasArticleCards) {
          console.log(`    ⚠️  Article cards not found`);
        }
        
        totalUITests++;
        if (passedChecks >= totalChecks * 0.8) { // 80% pass rate
          passedUITests++;
        }
        
        uiResults[channel.id] = {
          homepage: { success: true, uiChecks },
          articles: await testArticlePages(channel.id),
          categories: await testCategoryPages(channel.id)
        };
      } else {
        console.log(`  ❌ Homepage failed - Status: ${homepageResponse.statusCode}`);
        uiResults[channel.id] = {
          homepage: { success: false, statusCode: homepageResponse.statusCode },
          articles: { success: false },
          categories: { success: false }
        };
        totalUITests += 3; // homepage + articles + categories
      }
    } catch (error) {
      console.log(`  ❌ Homepage error: ${error.message}`);
      uiResults[channel.id] = {
        homepage: { success: false, error: error.message },
        articles: { success: false },
        categories: { success: false }
      };
      totalUITests += 3;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎨 UI TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total UI Tests: ${totalUITests}`);
  console.log(`Passed: ${passedUITests}`);
  console.log(`Failed: ${totalUITests - passedUITests}`);
  console.log(`Success Rate: ${((passedUITests / totalUITests) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Channel UI Status:');
  for (const [channelId, results] of Object.entries(uiResults)) {
    const homepageStatus = results.homepage.success ? '✅' : '❌';
    const articlesStatus = results.articles.success ? '✅' : '❌';
    const categoriesStatus = results.categories.success ? '✅' : '❌';
    
    console.log(`  ${homepageStatus} ${channelId}: Homepage ${articlesStatus} Articles ${categoriesStatus} Categories`);
    
    if (results.articles.tested > 0) {
      console.log(`    📄 Articles: ${results.articles.passed}/${results.articles.tested} tested`);
    }
    if (results.categories.tested > 0) {
      console.log(`    📂 Categories: ${results.categories.passed}/${results.categories.tested} tested`);
    }
  }
  
  console.log('\n🎉 UI testing completed!');
  
  if (passedUITests < totalUITests) {
    console.log('\n⚠️  Some UI issues detected. Please check the details above.');
  } else {
    console.log('\n✅ All UI tests passed successfully!');
  }
}

// Run the UI tests
testChannelUI().catch(error => {
  console.error('❌ UI test script failed:', error);
  process.exit(1);
});
