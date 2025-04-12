// 资源加载优化
const ResourceLoader = {
    init() {
        this.setupLazyLoading();
        this.preloadCriticalAssets();
        this.deferNonCritical();
    },

    setupLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.loading = 'lazy';
                img.src = img.dataset.src;
            });
        } else {
            // 回退方案
            this.setupIntersectionObserver();
        }
    },

    setupIntersectionObserver() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    },

    preloadCriticalAssets() {
        const criticalAssets = [
            '/css/style.css',
            '/js/main.js',
            '/images/logo.png'
        ];

        criticalAssets.forEach(asset => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = asset;
            link.as = asset.endsWith('.css') ? 'style' : 
                     asset.endsWith('.js') ? 'script' : 'image';
            document.head.appendChild(link);
        });
    },

    deferNonCritical() {
        document.querySelectorAll('script[data-defer]').forEach(script => {
            script.setAttribute('defer', '');
            script.removeAttribute('data-defer');
        });
    }
};

// 初始化资源加载优化
document.addEventListener('DOMContentLoaded', () => {
    ResourceLoader.init();
});