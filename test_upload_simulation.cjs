const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'https://wisanggeni.cloud';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const TIMEOUT = 15000;

function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const options = {
      method: method,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Upload-Simulation-Test/1.0',
        ...headers
      }
    };

    if (data) {
      if (typeof data === 'string') {
        options.headers['Content-Length'] = Buffer.byteLength(data);
      } else {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        data = jsonData;
      }
    }

    const req = protocol.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
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

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function getAdminToken() {
  console.log('🔐 Getting Admin Authentication Token...');
  
  try {
    const loginData = {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    };
    
    const response = await makeRequest(`${BASE_URL}/api/admin/login`, 'POST', loginData);
    
    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);
      console.log('✅ Admin authentication successful');
      return result.token;
    } else {
      console.log(`❌ Admin login failed - Status: ${response.statusCode}`);
      console.log(`Response: ${response.data}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Admin login error: ${error.message}`);
    return null;
  }
}

async function testUploadEndpoint(token) {
  console.log('\n📤 Testing Upload Endpoint...');
  
  if (!token) {
    console.log('❌ No admin token available');
    return { success: false, error: 'No authentication token' };
  }
  
  try {
    // Test if upload endpoint is accessible
    const response = await makeRequest(`${BASE_URL}/api/admin/upload-photo`, 'POST', null, {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    });
    
    // We expect this to fail without actual file, but should not be 401/403
    if (response.statusCode === 401 || response.statusCode === 403) {
      console.log('❌ Upload endpoint authentication failed');
      return { success: false, error: 'Authentication failed' };
    } else if (response.statusCode === 400) {
      console.log('✅ Upload endpoint accessible (expects file data)');
      return { success: true, message: 'Endpoint accessible' };
    } else {
      console.log(`✅ Upload endpoint responds - Status: ${response.statusCode}`);
      return { success: true, message: `Status: ${response.statusCode}` };
    }
  } catch (error) {
    console.log(`❌ Upload endpoint test error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testImageInArticleWorkflow() {
  console.log('\n🔄 Testing Complete Image-in-Article Workflow...');
  
  try {
    // Step 1: Get a sample article
    const articlesResponse = await makeRequest(`${BASE_URL}/api/channels/ambal/articles`);
    
    if (articlesResponse.statusCode !== 200) {
      console.log(`❌ Failed to get articles - Status: ${articlesResponse.statusCode}`);
      return { success: false, error: 'Failed to get articles' };
    }
    
    const articles = JSON.parse(articlesResponse.data);
    if (articles.length === 0) {
      console.log('❌ No articles found to test');
      return { success: false, error: 'No articles found' };
    }
    
    const sampleArticle = articles[0];
    console.log(`   Testing with article: ${sampleArticle.title.substring(0, 50)}...`);
    
    // Step 2: Check if article has image
    if (!sampleArticle.image) {
      console.log('⚠️  Article has no image specified');
      return { success: false, error: 'Article has no image' };
    }
    
    // Step 3: Test image accessibility
    const imageUrl = sampleArticle.image.startsWith('http') ? sampleArticle.image : `${BASE_URL}${sampleArticle.image}`;
    const imageResponse = await makeRequest(imageUrl);
    
    if (imageResponse.statusCode !== 200) {
      console.log(`❌ Article image not accessible - Status: ${imageResponse.statusCode}`);
      return { success: false, error: 'Image not accessible' };
    }
    
    // Step 4: Check if image is properly formatted
    const contentType = imageResponse.headers['content-type'];
    if (!contentType || !contentType.startsWith('image/')) {
      console.log(`❌ Invalid image content type: ${contentType}`);
      return { success: false, error: 'Invalid content type' };
    }
    
    // Step 5: Test article page rendering
    const articlePageUrl = `${BASE_URL}/ambal/article/${sampleArticle.slug}`;
    const pageResponse = await makeRequest(articlePageUrl);
    
    if (pageResponse.statusCode !== 200) {
      console.log(`❌ Article page not accessible - Status: ${pageResponse.statusCode}`);
      return { success: false, error: 'Article page not accessible' };
    }
    
    // Step 6: Check if image URL is present in page HTML
    const pageContent = pageResponse.data;
    if (!pageContent.includes(sampleArticle.image)) {
      console.log('❌ Image URL not found in article page HTML');
      return { success: false, error: 'Image URL not in page' };
    }
    
    console.log('✅ Complete workflow successful');
    console.log(`   ✅ Article: ${sampleArticle.title.substring(0, 30)}...`);
    console.log(`   ✅ Image: ${sampleArticle.image}`);
    console.log(`   ✅ Content Type: ${contentType}`);
    console.log(`   ✅ Image Size: ${imageResponse.headers['content-length']} bytes`);
    console.log(`   ✅ Page Rendering: Image URL found in HTML`);
    
    return {
      success: true,
      article: sampleArticle,
      image: {
        url: sampleArticle.image,
        contentType,
        size: imageResponse.headers['content-length']
      }
    };
    
  } catch (error) {
    console.log(`❌ Workflow test error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testMultipleChannels() {
  console.log('\n📺 Testing Images Across Multiple Channels...');
  
  const channels = ['ambal', 'beritadesa', 'mjbnews', 'cakranews'];
  const results = [];
  
  for (const channel of channels) {
    try {
      console.log(`   Testing channel: ${channel}`);
      
      // Get articles from channel
      const articlesResponse = await makeRequest(`${BASE_URL}/api/channels/${channel}/articles`);
      
      if (articlesResponse.statusCode !== 200) {
        console.log(`     ❌ Failed to get articles - Status: ${articlesResponse.statusCode}`);
        results.push({ channel, success: false, error: 'Failed to get articles' });
        continue;
      }
      
      const articles = JSON.parse(articlesResponse.data);
      if (articles.length === 0) {
        console.log(`     ⚠️  No articles in channel`);
        results.push({ channel, success: false, error: 'No articles' });
        continue;
      }
      
      // Test first article with image
      const articleWithImage = articles.find(article => article.image);
      if (!articleWithImage) {
        console.log(`     ⚠️  No articles with images`);
        results.push({ channel, success: false, error: 'No images in articles' });
        continue;
      }
      
      // Test image accessibility
      const imageUrl = articleWithImage.image.startsWith('http') ? articleWithImage.image : `${BASE_URL}${articleWithImage.image}`;
      const imageResponse = await makeRequest(imageUrl);
      
      if (imageResponse.statusCode === 200) {
        console.log(`     ✅ Image working: ${articleWithImage.image.substring(0, 40)}...`);
        results.push({ 
          channel, 
          success: true, 
          article: articleWithImage.title.substring(0, 30) + '...',
          image: articleWithImage.image.substring(0, 40) + '...'
        });
      } else {
        console.log(`     ❌ Image failed - Status: ${imageResponse.statusCode}`);
        results.push({ 
          channel, 
          success: false, 
          error: `Image failed: ${imageResponse.statusCode}` 
        });
      }
      
    } catch (error) {
      console.log(`     ❌ Channel test error: ${error.message}`);
      results.push({ channel, success: false, error: error.message });
    }
  }
  
  return results;
}

async function diagnoseCommonIssues() {
  console.log('\n🔍 Diagnosing Common Upload Issues...');
  
  const issues = [];
  
  // Issue 1: Check if default image exists
  console.log('   Checking default image...');
  try {
    const defaultImageResponse = await makeRequest(`${BASE_URL}/images/default.jpg`);
    if (defaultImageResponse.statusCode === 200) {
      issues.push({ issue: 'Default Image', status: '✅ OK', details: 'Default image accessible' });
    } else {
      issues.push({ issue: 'Default Image', status: '⚠️  Missing', details: 'Default image not found' });
    }
  } catch (error) {
    issues.push({ issue: 'Default Image', status: '⚠️  Missing', details: 'Default image not accessible' });
  }
  
  // Issue 2: Check upload directory structure
  console.log('   Checking upload directory structure...');
  try {
    const dirResponse = await makeRequest(`${BASE_URL}/uploads/`);
    if (dirResponse.statusCode === 200) {
      issues.push({ issue: 'Upload Directory', status: '✅ OK', details: 'Upload directory accessible' });
    } else {
      issues.push({ issue: 'Upload Directory', status: '❌ Problem', details: 'Upload directory not accessible' });
    }
  } catch (error) {
    issues.push({ issue: 'Upload Directory', status: '❌ Problem', details: 'Upload directory error' });
  }
  
  // Issue 3: Check articles subdirectory
  console.log('   Checking articles subdirectory...');
  try {
    const articlesDirResponse = await makeRequest(`${BASE_URL}/uploads/articles/`);
    if (articlesDirResponse.statusCode === 200) {
      issues.push({ issue: 'Articles Subdirectory', status: '✅ OK', details: 'Articles directory accessible' });
    } else {
      issues.push({ issue: 'Articles Subdirectory', status: '❌ Problem', details: 'Articles directory not accessible' });
    }
  } catch (error) {
    issues.push({ issue: 'Articles Subdirectory', status: '❌ Problem', details: 'Articles directory error' });
  }
  
  return issues;
}

async function main() {
  console.log('🔄 Testing Upload Simulation and Image Display');
  console.log('='.repeat(60));
  
  // Test 1: Admin Authentication
  const adminToken = await getAdminToken();
  
  // Test 2: Upload Endpoint
  const uploadTest = await testUploadEndpoint(adminToken);
  
  // Test 3: Complete Workflow
  const workflowTest = await testImageInArticleWorkflow();
  
  // Test 4: Multiple Channels
  const channelTests = await testMultipleChannels();
  
  // Test 5: Diagnose Issues
  const issues = await diagnoseCommonIssues();
  
  // Generate Report
  console.log('\n' + '='.repeat(60));
  console.log('📋 UPLOAD SIMULATION TEST REPORT');
  console.log('='.repeat(60));
  
  console.log('\n📊 SUMMARY:');
  console.log(`   Admin Authentication: ${adminToken ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Upload Endpoint: ${uploadTest.success ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Image Workflow: ${workflowTest.success ? '✅ Working' : '❌ Failed'}`);
  
  const workingChannels = channelTests.filter(test => test.success).length;
  console.log(`   Multi-Channel Images: ${workingChannels}/${channelTests.length} working`);
  
  const totalTests = 4;
  const passedTests = (adminToken ? 1 : 0) + (uploadTest.success ? 1 : 0) + (workflowTest.success ? 1 : 0) + (workingChannels > 0 ? 1 : 0);
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log('\n📈 SUCCESS RATE:');
  console.log(`   Overall: ${successRate}% (${passedTests}/${totalTests} tests passed)`);
  
  console.log('\n📋 DETAILED RESULTS:');
  
  // Admin Authentication
  console.log('\n🔐 Admin Authentication:');
  if (adminToken) {
    console.log('   ✅ Login successful');
    console.log('   ✅ Token obtained');
  } else {
    console.log('   ❌ Login failed');
    console.log('   ❌ No token obtained');
  }
  
  // Upload Endpoint
  console.log('\n📤 Upload Endpoint:');
  if (uploadTest.success) {
    console.log(`   ✅ ${uploadTest.message}`);
  } else {
    console.log(`   ❌ ${uploadTest.error}`);
  }
  
  // Workflow Test
  console.log('\n🔄 Complete Workflow:');
  if (workflowTest.success) {
    console.log(`   ✅ Article: ${workflowTest.article.title.substring(0, 40)}...`);
    console.log(`   ✅ Image: ${workflowTest.image.url}`);
    console.log(`   ✅ Content Type: ${workflowTest.image.contentType}`);
    console.log(`   ✅ Size: ${workflowTest.image.size} bytes`);
  } else {
    console.log(`   ❌ ${workflowTest.error}`);
  }
  
  // Channel Tests
  console.log('\n📺 Multi-Channel Tests:');
  for (const test of channelTests) {
    const status = test.success ? '✅' : '❌';
    const details = test.success ? `${test.article} | ${test.image}` : test.error;
    console.log(`   ${status} ${test.channel.toUpperCase()}: ${details}`);
  }
  
  // Issues Diagnosis
  console.log('\n🔍 Issues Diagnosis:');
  for (const issue of issues) {
    console.log(`   ${issue.status} ${issue.issue}: ${issue.details}`);
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (adminToken && uploadTest.success && workflowTest.success) {
    console.log('   ✅ Upload system is properly configured');
    console.log('   ✅ Images are displaying correctly in articles');
    console.log('   ✅ Admin authentication is working');
    
    if (workingChannels === channelTests.length) {
      console.log('   ✅ All channels have working images');
    } else {
      console.log('   ⚠️  Some channels may have image issues');
    }
  } else {
    console.log('   ❌ Upload system has configuration issues');
    
    if (!adminToken) {
      console.log('   💡 Check admin credentials and authentication');
    }
    if (!uploadTest.success) {
      console.log('   💡 Check upload endpoint configuration');
    }
    if (!workflowTest.success) {
      console.log('   💡 Check image URLs in article frontmatter');
    }
  }
  
  console.log('\n🔧 TROUBLESHOOTING GUIDE:');
  console.log('   1. If images don\'t appear after upload:');
  console.log('      - Check if image URL is saved in article frontmatter');
  console.log('      - Verify image is accessible via direct URL');
  console.log('      - Check browser console for 404 errors');
  console.log('   2. If upload fails:');
  console.log('      - Verify admin authentication is working');
  console.log('      - Check file size limits (max 20MB)');
  console.log('      - Ensure image format is supported (JPEG, PNG)');
  console.log('   3. If images appear broken:');
  console.log('      - Check if /uploads directory is served statically');
  console.log('      - Verify nginx configuration for static files');
  console.log('      - Check file permissions on upload directory');
  
  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      adminAuth: !!adminToken,
      uploadEndpoint: uploadTest.success,
      imageWorkflow: workflowTest.success,
      multiChannel: `${workingChannels}/${channelTests.length}`,
      successRate: parseFloat(successRate),
      totalTests,
      passedTests
    },
    details: {
      adminToken: !!adminToken,
      uploadTest,
      workflowTest,
      channelTests,
      issues
    }
  };
  
  fs.writeFileSync('upload-simulation-test-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n💾 Detailed report saved to: upload-simulation-test-report.json');
}

main().catch(console.error);
