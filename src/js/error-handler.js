// 全局错误处理和状态提示
const ErrorHandler = {
    init() {
        this.setupToast();
        this.setupGlobalErrorHandler();
    },

    setupToast() {
        const toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
        this.toast = toast;
    },

    showToast(message, type = 'info') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type}`;
        this.toast.classList.add('show');
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    },

    setupGlobalErrorHandler() {
        window.onerror = (message, source, lineno, colno, error) => {
            this.showToast('发生错误，请稍后重试', 'error');
            console.error('Global error:', { message, source, lineno, colno, error });
            return true;
        };

        window.onunhandledrejection = (event) => {
            this.showToast('操作失败，请重试', 'error');
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault();
        };
    }
};

// 初始化错误处理
document.addEventListener('DOMContentLoaded', () => {
    ErrorHandler.init();
});