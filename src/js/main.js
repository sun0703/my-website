// 主题切换优化
const themeManager = {
    init() {
        // 添加主题准备中标记
        document.documentElement.classList.add('theme-pending');
        
        // 获取保存的主题
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(savedTheme);

        // 监听主题切换按钮
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // 延迟移除准备中标记
        requestAnimationFrame(() => {
            document.documentElement.classList.remove('theme-pending');
            document.documentElement.classList.add('theme-ready');
        });
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // 更新主题图标
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // 添加过渡类
        document.documentElement.classList.add('theme-transition');
        
        // 应用新主题
        this.applyTheme(newTheme);
        
        // 移除过渡类
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 300);
    }
};

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

// 动画优化器
const animationOptimizer = {
    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
    },

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    },

    setupScrollAnimations() {
        const elements = document.querySelectorAll('.animate-slide-left, .animate-slide-right, .animate-slide-up');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let delay = 0;
                    if (entry.target.dataset.delay) {
                        const parsedDelay = parseInt(entry.target.dataset.delay, 10);
                        delay = isNaN(parsedDelay) ? 0 : parsedDelay;
                    }
                    setTimeout(() => {
                        entry.target.style.visibility = 'visible';
                        entry.target.style.transform = 'none';
                        entry.target.style.opacity = '1';
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '20px'
        });

        elements.forEach(el => {
            el.style.visibility = 'hidden';
            observer.observe(el);
        });
    }
};

// 初始化主题管理器
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
    animationOptimizer.init();

    // 定义移除预加载状态的函数
    function removePreloadClass() {
        document.body.classList.remove('preload');
    }

    // 调用移除预加载状态
    setTimeout(removePreloadClass, 50);

    const mobileMenuButton = document.getElementById('mobile-menu-button');
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

    // 页面加载完成后确保显示
    window.addEventListener('load', () => {
        // 确保body可见
        document.body.style.visibility = 'visible';

        // 调用移除预加载状态函数
        removePreloadClass();
    });

    // 优化滚动事件处理
    const backToTopButton = document.getElementById('back-to-top');
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
        const navLinks = document.getElementById('nav-links');
        if (window.innerWidth > 768 && navLinks) {
            navLinks.classList.remove('active');
        }
    }, 250));
});

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

// 初始化动画优化器
// Removed duplicate DOMContentLoaded listener as logic is consolidated above.

// Service Worker注册
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker注册成功:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker注册失败:', error);
            });
    });
}

// DOM加载完成后的处理
document.addEventListener('DOMContentLoaded', function() {
    // 定义移除预加载状态的函数
    function removePreloadClass() {
        document.body.classList.remove('preload');
    }

    // 调用移除预加载状态
    setTimeout(removePreloadClass, 50);
    
    // 主题切换按钮事件监听
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // 主题切换按钮事件监听已在 themeManager.init 中处理，无需重复绑定
    }
    
    const mobileMenuButton = document.getElementById('mobile-menu-button');
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

    // 页面加载完成后确保显示
    window.addEventListener('load', () => {
        // 确保body可见
        document.body.style.visibility = 'visible';
        
        // 调用移除预加载状态函数
        removePreloadClass();
    });

    // 优化滚动事件处理
    const backToTopButton = document.getElementById('back-to-top');
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
        const navLinks = document.getElementById('nav-links');
        if (window.innerWidth > 768 && navLinks) {
            navLinks.classList.remove('active');
        }
    }, 250));
});