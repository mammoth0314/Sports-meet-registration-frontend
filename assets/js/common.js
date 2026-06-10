(function () {
    function normalizeBase(base) {
        return String(base || '').replace(/\/+$/, '');
    }

    function normalizePath(path) {
        var value = String(path || '').trim();
        if (!value) {
            return '';
        }
        return value.charAt(0) === '/' ? value : '/' + value;
    }

    function resolveApiBase() {
        if (window.APP_CONFIG && window.APP_CONFIG.API_BASE) {
            return normalizeBase(window.APP_CONFIG.API_BASE);
        }
        var protocol = window.location.protocol === 'file:' ? 'http:' : window.location.protocol;
        var host = window.location.hostname || 'localhost';
        var port = (window.APP_CONFIG && window.APP_CONFIG.API_PORT) || '8080';
        var contextPath = normalizePath(window.APP_CONFIG && window.APP_CONFIG.API_CONTEXT_PATH);
        return normalizeBase(protocol + '//' + host + ':' + port + contextPath);
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
        var isFormData = typeof FormData !== 'undefined' && options.data instanceof FormData;
        if (!isFormData) {
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        }
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
        xhr.send(options.data ? (isFormData ? options.data : JSON.stringify(options.data)) : null);
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
