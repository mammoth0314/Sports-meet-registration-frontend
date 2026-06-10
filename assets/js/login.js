document.addEventListener('DOMContentLoaded', function () {
    appUtils.redirectIfLoggedIn();

    var form = document.getElementById('loginForm');
    var message = document.getElementById('loginMessage');
    var goRegister = document.getElementById('goRegister');
    var refreshCaptchaBtn = document.getElementById('refreshCaptcha');
    var captchaCanvas = document.getElementById('captchaCanvas');
    var captchaCtx = captchaCanvas.getContext('2d');
    var captchaCode = '';
    var rememberCheckbox = document.getElementById('rememberAccount');
    var loginIdInput = form.querySelector('[name="loginId"]');

    // 记住账号：页面加载时填充
    var remembered = localStorage.getItem('rememberedAccount');
    if (remembered) {
        loginIdInput.value = remembered;
        rememberCheckbox.checked = true;
    }

    // 勾选时立即保存
    rememberCheckbox.addEventListener('change', function () {
        if (rememberCheckbox.checked) {
            var currentValue = String(loginIdInput.value || '').trim();
            if (currentValue) {
                localStorage.setItem('rememberedAccount', currentValue);
            }
        } else {
            localStorage.removeItem('rememberedAccount');
        }
    });

    // 输入时更新（如果已勾选记住账号）
    loginIdInput.addEventListener('input', function () {
        if (rememberCheckbox.checked) {
            var val = String(loginIdInput.value || '').trim();
            if (val) {
                localStorage.setItem('rememberedAccount', val);
            } else {
                localStorage.removeItem('rememberedAccount');
            }
        }
    });

    function randomChar() {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        return chars.charAt(Math.floor(Math.random() * chars.length));
    }

    function randomColor(min, max) {
        var r = Math.floor(Math.random() * (max - min) + min);
        var g = Math.floor(Math.random() * (max - min) + min);
        var b = Math.floor(Math.random() * (max - min) + min);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    function drawCaptcha() {
        captchaCode = '';
        for (var i = 0; i < 4; i += 1) {
            captchaCode += randomChar();
        }

        captchaCtx.clearRect(0, 0, captchaCanvas.width, captchaCanvas.height);
        captchaCtx.fillStyle = '#f8fbff';
        captchaCtx.fillRect(0, 0, captchaCanvas.width, captchaCanvas.height);

        for (var i = 0; i < 6; i += 1) {
            captchaCtx.strokeStyle = randomColor(160, 220);
            captchaCtx.beginPath();
            captchaCtx.moveTo(Math.random() * 140, Math.random() * 48);
            captchaCtx.lineTo(Math.random() * 140, Math.random() * 48);
            captchaCtx.stroke();
        }

        captchaCtx.font = 'bold 28px Arial';
        captchaCtx.textBaseline = 'middle';
        for (var j = 0; j < captchaCode.length; j += 1) {
            var char = captchaCode.charAt(j);
            var x = 18 + j * 30;
            var y = 24 + (Math.random() * 6 - 3);
            var angle = (Math.random() * 30 - 15) * Math.PI / 180;
            captchaCtx.save();
            captchaCtx.translate(x, y);
            captchaCtx.rotate(angle);
            captchaCtx.fillStyle = randomColor(40, 120);
            captchaCtx.fillText(char, 0, 0);
            captchaCtx.restore();
        }

        for (var k = 0; k < 20; k += 1) {
            captchaCtx.fillStyle = randomColor(120, 220);
            captchaCtx.fillRect(Math.random() * 140, Math.random() * 48, 2, 2);
        }
    }

    function validateCaptcha(value) {
        return String(value || '').trim().toUpperCase() === captchaCode;
    }

    goRegister.addEventListener('click', function () {
        window.location.href = './register.html';
    });

    refreshCaptchaBtn.addEventListener('click', function () {
        drawCaptcha();
    });

    captchaCanvas.addEventListener('click', function () {
        drawCaptcha();
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var formData = new FormData(form);

        if (!validateCaptcha(formData.get('captcha'))) {
            appUtils.showMessage(message, '图像验证码错误，请重新输入', false);
            drawCaptcha();
            return;
        }

        appUtils.ajax({
            method: 'POST',
            url: '/api/auth/login',
            data: {
                loginId: String(formData.get('loginId') || '').trim(),
                password: String(formData.get('password') || '').trim()
            },
            success: function (response) {
                if (!response.success) {
                    appUtils.showMessage(message, response.message || '登录失败', false);
                    drawCaptcha();
                    return;
                }

                // 记住账号：登录成功时再次确认保存
                if (rememberCheckbox.checked) {
                    localStorage.setItem('rememberedAccount', String(formData.get('loginId') || '').trim());
                }

                appUtils.showMessage(message, '登录成功，正在进入系统...', true);
                setTimeout(function () {
                    window.location.href = './app.html';
                }, 400);
            },
            error: function (xhr, response) {
                appUtils.showMessage(message, (response && response.message) || '网络异常，请检查后端服务', false);
                drawCaptcha();
            }
        });
    });

    drawCaptcha();
});
