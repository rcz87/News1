const http = require('http');

// Test function to make HTTP requests
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data, headers: res.headers });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function testBeritadesaChannel() {
  console.log('Testing beritadesa channel articles...');
  
  try {
    // Test 1: Get all articles for beritadesa channel
    console.log('\n1. Testing /api/channels/beritadesa/articles');
    const articlesResponse = await makeRequest('/api/channels/beritadesa/articles');
    console.log('Status:', articlesResponse.statusCode);
    console.log('Content-Type:', articlesResponse.headers['content-type']);
    
    if (articlesResponse.statusCode === 200) {
      // Check if response is JSON
      if (articlesResponse.headers['content-type'] && articlesResponse.headers['content-type'].includes('application/json')) {
        const articles = JSON.parse(articlesResponse.data);
        console.log('Found', articles.length, 'articles');
        
        // Show first few articles with their slugs
        articles.slice(0, 3).forEach((article, index) => {
          console.log(`Article ${index + 1}:`);
          console.log('  Title:', article.title);
          console.log('  Slug:', article.slug);
          console.log('  Channel:', article.channelId);
        });
        
        // Test 2: Try to access a specific article by slug
        if (articles.length > 0) {
          const firstArticle = articles[0];
          console.log('\n2. Testing article access with slug:', firstArticle.slug);
          const articleResponse = await makeRequest(`/api/channels/beritadesa/articles/${firstArticle.slug}`);
          console.log('Status:', articleResponse.statusCode);
          
          if (articleResponse.statusCode === 200) {
            const articleData = JSON.parse(articleResponse.data);
            console.log('Successfully accessed article:');
            console.log('  Title:', articleData.title);
            console.log('  Slug:', articleData.slug);
            console.log('  Content length:', articleData.content.length, 'characters');
          } else {
            console.log('Failed to access article');
            console.log('Response:', articleResponse.data.substring(0, 200));
          }
        }
      } else {
        console.log('Response is not JSON. First 200 characters:');
        console.log(articlesResponse.data.substring(0, 200));
      }
    } else {
      console.log('Failed to get articles');
      console.log('Response:', articlesResponse.data.substring(0, 200));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the test
testBeritadesaChannel();
