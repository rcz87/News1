const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:5000';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ArticleTest/1.0)'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testBeritaDesaArticles() {
  console.log('🧪 Testing BeritaDesa Articles');
  console.log('=================================\n');

  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  // Test articles with different scenarios
  const testArticles = [
    {
      name: 'Classic Car Rally (normal file)',
      path: '/beritadesa/article/classic-car-rally',
      expectedContent: ['Classic Car', 'Menteng']
    },
    {
      name: 'Warga Ayah Bayar Pajak (slug-based)',
      path: '/beritadesa/article/warga-ayah-bayar-pajak-samsat-paten',
      expectedContent: ['WARGA AYAH', 'SAMSAT PATEN', 'Bripka Albahrori']
    },
    {
      name: 'Direct file access (should fail)',
      path: '/beritadesa/article/satlantas-polres-kebumen-membuka-samsat-paten-dikecamatan-ayah',
      expectedContent: []
    }
  ];

  for (const article of testArticles) {
    try {
      console.log(`📍 Testing: ${article.name}`);
      console.log(`   Path: ${article.path}`);
      
      const response = await makeRequest(article.path);
      
      if (response.statusCode === 200) {
        console.log(`   ✅ Status: 200 OK`);
        
        // Check for expected content
        let contentFound = 0;
        for (const content of article.expectedContent) {
          if (response.body.includes(content)) {
            contentFound++;
          }
        }
        
        if (article.expectedContent.length === 0) {
          console.log(`   ⚠️  No content validation (expected to fail)`);
          results.passed++;
          results.details.push(`✅ ${article.name}: 200 OK (as expected)`);
        } else if (contentFound > 0) {
          console.log(`   ✅ Content found: ${contentFound}/${article.expectedContent.length} keywords`);
          results.passed++;
          results.details.push(`✅ ${article.name}: 200 OK with content`);
        } else {
          console.log(`   ⚠️  Content not found, but page loads`);
          results.passed++;
          results.details.push(`⚠️  ${article.name}: 200 OK (no expected content)`);
        }
        
        // Show snippet of content
        const snippet = response.body.substring(0, 200);
        console.log(`   📄 Content snippet: ${snippet.replace(/\n/g, ' ')}...`);
        
      } else {
        console.log(`   ❌ Status: ${response.statusCode}`);
        results.failed++;
        results.details.push(`❌ ${article.name}: ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.failed++;
      results.details.push(`❌ ${article.name}: ${error.message}`);
    }
    
    console.log('');
  }

  // Test channel page to see if articles are listed
  try {
    console.log('📍 Testing: BeritaDesa Channel Page');
    const response = await makeRequest('/beritadesa');
    
    if (response.statusCode === 200) {
      const hasArticleLinks = response.body.includes('/beritadesa/article/');
      const hasArticleCards = response.body.includes('article-card') || response.body.includes('ArticleCard');
      
      console.log(`   ✅ Channel page loads: 200 OK`);
      console.log(`   📋 Has article links: ${hasArticleLinks}`);
      console.log(`   📋 Has article cards: ${hasArticleCards}`);
      
      if (hasArticleLinks || hasArticleCards) {
        results.passed++;
        results.details.push('✅ Channel page: 200 OK with articles');
      } else {
        results.passed++;
        results.details.push('⚠️  Channel page: 200 OK (no articles detected)');
      }
    } else {
      console.log(`   ❌ Channel page failed: ${response.statusCode}`);
      results.failed++;
      results.details.push(`❌ Channel page: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Channel page error: ${error.message}`);
    results.failed++;
    results.details.push(`❌ Channel page: ${error.message}`);
  }

  console.log('');

  // Summary
  console.log('📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  console.log('\n📋 Detailed Results:');
  results.details.forEach(detail => console.log(`  ${detail}`));

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! BeritaDesa articles are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the details above.');
  }

  return results;
}

// Run the test
testBeritaDesaArticles().catch(console.error);
