document.addEventListener('DOMContentLoaded', function() {
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('./service-worker.js')
                .then(function(registration) {
                    console.log('Service Worker 注册成功，范围:', registration.scope);
                })
                .catch(function(error) {
                    console.log('Service Worker 注册失败:', error);
                });
        });
    }

    // 页面加载完成后隐藏加载动画
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        window.addEventListener('load', function() {
            loadingElement.classList.add('hidden');
            setTimeout(function() {
                loadingElement.style.display = 'none';
            }, 300);
        });
    }

    // 主题切换功能
    const themeToggle = document.getElementById('theme-toggle');
    
    // 设置主题函数
    function setTheme(theme) {
        // 设置HTML属性，确保CSS选择器能正确匹配
        document.body.setAttribute('data-theme', theme);
        
        // 更新图标
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                if (theme === 'dark') {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            }
        }
        
        // 保存主题设置
        localStorage.setItem('theme', theme);
        
        // 触发自定义事件，方便其他组件响应主题变化
        const event = new CustomEvent('themeChanged', { detail: { theme } });
        document.dispatchEvent(event);
    }
    
    // 获取当前应使用的主题
    function getPreferredTheme() {
        // 首先检查用户是否已经设置了主题偏好
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        
        // 其次检查系统主题偏好
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        // 默认使用亮色主题
        return 'light';
    }
    
    // 初始化主题
    setTheme(getPreferredTheme());
    
    // 添加主题切换事件监听
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.body.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
    
    // 监听系统主题变化
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // 只有当用户没有明确设置主题时，才跟随系统主题
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // 移动导航菜单切换
    const mobileMenuButton = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    
    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // 更新图标
            const icon = mobileMenuButton.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // 点击导航链接后关闭移动菜单
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    
                    // 更新图标
                    const icon = mobileMenuButton.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
        });
    }
    
    // 返回顶部按钮
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // 表单验证
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            let isValid = true;
            
            // 获取表单字段
            const nameField = document.getElementById('name');
            const emailField = document.getElementById('email');
            const messageField = document.getElementById('message');
            
            // 清除之前的错误信息
            clearErrors();
            
            // 验证姓名
            if (!nameField.value.trim()) {
                showError(nameField, '请输入您的姓名');
                isValid = false;
            }
            
            // 验证邮箱
            if (!emailField.value.trim()) {
                showError(emailField, '请输入您的邮箱');
                isValid = false;
            } else if (!isValidEmail(emailField.value)) {
                showError(emailField, '请输入有效的邮箱地址');
                isValid = false;
            }
            
            // 验证消息
            if (!messageField.value.trim()) {
                showError(messageField, '请输入留言内容');
                isValid = false;
            }
            
            // 如果验证不通过，阻止表单提交
            if (!isValid) {
                event.preventDefault();
                return false;
            }
            
            // 显示提交中状态
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = '发送中...';
            
            // 模拟表单提交（实际项目中可以使用fetch或AJAX发送表单数据）
            event.preventDefault();
            
            setTimeout(function() {
                // 重置表单
                contactForm.reset();
                
                // 恢复按钮状态
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                
                // 显示成功消息
                showToast('消息发送成功！我们会尽快回复您。', 'success');
            }, 1500);
        });
    }
    
    // 辅助函数：显示错误信息
    function showError(field, message) {
        field.classList.add('error');
        
        // 创建错误消息元素
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        // 添加到表单组中
        field.parentNode.appendChild(errorElement);
    }
    
    // 辅助函数：清除所有错误信息
    function clearErrors() {
        // 移除所有错误类
        const errorFields = document.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
        });
        
        // 移除所有错误消息
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(message => {
            message.parentNode.removeChild(message);
        });
    }
    
    // 辅助函数：验证邮箱格式
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // 辅助函数：显示通知
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        const icon = toast.querySelector('i');
        
        if (toast && toastMessage) {
            // 设置消息
            toastMessage.textContent = message;
            
            // 设置图标和样式
            if (type === 'success') {
                toast.style.backgroundColor = 'var(--success-color)';
                icon.className = 'fas fa-check-circle';
            } else if (type === 'error') {
                toast.style.backgroundColor = 'var(--error-color)';
                icon.className = 'fas fa-exclamation-circle';
            } else if (type === 'warning') {
                toast.style.backgroundColor = 'var(--warning-color)';
                icon.className = 'fas fa-exclamation-triangle';
            }
            
            // 显示通知
            toast.classList.add('show');
            
            // 3秒后自动隐藏
            setTimeout(function() {
                toast.classList.remove('show');
            }, 3000);
        }
    }
});