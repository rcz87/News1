// News1 Admin Dashboard Service Worker
const CACHE_NAME = 'news1-admin-v1';
const STATIC_CACHE = 'news1-admin-static-v1';
const API_CACHE = 'news1-admin-api-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/admin.html',
  '/admin.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/admin/login',
  '/api/admin/articles'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static files
  if (STATIC_FILES.includes(url.pathname) || 
      url.pathname === '/admin.html' || 
      url.pathname === '/admin.js' ||
      url.pathname === '/manifest.json') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle other requests with network-first strategy
  event.respondWith(
    fetch(request)
      .catch(() => {
        // Return cached version if network fails
        return caches.match(request);
      })
  );
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for API requests
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, trying cache for:', request.url);
    
    // Try cache if network fails
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('✅ Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // Return offline response for login if no cache
    if (url.pathname === '/api/admin/login') {
      return new Response(
        JSON.stringify({ 
          error: 'Offline - Please check your internet connection' 
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Return empty array for articles if no cache
    if (url.pathname === '/api/admin/articles') {
      return new Response(
        JSON.stringify([]),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Handle static files with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('✅ Serving static from cache:', request.url);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Failed to load static file:', request.url, error);
    
    // Return offline page for admin.html
    if (request.url.endsWith('/admin.html')) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>News1 Admin - Offline</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              text-align: center;
              padding: 20px;
            }
            .offline-container {
              background: rgba(255, 255, 255, 0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
              max-width: 400px;
            }
            .icon { font-size: 64px; margin-bottom: 20px; }
            h1 { margin-bottom: 20px; font-size: 24px; }
            p { margin-bottom: 30px; opacity: 0.9; line-height: 1.6; }
            .retry-btn {
              background: white;
              color: #667eea;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              font-size: 16px;
            }
            .retry-btn:hover { background: #f0f0f0; }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="icon">📱</div>
            <h1>Admin Dashboard Offline</h1>
            <p>Anda sedang offline. Periksa koneksi internet Anda dan coba lagi.</p>
            <button class="retry-btn" onclick="window.location.reload()">
              🔄 Coba Lagi
            </button>
          </div>
        </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Handle background sync
async function doBackgroundSync() {
  try {
    // Get all pending requests from IndexedDB
    const pendingRequests = await getPendingRequests();
    
    for (const request of pendingRequests) {
      try {
        await fetch(request.url, request.options);
        await removePendingRequest(request.id);
        console.log('✅ Synced request:', request.url);
      } catch (error) {
        console.error('❌ Failed to sync request:', request.url, error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Notifikasi dari News1 Admin',
      icon: '/manifest.json',
      badge: '/manifest.json',
      vibrate: [200, 100, 200],
      data: data,
      actions: [
        {
          action: 'open',
          title: 'Buka Admin'
        },
        {
          action: 'dismiss',
          title: 'Tutup'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'News1 Admin', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/admin.html')
    );
  }
});

// Helper functions for IndexedDB (simplified)
async function getPendingRequests() {
  // In a real implementation, this would use IndexedDB
  // For now, return empty array
  return [];
}

async function removePendingRequest(id) {
  // In a real implementation, this would remove from IndexedDB
  return Promise.resolve();
}

console.log('🚀 News1 Admin Service Worker loaded');
