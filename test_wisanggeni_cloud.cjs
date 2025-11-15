const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'https://wisanggeni.cloud';
const TIMEOUT = 10000;

// Channels to test
const channels = [
  'ambal', 'beritaangin', 'dendelesinfo', 'beritadesa', 
  'kresnanusantara', 'inforurutsewu', 'duniatengah', 
  'voliinfo', 'beritalaut', 'berasbalap', 'cakranews', 'mjbnews'
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: TIMEOUT }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
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
  });
}

async function testChannel(channelId) {
  console.log(`\n🔍 Testing channel: ${channelId}`);
  
  try {
    // Test channel API
    const apiUrl = `${BASE_URL}/api/channels/${channelId}/articles`;
    const apiResponse = await makeRequest(apiUrl);
    
    if (apiResponse.statusCode !== 200) {
      console.log(`   ❌ API failed - Status: ${apiResponse.statusCode}`);
      return { success: false, error: `API Status: ${apiResponse.statusCode}` };
    }
    
    let articles;
    try {
      articles = JSON.parse(apiResponse.data);
    } catch (e) {
      console.log(`   ❌ Invalid JSON response`);
      return { success: false, error: 'Invalid JSON' };
    }
    
    if (!Array.isArray(articles) || articles.length === 0) {
      console.log(`   ⚠️  No articles found`);
      return { success: true, articles: [], working: 0, failed: 0 };
    }
    
    console.log(`   ✅ API accessible - ${articles.length} articles found`);
    
    // Test frontend channel page
    try {
      const frontendResponse = await makeRequest(`${BASE_URL}/${channelId}`);
      if (frontendResponse.statusCode === 200) {
        console.log(`   ✅ Frontend accessible`);
      } else {
        console.log(`   ⚠️  Frontend issue - Status: ${frontendResponse.statusCode}`);
      }
    } catch (e) {
      console.log(`   ⚠️  Frontend error: ${e.message}`);
    }
    
    // Test individual articles
    console.log(`   📝 Testing ${articles.length} articles...`);
    let workingCount = 0;
    let failedArticles = [];
    
    for (let i = 0; i < Math.min(articles.length, 5); i++) { // Test max 5 articles per channel
      const article = articles[i];
      const articleUrl = `${BASE_URL}/${channelId}/${article.slug}`;
      
      try {
        const articleResponse = await makeRequest(articleUrl);
        if (articleResponse.statusCode === 200) {
          console.log(`     ✅ ${article.title.substring(0, 50)}${article.title.length > 50 ? '...' : ''}`);
          workingCount++;
        } else {
          console.log(`     ❌ ${article.title.substring(0, 50)}${article.title.length > 50 ? '...' : ''} - Status: ${articleResponse.statusCode}`);
          failedArticles.push({ title: article.title, slug: article.slug, status: articleResponse.statusCode });
        }
      } catch (e) {
        console.log(`     ❌ ${article.title.substring(0, 50)}${article.title.length > 50 ? '...' : ''} - Error: ${e.message}`);
        failedArticles.push({ title: article.title, slug: article.slug, error: e.message });
      }
    }
    
    const totalTested = Math.min(articles.length, 5);
    const successRate = totalTested > 0 ? (workingCount / totalTested * 100).toFixed(1) : 100;
    
    if (workingCount === totalTested) {
      console.log(`   🎉 Channel ${channelId}: All tested articles working! (${workingCount}/${totalTested})`);
    } else {
      console.log(`   ⚠️  Channel ${channelId}: ${workingCount}/${totalTested} articles working (${successRate}%)`);
    }
    
    return { 
      success: true, 
      articles: articles.length,
      tested: totalTested,
      working: workingCount,
      failed: failedArticles.length,
      successRate: successRate
    };
    
  } catch (error) {
    console.log(`   ❌ Channel test failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🌐 Testing https://wisanggeni.cloud/ - All Channels and Articles');
  console.log('='.repeat(60));
  
  // Test main site first
  console.log('\n🔍 Testing main site...');
  try {
    const mainResponse = await makeRequest(BASE_URL);
    if (mainResponse.statusCode === 200) {
      console.log('✅ Main site accessible');
    } else {
      console.log(`❌ Main site failed - Status: ${mainResponse.statusCode}`);
      return;
    }
  } catch (e) {
    console.log(`❌ Main site error: ${e.message}`);
    return;
  }
  
  // Test channels API
  console.log('\n🔍 Testing channels API...');
  try {
    const channelsResponse = await makeRequest(`${BASE_URL}/api/channels`);
    if (channelsResponse.statusCode === 200) {
      const channelsData = JSON.parse(channelsResponse.data);
      console.log(`✅ Channels API accessible - ${channelsData.length} channels found`);
    } else {
      console.log(`❌ Channels API failed - Status: ${channelsResponse.statusCode}`);
      return;
    }
  } catch (e) {
    console.log(`❌ Channels API error: ${e.message}`);
    return;
  }
  
  // Test each channel
  const results = {};
  let totalChannels = 0;
  let successfulChannels = 0;
  let totalArticles = 0;
  let totalTested = 0;
  let totalWorking = 0;
  
  for (const channelId of channels) {
    totalChannels++;
    const result = await testChannel(channelId);
    results[channelId] = result;
    
    if (result.success) {
      successfulChannels++;
      totalArticles += result.articles || 0;
      totalTested += result.tested || 0;
      totalWorking += result.working || 0;
    }
  }
  
  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📋 WISANGGENI.CLOUD TEST REPORT');
  console.log('='.repeat(60));
  
  console.log('\n📊 SUMMARY:');
  console.log(`   Total Channels: ${totalChannels}`);
  console.log(`   Successful Channels: ${successfulChannels}`);
  console.log(`   Failed Channels: ${totalChannels - successfulChannels}`);
  console.log(`   Total Articles Available: ${totalArticles}`);
  console.log(`   Articles Tested: ${totalTested}`);
  console.log(`   Articles Working: ${totalWorking}`);
  console.log(`   Articles Failed: ${totalTested - totalWorking}`);
  
  const channelSuccessRate = totalChannels > 0 ? (successfulChannels / totalChannels * 100).toFixed(1) : 0;
  const articleSuccessRate = totalTested > 0 ? (totalWorking / totalTested * 100).toFixed(1) : 0;
  
  console.log('\n📈 SUCCESS RATES:');
  console.log(`   Channels: ${channelSuccessRate}%`);
  console.log(`   Articles: ${articleSuccessRate}%`);
  
  console.log('\n📋 CHANNEL DETAILS:');
  for (const [channelId, result] of Object.entries(results)) {
    if (result.success) {
      const status = result.working === result.tested ? '✅' : '⚠️';
      const rate = result.tested > 0 ? `${result.working}/${result.tested} (${result.successRate}%)` : 'N/A';
      console.log(`   ${status} ${channelId}: ${rate} - ${result.articles} total articles`);
    } else {
      console.log(`   ❌ ${channelId}: ${result.error}`);
    }
  }
  
  console.log('\n💡 CONCLUSION:');
  if (successfulChannels === totalChannels && totalWorking === totalTested) {
    console.log('   🎉 All systems working perfectly!');
  } else if (successfulChannels === totalChannels) {
    console.log(`   ✅ All channels accessible, ${totalTested - totalWorking} articles have issues`);
  } else {
    console.log(`   ⚠️  ${totalChannels - successfulChannels} channels have issues`);
  }
  
  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalChannels,
      successfulChannels,
      failedChannels: totalChannels - successfulChannels,
      totalArticles,
      totalTested,
      totalWorking,
      totalFailed: totalTested - totalWorking,
      channelSuccessRate: parseFloat(channelSuccessRate),
      articleSuccessRate: parseFloat(articleSuccessRate)
    },
    results
  };
  
  require('fs').writeFileSync('wisanggeni-cloud-test-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n💾 Detailed report saved to: wisanggeni-cloud-test-report.json');
}

main().catch(console.error);
