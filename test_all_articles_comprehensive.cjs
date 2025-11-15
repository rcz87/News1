#!/usr/bin/env node

/**
 * Comprehensive Test Script for All Articles Across All Channels
 * 
 * This script tests:
 * 1. All channels are accessible
 * 2. Articles in each channel can be opened
 * 3. Article links are clickable and functional
 * 4. API endpoints are working properly
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_BASE = 'http://localhost:5000';

// Channels from shared/channels.ts
const CHANNELS = [
  'ambal', 'beritaangin', 'dendelesinfo', 'beritadesa', 
  'kresnanusantara', 'inforurutsewu', 'duniatengah', 'voliinfo',
  'beritalaut', 'berasbalap', 'cakranews', 'mjbnews'
];

// Test results
const results = {
  channels: {},
  totalChannels: 0,
  totalArticles: 0,
  successfulChannels: 0,
  successfulArticles: 0,
  failedChannels: 0,
  failedArticles: 0,
  errors: []
};

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
            headers: response.headers,
          data: data
        });
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test if server is running
async function testServerConnection() {
  console.log('🔍 Testing server connection...');
  
  try {
    // Test main server
    const mainResponse = await makeRequest(BASE_URL);
    if (mainResponse.statusCode !== 200) {
      throw new Error(`Main server returned status ${mainResponse.statusCode}`);
    }
    
    // Test API server
    const apiResponse = await makeRequest(`${API_BASE}/api/channels`);
    if (apiResponse.statusCode !== 200) {
      throw new Error(`API server returned status ${apiResponse.statusCode}`);
    }
    
    console.log('✅ Servers are running and accessible');
    return true;
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    console.log('\n💡 Please make sure both servers are running:');
    console.log('   - Frontend: npm run dev (port 5173)');
    console.log('   - Backend: npm run server (port 5000)');
    return false;
  }
}

// Test channel API endpoint
async function testChannelAPI(channelId) {
  try {
    const response = await makeRequest(`${API_BASE}/api/channels/${channelId}/articles`);
    
    if (response.statusCode === 200) {
      const articles = JSON.parse(response.data);
      return {
        success: true,
        articles: articles,
        count: articles.length
      };
    } else {
      return {
        success: false,
        error: `HTTP ${response.statusCode}`,
        count: 0
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      count: 0
    };
  }
}

// Test individual article
async function testArticle(channelId, article) {
  try {
    const response = await makeRequest(`${API_BASE}/api/channels/${channelId}/articles/${article.slug}`);
    
    if (response.statusCode === 200) {
      const articleData = JSON.parse(response.data);
      
      // Validate article structure
      const requiredFields = ['slug', 'title', 'excerpt', 'author', 'publishedAt', 'category', 'content'];
      const missingFields = requiredFields.filter(field => !articleData[field]);
      
      if (missingFields.length > 0) {
        return {
          success: false,
          error: `Missing fields: ${missingFields.join(', ')}`
        };
      }
      
      // Check if HTML content is generated
      if (!articleData.htmlContent) {
        return {
          success: false,
          error: 'HTML content not generated'
        };
      }
      
      return {
        success: true,
        title: articleData.title,
        hasContent: articleData.content.length > 0,
        hasHtml: articleData.htmlContent.length > 0
      };
    } else if (response.statusCode === 404) {
      return {
        success: false,
        error: 'Article not found'
      };
    } else {
      return {
        success: false,
        error: `HTTP ${response.statusCode}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test channel frontend page
async function testChannelFrontend(channelId) {
  try {
    const response = await makeRequest(`${BASE_URL}/${channelId}`);
    
    if (response.statusCode === 200) {
      // Check if page contains expected elements
      const content = response.data;
      const hasChannelName = content.includes(channelId);
      const hasArticleCards = content.includes('article-card') || content.includes('ArticleCard');
      
      return {
        success: true,
        hasChannelName,
        hasArticleCards
      };
    } else {
      return {
        success: false,
        error: `HTTP ${response.statusCode}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Main test function
async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive Article Test Across All Channels\n');
  
  // Test server connection first
  const serverConnected = await testServerConnection();
  if (!serverConnected) {
    process.exit(1);
  }
  
  console.log('\n📊 Testing all channels and articles...\n');
  
  // Test each channel
  for (const channelId of CHANNELS) {
    console.log(`🔍 Testing channel: ${channelId}`);
    results.totalChannels++;
    
    const channelResult = {
      api: null,
      frontend: null,
      articles: [],
      totalArticles: 0,
      successfulArticles: 0,
      failedArticles: 0
    };
    
    // Test channel API
    const apiResult = await testChannelAPI(channelId);
    channelResult.api = apiResult;
    
    if (!apiResult.success) {
      console.log(`   ❌ API failed: ${apiResult.error}`);
      results.failedChannels++;
      results.errors.push(`Channel ${channelId} API: ${apiResult.error}`);
      results.channels[channelId] = channelResult;
      continue;
    }
    
    console.log(`   ✅ API accessible - ${apiResult.count} articles found`);
    
    // Test channel frontend
    const frontendResult = await testChannelFrontend(channelId);
    channelResult.frontend = frontendResult;
    
    if (!frontendResult.success) {
      console.log(`   ⚠️  Frontend issue: ${frontendResult.error}`);
    } else {
      console.log(`   ✅ Frontend accessible`);
    }
    
    // Test individual articles
    if (apiResult.articles && apiResult.articles.length > 0) {
      console.log(`   📝 Testing ${apiResult.articles.length} articles...`);
      
      for (const article of apiResult.articles) {
        results.totalArticles++;
        channelResult.totalArticles++;
        
        const articleResult = await testArticle(channelId, article);
        channelResult.articles.push({
          slug: article.slug,
          title: article.title,
          ...articleResult
        });
        
        if (articleResult.success) {
          channelResult.successfulArticles++;
          results.successfulArticles++;
          console.log(`     ✅ ${article.title}`);
        } else {
          channelResult.failedArticles++;
          results.failedArticles++;
          console.log(`     ❌ ${article.title}: ${articleResult.error}`);
          results.errors.push(`Article ${channelId}/${article.slug}: ${articleResult.error}`);
        }
      }
    }
    
    // Channel summary
    if (channelResult.failedArticles === 0 && apiResult.success) {
      results.successfulChannels++;
      console.log(`   🎉 Channel ${channelId}: All ${channelResult.totalArticles} articles working!`);
    } else {
      console.log(`   ⚠️  Channel ${channelId}: ${channelResult.successfulArticles}/${channelResult.totalArticles} articles working`);
    }
    
    results.channels[channelId] = channelResult;
    console.log('');
  }
  
  // Generate final report
  generateReport();
}

// Generate comprehensive report
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(80));
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total Channels: ${results.totalChannels}`);
  console.log(`   Successful Channels: ${results.successfulChannels}`);
  console.log(`   Failed Channels: ${results.failedChannels}`);
  console.log(`   Total Articles: ${results.totalArticles}`);
  console.log(`   Successful Articles: ${results.successfulArticles}`);
  console.log(`   Failed Articles: ${results.failedArticles}`);
  
  const channelSuccessRate = ((results.successfulChannels / results.totalChannels) * 100).toFixed(1);
  const articleSuccessRate = results.totalArticles > 0 ? ((results.successfulArticles / results.totalArticles) * 100).toFixed(1) : 0;
  
  console.log(`\n📈 SUCCESS RATES:`);
  console.log(`   Channels: ${channelSuccessRate}%`);
  console.log(`   Articles: ${articleSuccessRate}%`);
  
  // Channel details
  console.log(`\n📋 CHANNEL DETAILS:`);
  for (const [channelId, channelResult] of Object.entries(results.channels)) {
    const status = channelResult.api.success ? '✅' : '❌';
    const articleStatus = channelResult.totalArticles > 0 
      ? `${channelResult.successfulArticles}/${channelResult.totalArticles}` 
      : 'No articles';
    
    console.log(`   ${status} ${channelId}: ${articleStatus} articles`);
    
    if (channelResult.articles.length > 0 && channelResult.failedArticles > 0) {
      const failedArticles = channelResult.articles.filter(a => !a.success);
      for (const article of failedArticles.slice(0, 3)) { // Show max 3 failed articles
        console.log(`      ❌ ${article.title}: ${article.error}`);
      }
      if (failedArticles.length > 3) {
        console.log(`      ... and ${failedArticles.length - 3} more failed articles`);
      }
    }
  }
  
  // Errors summary
  if (results.errors.length > 0) {
    console.log(`\n❌ ERRORS (${results.errors.length}):`);
    results.errors.slice(0, 10).forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
    if (results.errors.length > 10) {
      console.log(`   ... and ${results.errors.length - 10} more errors`);
    }
  }
  
  // Recommendations
  console.log(`\n💡 RECOMMENDATIONS:`);
  if (results.failedChannels > 0) {
    console.log(`   - Fix ${results.failedChannels} channels with API issues`);
  }
  if (results.failedArticles > 0) {
    console.log(`   - Fix ${results.failedArticles} articles with content issues`);
  }
  if (results.successfulChannels === results.totalChannels && results.failedArticles === 0) {
    console.log(`   🎉 All systems working perfectly!`);
  }
  
  // Save detailed report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalChannels: results.totalChannels,
      successfulChannels: results.successfulChannels,
      failedChannels: results.failedChannels,
      totalArticles: results.totalArticles,
      successfulArticles: results.successfulArticles,
      failedArticles: results.failedArticles,
      channelSuccessRate: parseFloat(channelSuccessRate),
      articleSuccessRate: parseFloat(articleSuccessRate)
    },
    channels: results.channels,
    errors: results.errors
  };
  
  fs.writeFileSync('comprehensive-article-test-report.json', JSON.stringify(reportData, null, 2));
  console.log(`\n💾 Detailed report saved to: comprehensive-article-test-report.json`);
  
  console.log('\n' + '='.repeat(80));
  
  // Exit with appropriate code
  if (results.failedChannels > 0 || results.failedArticles > 0) {
    console.log('❌ Test completed with issues');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed successfully!');
    process.exit(0);
  }
}

// Run the test
if (require.main === module) {
  runComprehensiveTest().catch(error => {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  });
}

module.exports = { runComprehensiveTest, testServerConnection, testChannelAPI, testArticle };
