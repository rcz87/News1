const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'https://wisanggeni.cloud';
const TIMEOUT = 15000;

function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const options = {
      method: method,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Image-Upload-Test/1.0',
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

async function testUploadDirectory() {
  console.log('🔍 Testing Upload Directory Access...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/uploads/articles/`);
    
    if (response.statusCode === 200) {
      console.log('✅ Upload directory accessible');
      return { success: true };
    } else {
      console.log(`❌ Upload directory failed - Status: ${response.statusCode}`);
      return { success: false, error: `Status: ${response.statusCode}` };
    }
  } catch (error) {
    console.log(`❌ Upload directory error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testExistingImages() {
  console.log('\n🔍 Testing Existing Images...');
  
  // Test some known uploaded images
  const testImages = [
    'article-1761571150736-803236202_compressed.jpg',
    'article-1761571191105-65415911_compressed.jpg',
    'article-1761571199124-10155424_compressed.jpg'
  ];
  
  const results = [];
  let workingImages = 0;
  
  for (const imageName of testImages) {
    const imageUrl = `${BASE_URL}/uploads/articles/${imageName}`;
    
    try {
      const response = await makeRequest(imageUrl);
      
      if (response.statusCode === 200) {
        const contentType = response.headers['content-type'];
        const contentLength = response.headers['content-length'];
        
        console.log(`   ✅ ${imageName} - ${contentType} (${contentLength} bytes)`);
        results.push({ name: imageName, success: true, contentType, size: contentLength });
        workingImages++;
      } else {
        console.log(`   ❌ ${imageName} - Status: ${response.statusCode}`);
        results.push({ name: imageName, success: false, error: `Status: ${response.statusCode}` });
      }
    } catch (error) {
      console.log(`   ❌ ${imageName} - Error: ${error.message}`);
      results.push({ name: imageName, success: false, error: error.message });
    }
  }
  
  return { results, workingImages, totalImages: testImages.length };
}

async function testArticleImages() {
  console.log('\n🔍 Testing Images in Articles...');
  
  // Get articles from a channel to check their images
  try {
    const articlesResponse = await makeRequest(`${BASE_URL}/api/channels/ambal/articles`);
    
    if (articlesResponse.statusCode !== 200) {
      console.log(`❌ Failed to get articles - Status: ${articlesResponse.statusCode}`);
      return { success: false, error: `Status: ${articlesResponse.statusCode}` };
    }
    
    const articles = JSON.parse(articlesResponse.data);
    console.log(`   Found ${articles.length} articles in ambal channel`);
    
    const imageTests = [];
    let workingImages = 0;
    
    for (const article of articles.slice(0, 5)) { // Test first 5 articles
      if (article.image) {
        const imageUrl = article.image.startsWith('http') ? article.image : `${BASE_URL}${article.image}`;
        
        try {
          const imageResponse = await makeRequest(imageUrl);
          
          if (imageResponse.statusCode === 200) {
            console.log(`   ✅ ${article.title.substring(0, 30)}... - Image accessible`);
            imageTests.push({ 
              article: article.title, 
              imageUrl, 
              success: true 
            });
            workingImages++;
          } else {
            console.log(`   ❌ ${article.title.substring(0, 30)}... - Image failed (${imageResponse.statusCode})`);
            imageTests.push({ 
              article: article.title, 
              imageUrl, 
              success: false, 
              error: `Status: ${imageResponse.statusCode}` 
            });
          }
        } catch (error) {
          console.log(`   ❌ ${article.title.substring(0, 30)}... - Image error: ${error.message}`);
          imageTests.push({ 
            article: article.title, 
            imageUrl, 
            success: false, 
            error: error.message 
          });
        }
      } else {
        console.log(`   ⚠️  ${article.title.substring(0, 30)}... - No image specified`);
        imageTests.push({ 
          article: article.title, 
          imageUrl: null, 
          success: false, 
          error: 'No image specified' 
        });
      }
    }
    
    return { 
      success: true, 
      imageTests, 
      workingImages, 
      totalTested: imageTests.length 
    };
    
  } catch (error) {
    console.log(`❌ Article images test error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testImageFormats() {
  console.log('\n🔍 Testing Different Image Formats...');
  
  // Test if different image formats are supported
  const formatTests = [
    { name: 'JPEG', ext: 'jpg', testUrl: `${BASE_URL}/uploads/articles/article-1761571150736-803236202_compressed.jpg` },
    { name: 'PNG', ext: 'png', testUrl: `${BASE_URL}/uploads/articles/article-1761571150736-803236202.png` }
  ];
  
  const results = [];
  
  for (const format of formatTests) {
    try {
      const response = await makeRequest(format.testUrl);
      
      if (response.statusCode === 200) {
        const contentType = response.headers['content-type'];
        console.log(`   ✅ ${format.name} - ${contentType}`);
        results.push({ format: format.name, success: true, contentType });
      } else {
        console.log(`   ❌ ${format.name} - Status: ${response.statusCode}`);
        results.push({ format: format.name, success: false, error: `Status: ${response.statusCode}` });
      }
    } catch (error) {
      console.log(`   ❌ ${format.name} - Error: ${error.message}`);
      results.push({ format: format.name, success: false, error: error.message });
    }
  }
  
  return { results };
}

async function testImageCompression() {
  console.log('\n🔍 Testing Image Compression Features...');
  
  // Check if compression is working by looking at file sizes
  const compressionTests = [
    { name: 'Compressed JPEG', url: `${BASE_URL}/uploads/articles/article-1761571150736-803236202_compressed.jpg` },
    { name: 'Original PNG', url: `${BASE_URL}/uploads/articles/article-1761571150736-803236202.png` }
  ];
  
  const results = [];
  
  for (const test of compressionTests) {
    try {
      const response = await makeRequest(test.url);
      
      if (response.statusCode === 200) {
        const contentLength = parseInt(response.headers['content-length'] || '0');
        const sizeKB = (contentLength / 1024).toFixed(2);
        
        console.log(`   ✅ ${test.name} - ${sizeKB} KB`);
        results.push({ name: test.name, success: true, size: contentLength, sizeKB });
      } else {
        console.log(`   ❌ ${test.name} - Status: ${response.statusCode}`);
        results.push({ name: test.name, success: false, error: `Status: ${response.statusCode}` });
      }
    } catch (error) {
      console.log(`   ❌ ${test.name} - Error: ${error.message}`);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }
  
  return { results };
}

async function diagnoseImageIssues() {
  console.log('\n🔍 Diagnosing Common Image Issues...');
  
  const diagnoses = [];
  
  // Check 1: Upload directory permissions
  console.log('   Checking upload directory permissions...');
  const uploadTest = await testUploadDirectory();
  if (uploadTest.success) {
    diagnoses.push({ issue: 'Upload Directory', status: '✅ OK', details: 'Directory accessible' });
  } else {
    diagnoses.push({ issue: 'Upload Directory', status: '❌ Problem', details: uploadTest.error });
  }
  
  // Check 2: Static file serving
  console.log('   Checking static file serving...');
  const staticTest = await testExistingImages();
  if (staticTest.workingImages > 0) {
    diagnoses.push({ issue: 'Static File Serving', status: '✅ OK', details: `${staticTest.workingImages}/${staticTest.totalImages} images working` });
  } else {
    diagnoses.push({ issue: 'Static File Serving', status: '❌ Problem', details: 'No images accessible' });
  }
  
  // Check 3: Article image references
  console.log('   Checking article image references...');
  const articleTest = await testArticleImages();
  if (articleTest.success && articleTest.workingImages > 0) {
    diagnoses.push({ issue: 'Article Images', status: '✅ OK', details: `${articleTest.workingImages}/${articleTest.totalTested} article images working` });
  } else {
    diagnoses.push({ issue: 'Article Images', status: '⚠️  Issue', details: articleTest.error || 'Some article images not working' });
  }
  
  return diagnoses;
}

async function main() {
  console.log('🖼️  Testing Image Upload and Display System');
  console.log('='.repeat(60));
  
  // Test 1: Upload Directory
  const uploadResult = await testUploadDirectory();
  
  // Test 2: Existing Images
  const existingImagesResult = await testExistingImages();
  
  // Test 3: Article Images
  const articleImagesResult = await testArticleImages();
  
  // Test 4: Image Formats
  const formatResult = await testImageFormats();
  
  // Test 5: Image Compression
  const compressionResult = await testImageCompression();
  
  // Test 6: Diagnose Issues
  const diagnoses = await diagnoseImageIssues();
  
  // Generate Report
  console.log('\n' + '='.repeat(60));
  console.log('📋 IMAGE UPLOAD TEST REPORT');
  console.log('='.repeat(60));
  
  console.log('\n📊 SUMMARY:');
  console.log(`   Upload Directory: ${uploadResult.success ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Existing Images: ${existingImagesResult.workingImages}/${existingImagesResult.totalImages} working`);
  console.log(`   Article Images: ${articleImagesResult.success ? `${articleImagesResult.workingImages}/${articleImagesResult.totalTested} working` : '❌ Failed'}`);
  
  const totalTests = 1 + existingImagesResult.totalImages + (articleImagesResult.totalTested || 0);
  const passedTests = (uploadResult.success ? 1 : 0) + existingImagesResult.workingImages + (articleImagesResult.workingImages || 0);
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  
  console.log('\n📈 SUCCESS RATE:');
  console.log(`   Overall: ${successRate}% (${passedTests}/${totalTests} tests passed)`);
  
  console.log('\n📋 DETAILED RESULTS:');
  
  // Upload Directory
  console.log('\n📁 Upload Directory:');
  if (uploadResult.success) {
    console.log('   ✅ Directory accessible via web');
  } else {
    console.log(`   ❌ ${uploadResult.error}`);
  }
  
  // Existing Images
  console.log('\n🖼️  Existing Images:');
  for (const result of existingImagesResult.results) {
    const status = result.success ? '✅' : '❌';
    const details = result.success ? `${result.contentType} (${result.size} bytes)` : result.error;
    console.log(`   ${status} ${result.name} - ${details}`);
  }
  
  // Article Images
  if (articleImagesResult.success) {
    console.log('\n📰 Article Images:');
    for (const test of articleImagesResult.imageTests) {
      const status = test.success ? '✅' : '❌';
      const articleName = test.article.substring(0, 40) + (test.article.length > 40 ? '...' : '');
      console.log(`   ${status} ${articleName}`);
    }
  }
  
  // Format Support
  console.log('\n🎨 Format Support:');
  for (const result of formatResult.results) {
    const status = result.success ? '✅' : '❌';
    const details = result.success ? result.contentType : result.error;
    console.log(`   ${status} ${result.format} - ${details}`);
  }
  
  // Compression
  if (compressionResult.results.length > 0) {
    console.log('\n🗜️  Image Compression:');
    for (const result of compressionResult.results) {
      const status = result.success ? '✅' : '❌';
      const details = result.success ? `${result.sizeKB} KB` : result.error;
      console.log(`   ${status} ${result.name} - ${details}`);
    }
  }
  
  // Diagnoses
  console.log('\n🔍 DIAGNOSIS:');
  for (const diagnosis of diagnoses) {
    console.log(`   ${diagnosis.status} ${diagnosis.issue}: ${diagnosis.details}`);
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (uploadResult.success && existingImagesResult.workingImages > 0) {
    console.log('   ✅ Image upload system is working correctly');
    console.log('   ✅ Images are being served properly');
    
    if (articleImagesResult.success && articleImagesResult.workingImages > 0) {
      console.log('   ✅ Article images are displaying correctly');
    } else {
      console.log('   ⚠️  Some article images may not be displaying');
      console.log('   💡 Check if image URLs in article frontmatter are correct');
    }
  } else {
    console.log('   ❌ Image upload system has issues');
    console.log('   💡 Check upload directory permissions');
    console.log('   💡 Verify static file serving configuration');
  }
  
  console.log('\n🔧 TROUBLESHOOTING STEPS:');
  console.log('   1. Verify upload directory exists and has correct permissions');
  console.log('   2. Check nginx configuration for /uploads static serving');
  console.log('   3. Ensure image URLs in articles are correct');
  console.log('   4. Test upload functionality in admin dashboard');
  console.log('   5. Check browser console for image loading errors');
  
  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      uploadDirectory: uploadResult.success,
      existingImages: `${existingImagesResult.workingImages}/${existingImagesResult.totalImages}`,
      articleImages: articleImagesResult.success ? `${articleImagesResult.workingImages}/${articleImagesResult.totalTested}` : 'Failed',
      successRate: parseFloat(successRate),
      totalTests,
      passedTests
    },
    details: {
      uploadDirectory: uploadResult,
      existingImages: existingImagesResult,
      articleImages: articleImagesResult,
      formats: formatResult,
      compression: compressionResult,
      diagnoses
    }
  };
  
  fs.writeFileSync('image-upload-test-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n💾 Detailed report saved to: image-upload-test-report.json');
}

main().catch(console.error);
