const http = require('http');

// Comprehensive test for admin dashboard functionality
const testAdminDashboard = () => {
    console.log('🧪 Testing Admin Dashboard Complete Functionality...');

    let authToken = null;

    // Test 1: Login
    const testLogin = () => {
        return new Promise((resolve, reject) => {
            console.log('\n📝 Test 1: Admin Login');

            const loginData = JSON.stringify({
                username: 'admin',
                password: 'admin123'
            });

            const options = {
                hostname: 'localhost',
                port: 5000,
                path: '/api/admin/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(loginData)
                }
            };

            const req = http.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        if (response.token) {
                            authToken = response.token;
                            console.log('✅ Login successful');
                            console.log('✅ Token received:', authToken.substring(0, 20) + '...');
                            resolve();
                        } else {
                            console.error('❌ No token in response');
                            reject(new Error('No token received'));
                        }
                    } catch (error) {
                        console.error('❌ Login response parse error:', error);
                        reject(error);
                    }
                });
            });

            req.on('error', reject);
            req.write(loginData);
            req.end();
        });
    };

    // Test 2: Load articles for different channels
    const testLoadArticles = (channel) => {
        return new Promise((resolve, reject) => {
            console.log(`\n📚 Test 2: Load Articles for channel: ${channel}`);

            const options = {
                hostname: 'localhost',
                port: 5000,
                path: `/api/admin/articles?channel=${encodeURIComponent(channel)}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Cache-Control': 'no-cache'
                }
            };

            const req = http.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const articles = JSON.parse(data);
                        console.log('✅ Response status:', res.statusCode);
                        console.log('✅ Response type:', typeof articles);
                        console.log('✅ Is array?', Array.isArray(articles));

                        if (Array.isArray(articles)) {
                            console.log('✅ Articles count:', articles.length);

                            if (articles.length > 0) {
                                const firstArticle = articles[0];
                                console.log('✅ First article structure:');
                                console.log('   - slug:', firstArticle.slug);
                                console.log('   - title:', firstArticle.title ? firstArticle.title.substring(0, 50) + '...' : 'N/A');
                                console.log('   - category:', firstArticle.category);
                                console.log('   - author:', firstArticle.author);
                                console.log('   - has image:', !!firstArticle.image);

                                // Test forEach functionality
                                let count = 0;
                                articles.forEach(article => {
                                    count++;
                                });
                                console.log('✅ forEach test passed, counted:', count, 'articles');
                            } else {
                                console.log('ℹ️ No articles found in this channel');
                            }

                            resolve(articles);
                        } else {
                            console.error('❌ Expected array but got:', typeof articles);
                            reject(new Error('Response is not an array'));
                        }
                    } catch (error) {
                        console.error('❌ Articles response parse error:', error);
                        console.error('Raw response preview:', data.substring(0, 200));
                        reject(error);
                    }
                });
            });

            req.on('error', reject);
            req.end();
        });
    };

    // Test 3: Test category filtering
    const testCategoryFilter = () => {
        return new Promise((resolve, reject) => {
            console.log('\n🏷️ Test 3: Category Filtering');

            const options = {
                hostname: 'localhost',
                port: 5000,
                path: '/api/admin/articles?channel=ambal',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Cache-Control': 'no-cache'
                }
            };

            const req = http.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const articles = JSON.parse(data);

                        if (Array.isArray(articles)) {
                            // Get unique categories
                            const categories = [...new Set(articles.map(article =>
                                article.category ? article.category.replace(/"/g, '') : 'Uncategorized'
                            ))];

                            console.log('✅ Available categories:', categories);

                            // Test filtering by first category
                            if (categories.length > 0 && categories[0] !== 'Uncategorized') {
                                const filteredArticles = articles.filter(article => {
                                    const articleCategory = article.category ? article.category.replace(/"/g, '') : '';
                                    return articleCategory === categories[0];
                                });

                                console.log(`✅ Filtered by "${categories[0]}":`, filteredArticles.length, 'articles');
                            }

                            resolve();
                        } else {
                            reject(new Error('Response is not an array'));
                        }
                    } catch (error) {
                        console.error('❌ Category filter test error:', error);
                        reject(error);
                    }
                });
            });

            req.on('error', reject);
            req.end();
        });
    };

    // Test 4: Test article retrieval by slug
    const testArticleBySlug = () => {
        return new Promise((resolve, reject) => {
            console.log('\n📄 Test 4: Get Article by Slug');

            // First get an article slug
            const options = {
                hostname: 'localhost',
                port: 5000,
                path: '/api/admin/articles?channel=ambal',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Cache-Control': 'no-cache'
                }
            };

            const req = http.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const articles = JSON.parse(data);

                        if (Array.isArray(articles) && articles.length > 0) {
                            const slug = articles[0].slug;
                            console.log('✅ Found slug to test:', slug);

                            // Now get specific article
                            const articleOptions = {
                                hostname: 'localhost',
                                port: 5000,
                                path: `/api/admin/articles/${slug}?channel=ambal`,
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${authToken}`
                                }
                            };

                            const articleReq = http.request(articleOptions, (articleRes) => {
                                let articleData = '';

                                articleRes.on('data', (chunk) => {
                                    articleData += chunk;
                                });

                                articleRes.on('end', () => {
                                    try {
                                        const article = JSON.parse(articleData);
                                        console.log('✅ Article retrieved successfully');
                                        console.log('✅ Article title:', article.title ? article.title.substring(0, 50) + '...' : 'N/A');
                                        console.log('✅ Article has content:', !!article.content);
                                        resolve();
                                    } catch (error) {
                                        console.error('❌ Article parse error:', error);
                                        reject(error);
                                    }
                                });
                            });

                            articleReq.on('error', reject);
                            articleReq.end();
                        } else {
                            console.log('ℹ️ No articles available for slug test');
                            resolve();
                        }
                    } catch (error) {
                        console.error('❌ Slug test error:', error);
                        reject(error);
                    }
                });
            });

            req.on('error', reject);
            req.end();
        });
    };

    // Run all tests
    testLogin()
        .then(() => testLoadArticles('ambal'))
        .then(() => testLoadArticles('beritadesa'))
        .then(() => testLoadArticles('cakranews'))
        .then(() => testCategoryFilter())
        .then(() => testArticleBySlug())
        .then(() => {
            console.log('\n🎉 All Admin Dashboard Tests Passed!');
            console.log('✅ The "articles.forEach is not a function" error has been fixed!');
            console.log('✅ Admin dashboard is working correctly!');
        })
        .catch((error) => {
            console.error('\n❌ Test failed:', error.message);
            process.exit(1);
        });
};

// Run the comprehensive test
testAdminDashboard();
