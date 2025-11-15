const http = require('http');
const { URL } = require('url');

const baseUrl = 'http://localhost:5000';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'test-script'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function testArticleRouting() {
  console.log('🔍 TESTING ARTICLE ROUTING - FINAL DEBUG\n');
  console.log('='.repeat(60));

  const testCases = [
    {
      name: 'BeritaDesa Article - Original Slug',
      path: '/beritadesa/article/warga-ayah-bayar-pajak-samsat-paten',
      expectedStatus: 200
    },
    {
      name: 'BeritaDesa Article - API Endpoint',
      path: '/api/channels/beritadesa/articles/warga-ayah-bayar-pajak-samsat-paten',
      expectedStatus: 200
    },
    {
      name: 'BeritaDesa Article - File Name Version',
      path: '/beritadesa/article/satlantas-polres-kebumen-membuka-samsat-paten-dikecamatan-ayah',
      expectedStatus: 200
    },
    {
      name: 'BeritaDesa Article - API File Name Version',
      path: '/api/channels/beritadesa/articles/satlantas-polres-kebumen-membuka-samsat-paten-dikecamatan-ayah',
      expectedStatus: 200
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(`📍 Path: ${testCase.path}`);
    
    try {
      const response = await makeRequest(testCase.path);
      
      console.log(`✅ Status: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        // Check if it's HTML or JSON
        const contentType = response.headers['content-type'] || '';
        
        if (contentType.includes('application/json')) {
          try {
            const jsonData = JSON.parse(response.data);
            console.log(`📄 Response Type: JSON`);
            console.log(`📝 Article Title: ${jsonData.title || 'N/A'}`);
            console.log(`🏷️  Category: ${jsonData.category || 'N/A'}`);
            console.log(`📅 Published: ${jsonData.publishedAt || 'N/A'}`);
          } catch (e) {
            console.log(`❌ Invalid JSON response`);
          }
        } else if (contentType.includes('text/html')) {
          console.log(`📄 Response Type: HTML`);
          
          // Check for specific content
          if (response.data.includes('Artikel Tidak Ditemukan')) {
            console.log(`❌ Article not found page`);
          } else if (response.data.includes('Error Loading Article')) {
            console.log(`❌ Error loading article page`);
          } else if (response.data.includes('article-content')) {
            console.log(`✅ Article page loaded successfully`);
          } else {
            console.log(`⚠️  Unknown page content`);
          }
        } else {
          console.log(`📄 Response Type: ${contentType}`);
        }
        
        console.log(`📊 Response Size: ${response.data.length} bytes`);
      } else {
        console.log(`❌ Unexpected status code`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('-'.repeat(40));
  }

  // Test file system check
  console.log('\n📁 FILE SYSTEM CHECK');
  console.log('='.repeat(60));
  
  const fs = require('fs');
  const path = require('path');
  
  const possibleFiles = [
    'content/beritadesa/satlantas - polres - kebumen - membuka - samsat- paten - dikecamatan - ayah .md',
    'content/beritadesa/warga-ayah-bayar-pajak-samsat-paten.md'
  ];
  
  for (const filePath of possibleFiles) {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ File exists: ${filePath}`);
      console.log(`📊 Size: ${stats.size} bytes`);
      console.log(`📅 Modified: ${stats.mtime}`);
    } else {
      console.log(`❌ File not found: ${filePath}`);
    }
  }

  console.log('\n🎯 SUMMARY');
  console.log('='.repeat(60));
  console.log('Test completed. Check the results above for any issues.');
}

// Run the test
testArticleRouting().catch(console.error);
