// Buddhist Practice Assistant - Service Worker
const CACHE_NAME = 'buddhist-practice-assistant-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/src/App.css',
  '/src/main.tsx',
  '/src/App.tsx',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
];

// Dynamic content that should be cached but can be updated
const DYNAMIC_CACHE = 'buddhist-practice-dynamic-v1';
// Meditation logs that need background sync
const MEDITATION_SYNC_STORE = 'buddhist-meditation-sync';

// Install event - cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For API requests related to wisdom or daily quotes
  if (event.request.url.includes('/api/wisdom') || 
      event.request.url.includes('/api/daily-quote')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // For meditation log requests
  if (event.request.url.includes('/api/meditation-log')) {
    event.respondWith(
      fetch(event.request.clone())
        .catch(() => {
          // If offline, store the request for later sync
          return saveForBackgroundSync(event.request.clone())
            .then(() => {
              return new Response(JSON.stringify({
                success: true,
                message: '禅修记录已保存，将在网络恢复时同步。',
                offline: true
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }

  // For all other requests, use cache-first strategy
  event.respondWith(cacheFirstStrategy(event.request));
});

// Background sync for meditation logs
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-meditation-logs') {
    event.waitUntil(syncMeditationLogs());
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || '每日禅修提醒',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || '智慧圆觉 · 佛学修行助手', 
      options
    )
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// Cache-first strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    await updateCache(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // For HTML requests, return the offline page
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    // Otherwise just fail
    throw error;
  }
}

// Network-first strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    await updateCache(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Update dynamic cache
async function updateCache(request, response) {
  if (!response || response.status !== 200 || response.type !== 'basic') {
    return;
  }
  
  const cache = await caches.open(DYNAMIC_CACHE);
  cache.put(request, response);
}

// Save request for background sync
async function saveForBackgroundSync(request) {
  // Extract the meditation data
  const data = await request.json();
  
  // Store in IndexedDB for later sync
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('buddhist-practice-assistant', 1);
    
    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(MEDITATION_SYNC_STORE)) {
        db.createObjectStore(MEDITATION_SYNC_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(MEDITATION_SYNC_STORE, 'readwrite');
      const store = transaction.objectStore(MEDITATION_SYNC_STORE);
      
      const timestamp = new Date().toISOString();
      const storeRequest = store.add({
        url: request.url,
        method: request.method,
        data: { ...data, timestamp, pendingSync: true },
        createdAt: timestamp
      });
      
      storeRequest.onsuccess = () => {
        // Register for background sync if supported
        if ('sync' in self.registration) {
          self.registration.sync.register('sync-meditation-logs')
            .then(() => resolve())
            .catch((err) => reject(err));
        } else {
          resolve();
        }
      };
      
      storeRequest.onerror = (err) => reject(err);
    };
    
    dbRequest.onerror = (err) => reject(err);
  });
}

// Sync meditation logs when online
async function syncMeditationLogs() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('buddhist-practice-assistant', 1);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(MEDITATION_SYNC_STORE, 'readwrite');
      const store = transaction.objectStore(MEDITATION_SYNC_STORE);
      
      const getAll = store.getAll();
      
      getAll.onsuccess = () => {
        const records = getAll.result;
        
        if (records.length === 0) {
          return resolve();
        }
        
        // Process each pending record
        Promise.all(records.map(async (record) => {
          try {
            // Attempt to sync with server
            const response = await fetch(record.url, {
              method: record.method,
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(record.data)
            });
            
            if (response.ok) {
              // If successful, remove from store
              return store.delete(record.id);
            }
          } catch (error) {
            console.error('Error syncing meditation log:', error);
            // Keep in store to try again later
          }
        }))
        .then(() => resolve())
        .catch((err) => reject(err));
      };
      
      getAll.onerror = (err) => reject(err);
    };
    
    dbRequest.onerror = (err) => reject(err);
  });
}
