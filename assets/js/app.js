document.addEventListener('DOMContentLoaded', function () {
    var currentUserName = document.getElementById('currentUserName');
    var logoutBtn = document.getElementById('logoutBtn');
    var navItems = document.querySelectorAll('.nav-item');
    var sectionTitle = document.getElementById('sectionTitle');
    var sectionDesc = document.getElementById('sectionDesc');
    var subTabs = document.getElementById('subTabs');
    var profileView = document.getElementById('profileView');
    var eventsView = document.getElementById('eventsView');
    var adminView = document.getElementById('adminView');
    var registrationsView = document.getElementById('registrationsView');
    var adminNavBtn = document.getElementById('adminNavBtn');
    var registrationsNavBtn = document.getElementById('registrationsNavBtn');

    var state = {
        currentView: 'profile',
        currentTab: 'all',
        user: null,
        events: [],
        myEvents: [],
        adminUsers: [],
        adminRegistrations: [],
        eventPage: 1,
        myEventPage: 1,
        registrationsPage: 1,
        pageSize: 7
    };

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function buildOptions(list, current) {
        return list.map(function (item) {
            return '<option value="' + item + '"' + (item === current ? ' selected' : '') + '>' + item + '</option>';
        }).join('');
    }

    function buildCollegeOptions(current) {
        var colleges = [
            '文学与文化传播学院',
            '马克思主义学院',
            '教育学院',
            '外国语学院',
            '历史文化学院',
            '商学院',
            '化学工程与技术学院',
            '电子信息与电气工程学院',
            '数学与统计学院',
            '生物工程与技术学院',
            '机电工程学院',
            '土木工程学院',
            '资源与环境工程学院',
            '体育学院',
            '美术与设计学院',
            '音乐舞蹈学院',
            '卫生健康学院',
            '继续教育学院（培训中心）'
        ];
        return '<option value="">请选择学院</option>' + colleges.map(function (item) {
            return '<option value="' + item + '"' + (item === current ? ' selected' : '') + '>' + item + '</option>';
        }).join('');
    }

    function getPaginatedList(list, page) {
        var start = (page - 1) * state.pageSize;
        var end = start + state.pageSize;
        return list.slice(start, end);
    }

    function getTotalPages(list) {
        return Math.ceil(list.length / state.pageSize);
    }

    function renderPagination(totalPages, currentPage, type) {
        if (totalPages <= 1) {
            return '';
        }
        var html = '<div class="pagination">';
        html += '<button class="page-btn" data-page="prev" ' + (currentPage <= 1 ? 'disabled' : '') + '>上一页</button>';
        for (var i = 1; i <= totalPages; i++) {
            html += '<button class="page-btn ' + (i === currentPage ? 'active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button class="page-btn" data-page="next" ' + (currentPage >= totalPages ? 'disabled' : '') + '>下一页</button>';
        html += '</div>';
        return html;
    }

    function renderTabs() {
        var html = '';
        if (state.currentView === 'events') {
            html = ''
                + '<button class="tab-item ' + (state.currentTab === 'all' ? 'active' : '') + '" data-tab="all">报名</button>'
                + '<button class="tab-item ' + (state.currentTab === 'mine' ? 'active' : '') + '" data-tab="mine">报名信息</button>';
        } else if (state.currentView === 'admin') {
            html = '<button class="tab-item active" data-tab="users">用户信息</button>';
        }
        subTabs.innerHTML = html;
        subTabs.classList.toggle('hidden', !html);
        Array.prototype.slice.call(subTabs.querySelectorAll('.tab-item')).forEach(function (item) {
            item.addEventListener('click', function () {
                state.currentTab = item.getAttribute('data-tab');
                renderTabs();
                renderCurrentView();
            });
        });
    }

    function renderProfile() {
        if (!state.user) {
            return;
        }
        profileView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>基础资料</h3><p class="info-meta">支持在线更新姓名、电话、性别、学院和类别信息。</p></div></div>'
            + '  <div class="profile-grid">'
            + '    <div class="info-card"><strong>身份证号</strong><p>' + escapeHtml(state.user.idCard) + '</p></div>'
            + '    <div class="info-card"><strong>登录账号</strong><p>' + escapeHtml(state.user.username) + '</p></div>'
            + '    <div class="info-card"><strong>姓名</strong><p>' + escapeHtml(state.user.name) + '</p></div>'
            + '    <div class="info-card"><strong>联系电话</strong><p>' + escapeHtml(state.user.phone) + '</p></div>'
            + '    <div class="info-card"><strong>性别</strong><p>' + escapeHtml(state.user.gender) + '</p></div>'
            + '    <div class="info-card"><strong>学院</strong><p>' + escapeHtml(state.user.college) + '</p></div>'
            + '    <div class="info-card"><strong>类别</strong><p>' + escapeHtml(state.user.category) + '</p></div>'
            + '  </div>'
            + '</div>'
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>修改信息</h3><p class="info-meta">请保持信息真实准确，方便赛事组织和通知。</p></div></div>'
            + '  <form id="profileForm" class="form-grid two-columns">'
            + '    <label class="field"><span>姓名</span><input name="name" value="' + escapeHtml(state.user.name) + '"></label>'
            + '    <label class="field"><span>电话</span><input name="phone" value="' + escapeHtml(state.user.phone) + '"></label>'
            + '    <label class="field"><span>性别</span><select name="gender">' + buildOptions(['男', '女'], state.user.gender) + '</select></label>'
            + '    <label class="field"><span>学院</span><select name="college">' + buildCollegeOptions(state.user.college) + '</select></label>'
            + '    <label class="field full-row"><span>类别</span><select name="category">' + buildOptions(['青年组', '老年组'], state.user.category) + '</select></label>'
            + '    <div class="form-actions full-row"><button type="submit" class="primary-btn">保存修改</button></div>'
            + '    <p id="profileMessage" class="form-message full-row"></p>'
            + '  </form>'
            + '</div>';

        document.getElementById('profileForm').addEventListener('submit', function (event) {
            event.preventDefault();
            var formData = new FormData(event.target);
            appUtils.ajax({
                method: 'PUT',
                url: '/api/users/me',
                data: {
                    name: String(formData.get('name') || '').trim(),
                    phone: String(formData.get('phone') || '').trim(),
                    gender: String(formData.get('gender') || ''),
                    college: String(formData.get('college') || '').trim(),
                    category: String(formData.get('category') || '')
                },
                success: function (response) {
                    if (!response.success) {
                        appUtils.showMessage(document.getElementById('profileMessage'), response.message || '保存失败', false);
                        return;
                    }
                    state.user = response.data;
                    currentUserName.textContent = state.user.name + (state.user.role === 'ADMIN' ? ' 管理员' : ' 老师');
                    renderProfile();
                    appUtils.showMessage(document.getElementById('profileMessage'), '个人信息已更新', true);
                },
                error: function (xhr, response) {
                    appUtils.showMessage(document.getElementById('profileMessage'), (response && response.message) || '保存失败', false);
                }
            });
        });
    }

    function renderEventTable(list, isMine) {
        if (!list.length) {
            return '<div class="empty-state"><h3>暂无数据</h3><p>' + (isMine ? '你还没有报名任何项目。' : '当前暂无可报名项目。') + '</p></div>';
        }
        var currentPage = isMine ? state.myEventPage : state.eventPage;
        var totalPages = getTotalPages(list);
        var paginatedList = getPaginatedList(list, currentPage);
        
        var html = ''
            + '<table class="event-table">'
            + '  <thead><tr><th>项目名称</th><th>项目类别</th><th>比赛时间</th><th>比赛地点</th><th>报名情况</th><th>项目说明</th><th>操作</th></tr></thead>'
            + '  <tbody>'
            + paginatedList.map(function (item) {
                var actionHtml = isMine
                    ? '<button class="action-btn cancel-btn" data-id="' + item.id + '">取消报名</button>'
                    : '<button class="action-btn register-btn" data-id="' + item.id + '" ' + (item.registered ? 'disabled' : '') + '>' + (item.registered ? '已报名' : '报名') + '</button>';
                return ''
                    + '<tr>'
                    + '<td>' + escapeHtml(item.eventName) + '</td>'
                    + '<td>' + escapeHtml(item.eventCategory) + '</td>'
                    + '<td>' + escapeHtml(item.eventTime) + '</td>'
                    + '<td>' + escapeHtml(item.location) + '</td>'
                    + '<td>' + escapeHtml(item.registeredCount + '/' + item.quota) + '</td>'
                    + '<td>' + escapeHtml(item.description) + '</td>'
                    + '<td>' + actionHtml + '</td>'
                    + '</tr>';
            }).join('')
            + '  </tbody>'
            + '</table>';
        
        html += renderPagination(totalPages, currentPage, isMine);
        html += '<div class="page-info">第 ' + currentPage + ' 页 / 共 ' + totalPages + ' 页，共 ' + list.length + ' 条记录</div>';
        return html;
    }

    function renderUserTable() {
        if (!state.adminUsers.length) {
            return '<div class="empty-state"><h3>暂无用户</h3><p>当前系统还没有用户数据。</p></div>';
        }
        return ''
            + '<table class="event-table">'
            + '<thead><tr><th>姓名</th><th>账号</th><th>身份证号</th><th>电话</th><th>性别</th><th>学院</th><th>类别</th><th>角色</th><th>操作</th></tr></thead>'
            + '<tbody>'
            + state.adminUsers.map(function (item) {
                return ''
                    + '<tr>'
                    + '<td>' + escapeHtml(item.name) + '</td>'
                    + '<td>' + escapeHtml(item.username) + '</td>'
                    + '<td>' + escapeHtml(item.idCard) + '</td>'
                    + '<td>' + escapeHtml(item.phone) + '</td>'
                    + '<td>' + escapeHtml(item.gender) + '</td>'
                    + '<td>' + escapeHtml(item.college) + '</td>'
                    + '<td>' + escapeHtml(item.category) + '</td>'
                    + '<td>' + escapeHtml(item.role === 'ADMIN' ? '管理员' : '普通用户') + '</td>'
                    + '<td>'
                    + '<button class="action-btn reset-btn" data-id="' + item.id + '">重置密码</button> '
                    + '<button class="action-btn delete-btn" data-id="' + item.id + '">删除账号</button>'
                    + '</td>'
                    + '</tr>';
            }).join('')
            + '</tbody></table>';
    }

    function bindUserActions() {
        // 绑定重置密码按钮事件
        Array.prototype.slice.call(document.querySelectorAll('.reset-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                var userId = button.getAttribute('data-id');
                if (confirm('确定要重置该用户的密码吗？重置后密码将变为默认值。')) {
                    appUtils.ajax({
                        method: 'POST',
                        url: '/api/admin/users/' + userId + '/reset-password',
                        success: function (response) {
                            if (response.success) {
                                alert('密码重置成功！');
                            } else {
                                alert('密码重置失败：' + (response.message || '未知错误'));
                            }
                        },
                        error: function (xhr, response) {
                            alert('密码重置失败：' + (response && response.message) || '网络异常');
                        }
                    });
                }
            });
        });

        // 绑定删除账号按钮事件
        Array.prototype.slice.call(document.querySelectorAll('.delete-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                var userId = button.getAttribute('data-id');
                if (confirm('确定要删除该账号吗？此操作不可恢复。')) {
                    appUtils.ajax({
                        method: 'DELETE',
                        url: '/api/admin/users/' + userId,
                        success: function (response) {
                            if (response.success) {
                                alert('账号删除成功！');
                                loadAdminData();
                            } else {
                                alert('账号删除失败：' + (response.message || '未知错误'));
                            }
                        },
                        error: function (xhr, response) {
                            alert('账号删除失败：' + (response && response.message) || '网络异常');
                        }
                    });
                }
            });
        });
    }

    function uniqueEventCount() {
        var map = {};
        state.adminRegistrations.forEach(function (item) {
            map[item.eventName] = true;
        });
        return Object.keys(map).length;
    }

    function renderRegistrationTable() {
        var paginatedRegistrations = getPaginatedList(state.adminRegistrations, state.registrationsPage);
        if (!paginatedRegistrations.length) {
            return '<div class="empty-state"><h3>暂无报名记录</h3><p>目前还没有用户完成项目报名。</p></div>';
        }
        return ''
            + '<table class="event-table">'
            + '<thead><tr><th>姓名</th><th>账号</th><th>电话</th><th>学院</th><th>类别</th><th>项目名称</th><th>项目类别</th><th>时间地点</th><th>状态</th><th>报名时间</th></tr></thead>'
            + '<tbody>'
            + paginatedRegistrations.map(function (item) {
                return ''
                    + '<tr>'
                    + '<td>' + escapeHtml(item.studentName) + '</td>'
                    + '<td>' + escapeHtml(item.username) + '</td>'
                    + '<td>' + escapeHtml(item.phone) + '</td>'
                    + '<td>' + escapeHtml(item.college) + '</td>'
                    + '<td>' + escapeHtml(item.category) + '</td>'
                    + '<td>' + escapeHtml(item.eventName) + '</td>'
                    + '<td>' + escapeHtml(item.eventCategory) + '</td>'
                    + '<td>' + escapeHtml(item.eventTime + ' / ' + item.location) + '</td>'
                    + '<td>' + escapeHtml(item.status) + '</td>'
                    + '<td>' + escapeHtml(item.createdAt) + '</td>'
                    + '</tr>';
            }).join('')
            + '</tbody></table>';
    }

    function renderAdminContent() {
        adminView.innerHTML = ''
            + '<div class="summary-grid">'
            + '  <div class="summary-card"><strong>用户总数</strong><p>' + state.adminUsers.length + '</p></div>'
            + '  <div class="summary-card"><strong>管理员数量</strong><p>' + state.adminUsers.filter(function (item) { return item.role === "ADMIN"; }).length + '</p></div>'
            + '  <div class="summary-card"><strong>普通用户数量</strong><p>' + state.adminUsers.filter(function (item) { return item.role !== "ADMIN"; }).length + '</p></div>'
            + '</div>'
            + renderUserTable();
        bindUserActions();
    }

    function bindRegisterButtons() {
        // 绑定报名按钮事件
        Array.prototype.slice.call(document.querySelectorAll('.register-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                appUtils.ajax({
                    method: 'POST',
                    url: '/api/events/' + button.getAttribute('data-id') + '/register',
                    success: function (response) {
                        if (!response.success) {
                            window.alert(response.message || '报名失败');
                            return;
                        }
                        window.alert('报名成功');
                        loadEventData();
                    },
                    error: function (xhr, response) {
                        window.alert((response && response.message) || '报名失败');
                    }
                });
            });
        });

        // 绑定取消报名按钮事件
        Array.prototype.slice.call(document.querySelectorAll('.cancel-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                if (confirm('确定要取消报名吗？')) {
                    appUtils.ajax({
                        method: 'DELETE',
                        url: '/api/events/' + button.getAttribute('data-id') + '/register',
                        success: function (response) {
                            if (!response.success) {
                                window.alert(response.message || '取消报名失败');
                                return;
                            }
                            window.alert('取消报名成功');
                            loadEventData();
                        },
                        error: function (xhr, response) {
                            window.alert((response && response.message) || '取消报名失败');
                        }
                    });
                }
            });
        });
    }

    function bindPaginationButtons(type) {
        var totalPages, currentPage;
        if (type === 'registrations') {
            totalPages = getTotalPages(state.adminRegistrations);
            currentPage = state.registrationsPage;
        } else {
            var isMine = type === 'mine';
            totalPages = getTotalPages(isMine ? state.myEvents : state.events);
            currentPage = isMine ? state.myEventPage : state.eventPage;
        }
        
        Array.prototype.slice.call(document.querySelectorAll('.pagination .page-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                var page = button.getAttribute('data-page');
                
                if (page === 'prev') {
                    currentPage = Math.max(1, currentPage - 1);
                } else if (page === 'next') {
                    currentPage = Math.min(totalPages, currentPage + 1);
                } else {
                    currentPage = parseInt(page, 10);
                }
                
                if (type === 'registrations') {
                    state.registrationsPage = currentPage;
                    var totalPages = getTotalPages(state.adminRegistrations);
                    registrationsView.innerHTML = ''
                        + '<div class="summary-grid">'
                        + '  <div class="summary-card"><strong>报名记录总数</strong><p>' + state.adminRegistrations.length + '</p></div>'
                        + '  <div class="summary-card"><strong>已报名状态</strong><p>' + state.adminRegistrations.filter(function (item) { return item.status === "已报名"; }).length + '</p></div>'
                        + '  <div class="summary-card"><strong>覆盖项目数</strong><p>' + uniqueEventCount() + '</p></div>'
                        + '</div>'
                        + renderRegistrationTable()
                        + renderPagination(totalPages, state.registrationsPage, 'registrations');
                    bindPaginationButtons('registrations');
                } else {
                    var isMine = type === 'mine';
                    if (isMine) {
                        state.myEventPage = currentPage;
                    } else {
                        state.eventPage = currentPage;
                    }
                    
                    eventsView.innerHTML = renderEventTable(isMine ? state.myEvents : state.events, isMine);
                    bindRegisterButtons();
                    bindPaginationButtons(type);
                }
            });
        });
    }

    function renderCurrentView() {
        profileView.classList.toggle('hidden', state.currentView !== 'profile');
        eventsView.classList.toggle('hidden', state.currentView !== 'events');
        adminView.classList.toggle('hidden', state.currentView !== 'admin');
        registrationsView.classList.toggle('hidden', state.currentView !== 'registrations');

        if (state.currentView === 'profile') {
            sectionTitle.textContent = '个人信息';
            sectionDesc.textContent = '查看并维护当前登录人员的基础资料。';
            renderTabs();
            renderProfile();
            return;
        }

        if (state.currentView === 'events') {
            sectionTitle.textContent = '运动会报名';
            sectionDesc.textContent = '浏览所有项目并完成报名，也可以查看自己的报名信息。';
            renderTabs();
            eventsView.innerHTML = renderEventTable(state.currentTab === 'mine' ? state.myEvents : state.events, state.currentTab === 'mine');
            bindRegisterButtons();
            bindPaginationButtons(state.currentTab === 'mine' ? 'mine' : 'all');
            return;
        }

        if (state.currentView === 'admin') {
            sectionTitle.textContent = '管理员后台';
            sectionDesc.textContent = '查看系统内所有用户资料。';
            renderTabs();
            renderAdminContent();
            return;
        }

        if (state.currentView === 'registrations') {
            sectionTitle.textContent = '报名总览';
            sectionDesc.textContent = '查看所有用户的报名记录。';
            subTabs.classList.add('hidden');
            var totalPages = getTotalPages(state.adminRegistrations);
            registrationsView.innerHTML = ''
                + '<div class="summary-grid">'
                + '  <div class="summary-card"><strong>报名记录总数</strong><p>' + state.adminRegistrations.length + '</p></div>'
                + '  <div class="summary-card"><strong>已报名状态</strong><p>' + state.adminRegistrations.filter(function (item) { return item.status === "已报名"; }).length + '</p></div>'
                + '  <div class="summary-card"><strong>覆盖项目数</strong><p>' + uniqueEventCount() + '</p></div>'
                + '</div>'
                + renderRegistrationTable()
                + renderPagination(totalPages, state.registrationsPage, 'registrations');
            bindPaginationButtons('registrations');
            return;
        }
    }

    function loadEventData() {
        appUtils.ajax({
            method: 'GET',
            url: '/api/events',
            success: function (response) {
                if (response.success) {
                    state.events = response.data || [];
                    renderCurrentView();
                }
            }
        });
        appUtils.ajax({
            method: 'GET',
            url: '/api/events/my',
            success: function (response) {
                if (response.success) {
                    state.myEvents = response.data || [];
                    renderCurrentView();
                }
            }
        });
    }

    function loadAdminData() {
        if (!state.user || state.user.role !== 'ADMIN') {
            return;
        }
        appUtils.ajax({
            method: 'GET',
            url: '/api/admin/users',
            success: function (response) {
                if (response.success) {
                    state.adminUsers = response.data || [];
                    renderCurrentView();
                }
            }
        });
        appUtils.ajax({
            method: 'GET',
            url: '/api/admin/registrations',
            success: function (response) {
                if (response.success) {
                    state.adminRegistrations = response.data || [];
                    renderCurrentView();
                }
            }
        });
    }

    function switchView(view) {
        state.currentView = view;
        if (view === 'events') {
            state.currentTab = state.currentTab === 'mine' ? 'mine' : 'all';
        }
        navItems.forEach(function (item) {
            item.classList.toggle('active', item.getAttribute('data-view') === view);
        });
        renderCurrentView();
    }

    function loadCurrentUser() {
        appUtils.ajax({
            method: 'GET',
            url: '/api/users/me',
            success: function (response) {
                if (!response.success || !response.data) {
                    window.location.href = './login.html';
                    return;
                }
                state.user = response.data;
                currentUserName.textContent = state.user.name + (state.user.role === 'ADMIN' ? ' 管理员' : ' 同学');
                if (state.user.role === 'ADMIN') {
                    adminNavBtn.classList.remove('hidden');
                    registrationsNavBtn.classList.remove('hidden');
                    // 隐藏个人信息和运动会报名菜单
                    document.querySelector('[data-view="profile"]').classList.add('hidden');
                    document.querySelector('[data-view="events"]').classList.add('hidden');
                    // 自动切换到管理员后台视图
                    switchView('admin');
                }
                renderProfile();
                loadEventData();
                loadAdminData();
            },
            error: function () {
                window.location.href = './login.html';
            }
        });
    }

    navItems.forEach(function (item) {
        item.addEventListener('click', function () {
            switchView(item.getAttribute('data-view'));
        });
    });

    logoutBtn.addEventListener('click', function () {
        appUtils.ajax({
            method: 'POST',
            url: '/api/auth/logout',
            success: function () {
                window.location.href = './login.html';
            },
            error: function () {
                window.location.href = './login.html';
            }
        });
    });

    loadCurrentUser();
    switchView('profile');
});
