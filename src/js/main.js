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

// 初始化主题 - 在脚本执行时立即调用
initTheme();

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