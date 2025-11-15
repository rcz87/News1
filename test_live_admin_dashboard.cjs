const https = require('https');

// Test the live admin dashboard at wisanggeni.cloud
const testLiveAdminDashboard = () => {
    console.log('🧪 Testing Live Admin Dashboard at https://wisanggeni.cloud/admin.html');

    let authToken = null;

    // Test 1: Check if admin page is accessible
    const testAdminPageAccess = () => {
        return new Promise((resolve, reject) => {
            console.log('\n🌐 Test 1: Admin Page Access');

            const options = {
                hostname: 'wisanggeni.cloud',
                port: 443,
                path: '/admin.html',
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    console.log('✅ Admin page status:', res.statusCode);
                    console.log('✅ Content-Type:', res.headers['content-type']);

                    if (res.statusCode === 200 && data.includes('admin')) {
                        console.log('✅ Admin page accessible');
                        resolve();
                    } else {
                        console.error('❌ Admin page not accessible');
                        reject(new Error('Admin page access failed'));
                    }
                });
            });

            req.on('error', reject);
            req.end();
        });
    };

    // Test 2: Test admin login API
    const testAdminLogin = () => {
        return new Promise((resolve, reject) => {
            console.log('\n🔐 Test 2: Admin Login API');

            const loginData = JSON.stringify({
                username: 'admin',
                password: 'admin123'
            });

            const options = {
                hostname: 'wisanggeni.cloud',
                port: 443,
                path: '/api/admin/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(loginData),
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    console.log('✅ Login API status:', res.statusCode);

                    try {
                        const response = JSON.parse(data);
                        console.log('✅ Login response:', response);

                        if (response.token) {
                            authToken = response.token;
                            console.log('✅ Login successful, token received');
                            resolve();
                        } else {
                            console.error('❌ No token in response');
                            reject(new Error('Login failed - no token'));
                        }
                    } catch (error) {
                        console.error('❌ Login response parse error:', error);
                        console.error('Raw response:', data);
                        reject(error);
                    }
                });
            });

            req.on('error', reject);
            req.write(loginData);
            req.end();
        });
    };

    // Test 3: Test articles API
    const testArticlesAPI = () => {
        return new Promise((resolve, reject) => {
            console.log('\n📚 Test 3: Articles API');

            const options = {
                hostname: 'wisanggeni.cloud',
                port: 443,
                path: '/api/admin/articles?channel=ambal',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Cache-Control': 'no-cache',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    console.log('✅ Articles API status:', res.statusCode);
                    console.log('✅ Response type:', typeof data);
                    console.log('✅ Response length:', data.length);

                    try {
                        const articles = JSON.parse(data);
                        console.log('✅ Parsed response type:', typeof articles);
                        console.log('✅ Is array?', Array.isArray(articles));

                        if (Array.isArray(articles)) {
                            console.log('✅ Articles count:', articles.length);

                            // Test forEach functionality
                            let count = 0;
                            articles.forEach(article => {
                                count++;
                            });
                            console.log('✅ forEach test passed, counted:', count, 'articles');

                            if (articles.length > 0) {
                                const firstArticle = articles[0];
                                console.log('✅ First article structure:');
                                console.log('   - slug:', firstArticle.slug);
                                console.log('   - title:', firstArticle.title ? firstArticle.title.substring(0, 50) + '...' : 'N/A');
                                console.log('   - category:', firstArticle.category);
                            }

                            console.log('🎉 Articles API working correctly!');
                            resolve();
                        } else {
                            console.error('❌ Expected array but got:', typeof articles);
                            console.error('❌ Response:', articles);
                            reject(new Error('Articles API not returning array'));
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

    // Run all tests
    testAdminPageAccess()
        .then(() => testAdminLogin())
        .then(() => testArticlesAPI())
        .then(() => {
            console.log('\n🎉 Live Admin Dashboard Tests Passed!');
            console.log('✅ https://wisanggeni.cloud/admin.html is working correctly!');
            console.log('✅ The "articles.forEach is not a function" error has been fixed on live site!');
        })
        .catch((error) => {
            console.error('\n❌ Live test failed:', error.message);
            console.log('ℹ️ This might be expected if the fix hasn\'t been deployed yet');
        });
};

// Run the live test
testLiveAdminDashboard();
