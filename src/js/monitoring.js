// 性能监控和错误跟踪
const Monitoring = {
    init() {
        this.setupPerformanceMonitoring();
        this.setupErrorTracking();
        this.setupResourceTiming();
    },

    setupPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver(list => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log(`LCP: ${entry.startTime}`);
                    } else if (entry.entryType === 'first-input') {
                        console.log(`FID: ${entry.processingStart - entry.startTime}`);
                    }
                }
            });

            observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
        }
    },

    setupErrorTracking() {
        window.addEventListener('error', event => {
            console.error('Runtime error:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        window.addEventListener('unhandledrejection', event => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    },

    setupResourceTiming() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const resources = performance.getEntriesByType('resource');
                resources.forEach(resource => {
                    if (resource.duration > 1000) {
                        console.warn(`Slow resource load: ${resource.name} (${resource.duration}ms)`);
                    }
                });
            });
        }
    }
};

// 初始化监控
document.addEventListener('DOMContentLoaded', () => {
    Monitoring.init();
});