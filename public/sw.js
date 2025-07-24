/**
 * Service Worker for CropCare AI PWA
 * 
 * Handles:
 * - Offline caching of app resources
 * - Model file caching for offline inference
 * - Background sync for user feedback
 * - Push notifications for disease alerts
 */

const CACHE_NAME = 'cropcare-v1.0.0';
const MODEL_CACHE_NAME = 'cropcare-models-v1.0.0';

// Files to cache for offline functionality
const STATIC_CACHE_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/src/App.css',
  '/src/lib/ai-model.ts',
  '/src/lib/offline-storage.ts',
  '/src/lib/utils.ts',
  '/src/pages/Camera.tsx',
  '/src/pages/Results.tsx',
  '/src/pages/History.tsx',
  '/src/pages/Index.tsx',
  '/src/components/ui/button.tsx',
  '/src/components/ui/card.tsx',
  '/src/components/ui/badge.tsx',
  '/src/hooks/use-camera.ts',
  '/src/hooks/use-storage.ts',
  '/models/disease_info_complete.json',
  '/models/model_metadata_demo.json',
  '/placeholder.svg',
  '/favicon.ico'
];

// Model files to cache
const MODEL_FILES = [
  '/models/crop_disease_model.tflite',
  '/models/crop_disease_model.onnx',
  '/models/model_metadata_offline.json',
  '/models/disease_info_complete.json'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/predictions/,
  /\/api\/feedback/,
  /\/api\/diseases/
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📦 Caching static files...');
        return cache.addAll(STATIC_CACHE_FILES);
      }),
      
      // Cache model files
      caches.open(MODEL_CACHE_NAME).then((cache) => {
        console.log('🤖 Caching model files...');
        return cache.addAll(MODEL_FILES);
      })
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('❌ Service Worker installation failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== MODEL_CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle offline requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip unsupported schemes (chrome-extension, data:, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    console.log('⚠️ Skipping unsupported scheme:', url.protocol);
    return;
  }
  
  // Handle different types of requests
  if (isStaticFile(url.pathname)) {
    event.respondWith(handleStaticFile(request));
  } else if (isModelFile(url.pathname)) {
    event.respondWith(handleModelFile(request));
  } else if (isApiRequest(url.pathname)) {
    event.respondWith(handleApiRequest(request));
  } else {
    event.respondWith(handleDefault(request));
  }
});

// Handle static file requests
async function handleStaticFile(request) {
  try {
    // Check if request scheme is supported for caching
    const url = new URL(request.url);
    const isCacheable = url.protocol === 'http:' || url.protocol === 'https:';
    
    // Try network first, fallback to cache
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && isCacheable) {
      // Cache the response for future offline use (only for http/https)
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('⚠️ Failed to cache request:', cacheError);
        // Continue without caching
      }
      return networkResponse;
    } else if (networkResponse.ok) {
      // Return response without caching for unsupported schemes
      return networkResponse;
    }
  } catch (error) {
    console.log('🌐 Network failed, trying cache...');
  }
  
  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return offline page if available
  return caches.match('/index.html');
}

// Handle model file requests
async function handleModelFile(request) {
  try {
    // Check if request scheme is supported for caching
    const url = new URL(request.url);
    const isCacheable = url.protocol === 'http:' || url.protocol === 'https:';
    
    // Try cache first for model files (they don't change often)
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok && isCacheable) {
      // Cache the model file (only for http/https)
      try {
        const cache = await caches.open(MODEL_CACHE_NAME);
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('⚠️ Failed to cache model file:', cacheError);
        // Continue without caching
      }
      return networkResponse;
    } else if (networkResponse.ok) {
      // Return response without caching for unsupported schemes
      return networkResponse;
    }
  } catch (error) {
    console.log('🤖 Model file not available offline');
  }
  
  // Return a placeholder response
  return new Response('Model not available offline', {
    status: 404,
    statusText: 'Model not available'
  });
}

// Handle API requests
async function handleApiRequest(request) {
  try {
    // Check if request scheme is supported for caching
    const url = new URL(request.url);
    const isCacheable = url.protocol === 'http:' || url.protocol === 'https:';
    
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && isCacheable) {
      // Cache successful API responses (only for http/https)
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('⚠️ Failed to cache API response:', cacheError);
        // Continue without caching
      }
      return networkResponse;
    } else if (networkResponse.ok) {
      // Return response without caching for unsupported schemes
      return networkResponse;
    }
  } catch (error) {
    console.log('🌐 API request failed, checking cache...');
  }
  
  // Fallback to cached response
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return offline response
  return new Response(JSON.stringify({
    error: 'Offline mode',
    message: 'API not available offline'
  }), {
    status: 503,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// Handle default requests
async function handleDefault(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    return new Response('Not available offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Background sync for user feedback
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-feedback') {
    console.log('🔄 Background sync triggered for feedback');
    event.waitUntil(syncUserFeedback());
  }
});

// Sync user feedback when online
async function syncUserFeedback() {
  try {
    // Get stored feedback from IndexedDB
    const feedback = await getStoredFeedback();
    
    if (feedback.length === 0) {
      console.log('📤 No feedback to sync');
      return;
    }
    
    // Send feedback to server
    const response = await fetch('/api/feedback/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ feedback })
    });
    
    if (response.ok) {
      console.log('✅ Feedback synced successfully');
      // Clear synced feedback
      await clearSyncedFeedback();
    } else {
      console.error('❌ Feedback sync failed');
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New crop disease alert!',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/placeholder.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/placeholder.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('CropCare AI Alert', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions
function isStaticFile(pathname) {
  return STATIC_CACHE_FILES.some(file => pathname === file) ||
         pathname.startsWith('/src/') ||
         pathname.startsWith('/components/') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.tsx') ||
         pathname.endsWith('.ts');
}

function isModelFile(pathname) {
  return MODEL_FILES.some(file => pathname === file) ||
         pathname.startsWith('/models/') ||
         pathname.endsWith('.tflite') ||
         pathname.endsWith('.onnx') ||
         pathname.endsWith('.json');
}

function isApiRequest(pathname) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(pathname)) ||
         pathname.startsWith('/api/');
}

// IndexedDB operations for feedback sync
async function getStoredFeedback() {
  // This would interact with the offline storage system
  // For now, return empty array
  return [];
}

async function clearSyncedFeedback() {
  // This would clear synced feedback from IndexedDB
  console.log('🗑️ Cleared synced feedback');
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      event.ports[0].postMessage({
        staticCache: STATIC_CACHE_FILES.length,
        modelCache: MODEL_FILES.length
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    default:
      console.log('📨 Unknown message type:', type);
  }
});

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('🗑️ All caches cleared');
}

// Periodic cache cleanup
setInterval(async () => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    // Remove old entries (older than 7 days)
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const date = response.headers.get('date');
        if (date && new Date(date).getTime() < weekAgo) {
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('❌ Cache cleanup failed:', error);
  }
}, 24 * 60 * 60 * 1000); // Run daily

console.log('🤖 CropCare AI Service Worker loaded'); 