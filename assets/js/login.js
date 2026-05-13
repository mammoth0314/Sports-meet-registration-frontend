document.addEventListener('DOMContentLoaded', function () {
    appUtils.redirectIfLoggedIn();

    var form = document.getElementById('loginForm');
    var message = document.getElementById('loginMessage');
    var goRegister = document.getElementById('goRegister');
    var usernameInput = document.querySelector('input[name="username"]');
    var passwordInput = document.querySelector('input[name="password"]');
    
    // 强制清空输入字段，确保不保留历史登录信息
    setTimeout(function() {
        usernameInput.value = '';
        passwordInput.value = '';
        // 移除可能的自动填充样式
        usernameInput.style.background = 'rgba(255, 255, 255, 0.95)';
        passwordInput.style.background = 'rgba(255, 255, 255, 0.95)';
    }, 100);
    
    // 再次清空，确保浏览器自动填充后也能被清空
    setTimeout(function() {
        usernameInput.value = '';
        passwordInput.value = '';
    }, 500);

    goRegister.addEventListener('click', function () {
        window.location.href = './register.html';
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var formData = new FormData(form);

        appUtils.ajax({
            method: 'POST',
            url: '/api/auth/login',
            data: {
                username: String(formData.get('username') || '').trim(),
                password: String(formData.get('password') || '').trim()
            },
            success: function (response) {
                if (!response.success) {
                    appUtils.showMessage(message, response.message || '登录失败', false);
                    return;
                }
                appUtils.showMessage(message, '登录成功，正在进入系统...', true);
                setTimeout(function () {
                    window.location.href = './app.html';
                }, 400);
            },
            error: function (xhr, response) {
                appUtils.showMessage(message, (response && response.message) || '网络异常，请确认后端已启动', false);
            }
        });
    });
});
