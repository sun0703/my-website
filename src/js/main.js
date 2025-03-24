document.addEventListener('DOMContentLoaded', function() {
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/js/service-worker.js')
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
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.body.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // 直接设置HTML属性，确保CSS选择器能正确匹配
            document.body.setAttribute('data-theme', newTheme);
            
            // 更新图标
            const icon = themeToggle.querySelector('i');
            if (newTheme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light');
            }
        });

        // 从本地存储中恢复主题设置
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            const icon = themeToggle.querySelector('i');
            if (savedTheme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
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

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // 减去导航栏高度
                    behavior: 'smooth'
                });
            }
        });
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