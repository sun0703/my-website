// 缓存名称和版本
const CACHE_NAME = 'ab521-website-cache-v1';

// 需要缓存的资源
const urlsToCache = [
    './',
    './index.html',
    './about.html',
    './projects.html',
    './skills.html',
    './contact.html',
    './css/style.css',
    './js/main.js',
    './images/favicon.ico',
    './images/apple-touch-icon.png'
];

// 安装 Service Worker
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('缓存已打开');
                return cache.addAll(urlsToCache);
            })
            .then(function() {
                return self.skipWaiting();
            })
    );
});

// 激活 Service Worker
self.addEventListener('activate', function(event) {
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// 处理网络请求
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // 如果找到了缓存的响应，则返回
                if (response) {
                    return response;
                }
                
                // 否则发起网络请求
                return fetch(event.request).then(
                    function(response) {
                        // 检查响应是否有效
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // 克隆响应，因为响应是流，只能使用一次
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                            
                        return response;
                    }
                );
            })
    );
});