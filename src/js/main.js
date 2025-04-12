// 主题初始化和切换逻辑
function initTheme() {
    // 获取保存的主题
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // 设置文档主题
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
    
    // 更新主题切换按钮图标
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

// 性能优化 - 添加防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 性能优化 - 添加节流函数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 性能监控
const performanceMonitor = {
    init() {
        // 监控页面加载性能
        window.addEventListener('load', () => {
            const timing = performance.getEntriesByType('navigation')[0];
            console.log('页面加载时间:', timing.loadEventEnd - timing.navigationStart);
            console.log('DOM解析时间:', timing.domComplete - timing.domInteractive);
        });

        // 监控资源加载性能
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.initiatorType === 'resource') {
                    console.log(`资源 ${entry.name} 加载时间:`, entry.duration);
                }
            }
        });
        
        observer.observe({ entryTypes: ['resource'] });
    }
};

// 图片优化
const imageOptimizer = {
    init() {
        // 检测WebP支持
        const webpSupport = this.checkWebPSupport();
        if (webpSupport) {
            document.documentElement.classList.add('webp');
        }

        // 初始化图片懒加载
        this.initLazyLoading();
    },

    checkWebPSupport() {
        const elem = document.createElement('canvas');
        if (elem.getContext && elem.getContext('2d')) {
            return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        return false;
    },

    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
};

// 资源优化器
const resourceOptimizer = {
    init() {
        this.preloadCriticalResources();
        this.deferNonCriticalResources();
        this.monitorResourceTiming();
    },

    preloadCriticalResources() {
        const criticalResources = [
            { url: '/css/style.css', as: 'style' },
            { url: '/js/main.js', as: 'script' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.url;
            link.as = resource.as;
            document.head.appendChild(link);
        });
    },

    deferNonCriticalResources() {
        document.querySelectorAll('script[defer-loading]').forEach(script => {
            script.setAttribute('defer', '');
            script.removeAttribute('defer-loading');
        });
    },

    monitorResourceTiming() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.duration > 1000) { // 超过1秒的资源加载
                    console.warn(`Resource ${entry.name} took ${entry.duration}ms to load`);
                }
            });
        });
        
        observer.observe({ entryTypes: ['resource'] });
    }
};

// 请求优化器
const requestOptimizer = {
    init() {
        this.setupRequestCache();
        this.initRequestQueue();
    },

    setupRequestCache() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
    },

    initRequestQueue() {
        this.queue = [];
        this.processingQueue = false;
    },

    async request(url, options = {}) {
        // 检查缓存
        const cachedResponse = this.checkCache(url);
        if (cachedResponse) {
            return cachedResponse;
        }

        // 加入请求队列
        return new Promise((resolve, reject) => {
            this.queue.push({
                url,
                options,
                resolve,
                reject
            });
            
            if (!this.processingQueue) {
                this.processQueue();
            }
        });
    },

    async processQueue() {
        if (this.queue.length === 0) {
            this.processingQueue = false;
            return;
        }

        this.processingQueue = true;
        const { url, options, resolve, reject } = this.queue.shift();

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            this.setCache(url, data);
            resolve(data);
        } catch (error) {
            reject(error);
        }

        // 继续处理队列
        setTimeout(() => this.processQueue(), 100);
    },

    checkCache(url) {
        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    },

    setCache(url, data) {
        this.cache.set(url, {
            data,
            timestamp: Date.now()
        });
    }
};

// 页面分析器
const pageAnalyzer = {
    init() {
        this.analyzePageMetrics();
        this.setupPerformanceMarkers();
        this.watchNetworkStatus();
    },

    analyzePageMetrics() {
        // 分析关键渲染路径
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.entryType === 'largest-contentful-paint') {
                    console.log('LCP:', entry.startTime);
                } else if (entry.entryType === 'first-input') {
                    console.log('FID:', entry.processingStart - entry.startTime);
                }
            });
        });

        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    },

    setupPerformanceMarkers() {
        performance.mark('app-init-start');
        window.addEventListener('load', () => {
            performance.mark('app-init-end');
            performance.measure('app-init', 'app-init-start', 'app-init-end');
        });
    },

    watchNetworkStatus() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.addEventListener) {
                connection.addEventListener('change', () => {
                    this.adjustForNetworkQuality(connection);
                });
            }
        }
    },

    adjustForNetworkQuality(connection) {
        const quality = {
            slow2g: 'low',
            '2g': 'low',
            '3g': 'medium',
            '4g': 'high'
        }[connection.effectiveType] || 'high';

        document.documentElement.dataset.networkQuality = quality;
    }
};

// 初始化主题 - 在脚本执行时立即调用
initTheme();

// 初始化性能监控
performanceMonitor.init();

// 初始化图片优化
imageOptimizer.init();

// 初始化资源优化器
resourceOptimizer.init();

// 初始化请求优化器
requestOptimizer.init();

// 初始化页面分析器
pageAnalyzer.init();

// DOM加载完成后的处理
document.addEventListener('DOMContentLoaded', () => {
    // 再次确保主题正确设置
    initTheme();
    
    // 移除预加载状态
    setTimeout(() => {
        document.body.classList.remove('preload');
    }, 50);
    
    // 主题切换按钮事件监听
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // 更新按钮图标
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }

    // 移动端菜单处理
    const mobileMenuButton = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    
    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuButton.querySelector('i');
            if (icon) {
                icon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
            }
        });
    }
});

// 页面加载完成后确保显示
window.addEventListener('load', () => {
    // 确保body可见
    document.body.style.visibility = 'visible';
    
    // 移除预加载状态
    document.body.classList.remove('preload');
});

// 优化滚动事件处理
window.addEventListener('scroll', throttle(() => {
    if (backToTopButton) {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }
}, 100));

// 优化窗口大小改变事件处理
window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 768 && navLinks) {
        navLinks.classList.remove('active');
    }
}, 250));