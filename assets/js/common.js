(function () {
    function resolveApiBase() {
        if (window.location.protocol === 'file:') {
            return 'http://localhost:8080';
        }
        return window.location.protocol + '//' + window.location.hostname + ':8080';
    }

    var API_BASE = resolveApiBase();

    function buildUrl(url) {
        if (/^https?:\/\//.test(url)) {
            return url;
        }
        return API_BASE + url;
    }

    function ajax(options) {
        var xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', buildUrl(options.url), true);
        xhr.withCredentials = true;
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.onreadystatechange = function () {
            var response;
            if (xhr.readyState !== 4) {
                return;
            }
            try {
                response = xhr.responseText ? JSON.parse(xhr.responseText) : {};
            } catch (error) {
                response = { success: false, message: '响应数据解析失败' };
            }
            if (xhr.status >= 200 && xhr.status < 300) {
                options.success && options.success(response);
                return;
            }
            options.error && options.error(xhr, response);
        };
        xhr.onerror = function () {
            options.error && options.error(xhr, { success: false, message: '网络异常，请确认后端已启动' });
        };
        xhr.send(options.data ? JSON.stringify(options.data) : null);
    }

    function showMessage(element, message, isSuccess) {
        if (!element) {
            return;
        }
        element.textContent = message || '';
        element.className = 'form-message ' + (isSuccess ? 'success' : 'error');
    }

    function redirectIfLoggedIn() {
        ajax({
            method: 'GET',
            url: '/api/users/me',
            success: function (response) {
                if (response.success && response.data) {
                    window.location.href = './app.html';
                }
            }
        });
    }

    window.appUtils = {
        ajax: ajax,
        showMessage: showMessage,
        redirectIfLoggedIn: redirectIfLoggedIn,
        apiBase: API_BASE
    };
})();
