#!/usr/bin/env node

import http from 'http';

// Simple test to check if server responds correctly
async function testChannel(channelId, channelName) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: `/${channelId}`,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    channelId,
                    channelName,
                    statusCode: res.statusCode,
                    contentLength: data.length,
                    hasReactApp: data.includes('root') && data.includes('main.tsx'),
                    hasVite: data.includes('vite/client'),
                    isHtmlShell: data.includes('<div id="root"></div>')
                });
            });
        });

        req.on('error', (error) => {
            resolve({
                channelId,
                channelName,
                error: error.message,
                statusCode: 0
            });
        });

        req.setTimeout(5000, () => {
            req.destroy();
            resolve({
                channelId,
                channelName,
                error: 'Timeout',
                statusCode: 0
            });
        });

        req.end();
    });
}

// Test all channels
async function testAllChannels() {
    console.log('🔍 Testing Channel Accessibility...\n');

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

    let successCount = 0;
    let totalCount = channels.length;

    for (const channel of channels) {
        const result = await testChannel(channel.id, channel.name);
        
        if (result.statusCode === 200) {
            successCount++;
            console.log(`✅ ${channel.name} (${channel.id}) - Status: ${result.statusCode}`);
            console.log(`   📄 Content Length: ${result.contentLength} bytes`);
            console.log(`   ⚛️  React App: ${result.hasReactApp ? '✅' : '❌'}`);
            console.log(`   🔧 Vite Dev: ${result.hasVite ? '✅' : '❌'}`);
            console.log(`   📱 HTML Shell: ${result.isHtmlShell ? '✅' : '❌'}`);
        } else {
            console.log(`❌ ${channel.name} (${channel.id}) - Status: ${result.statusCode || 'ERROR'}`);
            if (result.error) {
                console.log(`   🚫 Error: ${result.error}`);
            }
        }
        console.log('');
    }

    // Test channel selector
    console.log('🏠 Testing Channel Selector...');
    const homeResult = await testChannel('', 'Home');
    if (homeResult.statusCode === 200) {
        console.log(`✅ Channel Selector - Status: ${homeResult.statusCode}`);
        console.log(`   📄 Content Length: ${homeResult.contentLength} bytes`);
        console.log(`   ⚛️  React App: ${homeResult.hasReactApp ? '✅' : '❌'}`);
    } else {
        console.log(`❌ Channel Selector - Status: ${homeResult.statusCode || 'ERROR'}`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Channels Tested: ${totalCount}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${totalCount - successCount}`);
    console.log(`Success Rate: ${((successCount / totalCount) * 100).toFixed(1)}%`);

    if (successCount === totalCount) {
        console.log('\n🎉 All channels are accessible!');
        console.log('ℹ️  Note: This is a React SPA, so UI elements are rendered client-side.');
        console.log('🌐 To see the actual UI, open http://localhost:5000 in a browser.');
    } else {
        console.log('\n⚠️  Some channels are not accessible. Check the server logs.');
    }
}

// Run the test
testAllChannels().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
