document.addEventListener('DOMContentLoaded', function () {
    appUtils.redirectIfLoggedIn();

    var form = document.getElementById('registerForm');
    var message = document.getElementById('registerMessage');
    var backLogin = document.getElementById('backLogin');

    backLogin.addEventListener('click', function () {
        window.location.href = './login.html';
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var formData = new FormData(form);

        appUtils.ajax({
            method: 'POST',
            url: '/api/auth/register',
            data: {
                idCard: String(formData.get('idCard') || '').trim(),
                username: String(formData.get('username') || '').trim(),
                password: String(formData.get('password') || '').trim(),
                confirmPassword: String(formData.get('confirmPassword') || '').trim(),
                name: String(formData.get('name') || '').trim(),
                phone: String(formData.get('phone') || '').trim(),
                gender: String(formData.get('gender') || ''),
                college: String(formData.get('college') || '').trim(),
                className: String(formData.get('className') || '').trim(),
                studentNo: String(formData.get('studentNo') || '').trim(),
                category: String(formData.get('category') || '')
            },
            success: function (response) {
                if (!response.success) {
                    appUtils.showMessage(message, response.message || '注册失败', false);
                    return;
                }
                appUtils.showMessage(message, '注册成功，正在进入系统...', true);
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
