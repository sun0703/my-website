document.addEventListener('DOMContentLoaded', function() {
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/src/js/service-worker.js')
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
            mobileMenuButton.classList.toggle('active');
        });

        // 点击导航链接后关闭菜单
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navLinks.classList.remove('active');
                mobileMenuButton.classList.remove('active');
            });
        });
    }

    // 设置当前页面的导航链接为激活状态
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // 添加返回顶部按钮功能
    const backToTopButton = document.createElement('button');
    backToTopButton.classList.add('back-to-top');
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.setAttribute('aria-label', '返回顶部');
    document.body.appendChild(backToTopButton);

    // 监听滚动事件，显示/隐藏返回顶部按钮
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // 点击返回顶部按钮
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 表单验证
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 简单验证
            let isValid = true;
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            if (nameInput && nameInput.value.trim() === '') {
                showError(nameInput, '请输入您的姓名');
                isValid = false;
            } else if (nameInput) {
                clearError(nameInput);
            }
            
            if (emailInput) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailInput.value.trim() === '') {
                    showError(emailInput, '请输入您的邮箱');
                    isValid = false;
                } else if (!emailPattern.test(emailInput.value)) {
                    showError(emailInput, '请输入有效的邮箱地址');
                    isValid = false;
                } else {
                    clearError(emailInput);
                }
            }
            
            if (messageInput && messageInput.value.trim() === '') {
                showError(messageInput, '请输入您的消息');
                isValid = false;
            } else if (messageInput) {
                clearError(messageInput);
            }
            
            // 如果验证通过，显示成功消息
            if (isValid) {
                const successMessage = document.createElement('div');
                successMessage.classList.add('success-message');
                successMessage.textContent = '您的消息已发送，我们会尽快回复您！';
                
                contactForm.reset();
                contactForm.parentNode.insertBefore(successMessage, contactForm.nextSibling);
                
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
            }
        });
        
        // 显示错误信息
        function showError(input, message) {
            const formGroup = input.parentElement;
            let errorElement = formGroup.querySelector('.error-message');
            
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.classList.add('error-message');
                formGroup.appendChild(errorElement);
            }
            
            input.classList.add('error');
            errorElement.textContent = message;
        }
        
        // 清除错误信息
        function clearError(input) {
            const formGroup = input.parentElement;
            const errorElement = formGroup.querySelector('.error-message');
            
            if (errorElement) {
                errorElement.remove();
            }
            
            input.classList.remove('error');
        }
    }

    // 图片懒加载
    if ('loading' in HTMLImageElement.prototype) {
        // 浏览器支持原生懒加载
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // 回退方案：使用Intersection Observer
        const lazyImages = document.querySelectorAll('.lazy-image');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy-image');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // 最后的回退：简单的滚动事件监听
            let lazyLoadThrottleTimeout;
            
            function lazyLoad() {
                if (lazyLoadThrottleTimeout) {
                    clearTimeout(lazyLoadThrottleTimeout);
                }
                
                lazyLoadThrottleTimeout = setTimeout(() => {
                    const scrollTop = window.pageYOffset;
                    
                    lazyImages.forEach(img => {
                        if (img.offsetTop < window.innerHeight + scrollTop) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy-image');
                        }
                    });
                    
                    if (lazyImages.length === 0) {
                        document.removeEventListener('scroll', lazyLoad);
                        window.removeEventListener('resize', lazyLoad);
                        window.removeEventListener('orientationChange', lazyLoad);
                    }
                }, 20);
            }
            
            document.addEventListener('scroll', lazyLoad);
            window.addEventListener('resize', lazyLoad);
            window.addEventListener('orientationChange', lazyLoad);
        }
    }
});