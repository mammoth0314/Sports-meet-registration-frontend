document.addEventListener('DOMContentLoaded', function () {
    var currentUserName = document.getElementById('currentUserName');
    var logoutBtn = document.getElementById('logoutBtn');
    var sidebarNav = document.getElementById('sidebarNav');
    var sectionTitle = document.getElementById('sectionTitle');
    var sectionDesc = document.getElementById('sectionDesc');
    var subTabs = document.getElementById('subTabs');
    var mainView = document.getElementById('mainView');

    var state = {
        user: null,
        currentView: '',
        currentTab: 'all',
        events: [],
        myEvents: [],
        adminUsers: [],
        adminRegistrations: [],
        adminEvents: [],
        editingEventId: null
    };

    var genderOptions = ['男', '女'];
    var collegeOptions = [
        '文学院与文化传播学院',
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
    var categoryOptions = ['青年组', '老年组'];

    var studentMenus = [
        { key: 'profile', label: '个人信息', desc: '查看并修改个人信息。' },
        { key: 'events', label: '运动会报名', desc: '查看项目、报名和取消报名。' }
    ];

    var adminMenus = [
        { key: 'admin-home', label: '运动会管理', desc: '查看系统概览。' },
        { key: 'team-info', label: '团体信息管理', desc: '管理学院、班级等团体信息。' },
        { key: 'user-manage', label: '用户信息管理', desc: '管理用户资料、权限和状态。' },
        { key: 'event-manage', label: '项目管理', desc: '新增、编辑和删除比赛项目。' },
        { key: 'athlete-manage', label: '参赛运动员管理', desc: '查看所有已报名人员和项目。' },
        { key: 'score-manage', label: '参赛成绩管理', desc: '录入和维护成绩。' },
        { key: 'record-manage', label: '项目记录管理', desc: '维护项目记录和赛事资料。' },
        { key: 'system-manage', label: '系统管理', desc: '维护系统配置。' }
    ];

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getMenus() {
        return state.user && state.user.role === 'ADMIN' ? adminMenus : studentMenus;
    }

    function getMeta(viewKey) {
        var menu = getMenus().find(function (item) {
            return item.key === viewKey;
        });
        return menu || { label: '系统首页', desc: '欢迎进入运动会报名系统。' };
    }

    function renderSidebar() {
        sidebarNav.innerHTML = getMenus().map(function (item) {
            return '<button class="nav-item ' + (item.key === state.currentView ? 'active' : '') + '" data-view="' + item.key + '">' + item.label + '</button>';
        }).join('');

        Array.prototype.slice.call(sidebarNav.querySelectorAll('.nav-item')).forEach(function (button) {
            button.addEventListener('click', function () {
                switchView(button.getAttribute('data-view'));
            });
        });
    }

    function renderTabs() {
        if (state.currentView !== 'events') {
            subTabs.innerHTML = '';
            subTabs.classList.add('hidden');
            return;
        }

        subTabs.innerHTML = ''
            + '<button class="tab-item ' + (state.currentTab === 'all' ? 'active' : '') + '" data-tab="all">报名</button>'
            + '<button class="tab-item ' + (state.currentTab === 'mine' ? 'active' : '') + '" data-tab="mine">报名信息</button>';
        subTabs.classList.remove('hidden');

        Array.prototype.slice.call(subTabs.querySelectorAll('.tab-item')).forEach(function (button) {
            button.addEventListener('click', function () {
                state.currentTab = button.getAttribute('data-tab');
                renderTabs();
                renderCurrentView();
            });
        });
    }

    function renderProfile() {
        mainView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>基础资料</h3><p class="info-meta">当前账号信息如下。</p></div></div>'
            + '  <div class="profile-grid">'
            + infoCard('身份证号', state.user.idCard)
            + infoCard('登录账号', state.user.username)
            + infoCard('姓名', state.user.name)
            + infoCard('联系电话', state.user.phone)
            + infoCard('性别', state.user.gender)
            + infoCard('学院', state.user.college)
            + infoCard('班级', state.user.className)
            + infoCard('学号', state.user.studentNo)
            + infoCard('类别', state.user.category)
            + infoCard('角色', state.user.role)
            + '  </div>'
            + '</div>'
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>修改个人信息</h3><p class="info-meta">可在此更新姓名、电话、学院、班级、学号等信息。</p></div></div>'
            + '  <form id="profileForm" class="form-grid two-columns">'
            + fieldInput('姓名', 'name', state.user.name, '请输入姓名')
            + fieldInput('联系电话', 'phone', state.user.phone, '请输入电话')
            + fieldSelect('性别', 'gender', state.user.gender, genderOptions, '请选择性别')
            + fieldSelect('学院', 'college', state.user.college, collegeOptions, '请选择学院')
            + fieldInput('班级', 'className', state.user.className, '请输入班级')
            + fieldInput('学号', 'studentNo', state.user.studentNo, '请输入学号')
            + fieldSelect('类别', 'category', state.user.category, categoryOptions, '请选择类别', true)
            + '    <div class="form-actions full-row">'
            + '      <button type="submit" class="primary-btn">保存修改</button>'
            + '    </div>'
            + '    <p id="profileMessage" class="form-message full-row"></p>'
            + '  </form>'
            + '</div>';

        var form = document.getElementById('profileForm');
        var messageEl = document.getElementById('profileMessage');
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var formData = new FormData(form);
            appUtils.ajax({
                method: 'PUT',
                url: '/api/users/me',
                data: {
                    name: String(formData.get('name') || '').trim(),
                    phone: String(formData.get('phone') || '').trim(),
                    gender: String(formData.get('gender') || '').trim(),
                    college: String(formData.get('college') || '').trim(),
                    className: String(formData.get('className') || '').trim(),
                    studentNo: String(formData.get('studentNo') || '').trim(),
                    category: String(formData.get('category') || '').trim()
                },
                success: function (response) {
                    if (!response.success || !response.data) {
                        appUtils.showMessage(messageEl, response.message || '保存失败', false);
                        return;
                    }
                    state.user = response.data;
                    updateCurrentUserName();
                    renderProfile();
                    appUtils.showMessage(document.getElementById('profileMessage'), '个人信息修改成功', true);
                },
                error: function (xhr, response) {
                    appUtils.showMessage(messageEl, (response && response.message) || '保存失败', false);
                }
            });
        });
    }

    function renderEventTable(list, isMine) {
        if (!list.length) {
            mainView.innerHTML = '<div class="empty-state"><h3>暂无数据</h3><p>' + (isMine ? '你还没有报名任何项目。' : '当前暂无可展示项目。') + '</p></div>';
            return;
        }

        mainView.innerHTML = ''
            + '<table class="event-table">'
            + '  <thead><tr><th>项目名称</th><th>项目分类</th><th>比赛时间</th><th>比赛地点</th><th>报名情况</th><th>项目说明</th><th>操作</th></tr></thead>'
            + '  <tbody>'
            + list.map(function (item) {
                var buttonHtml = isMine
                    ? '<button class="action-btn cancel-btn" data-id="' + item.id + '">取消报名</button>'
                    : '<button class="action-btn register-btn" data-id="' + item.id + '"' + (item.registered ? ' disabled' : '') + '>' + (item.registered ? '已报名' : '报名') + '</button>';
                return '<tr>'
                    + '<td>' + escapeHtml(item.eventName) + '</td>'
                    + '<td>' + escapeHtml(item.eventCategory) + '</td>'
                    + '<td>' + escapeHtml(item.eventTime) + '</td>'
                    + '<td>' + escapeHtml(item.location) + '</td>'
                    + '<td>' + escapeHtml((item.registeredCount || 0) + '/' + (item.quota || 0)) + '</td>'
                    + '<td>' + escapeHtml(item.description) + '</td>'
                    + '<td>' + buttonHtml + '</td>'
                    + '</tr>';
            }).join('')
            + '  </tbody>'
            + '</table>';

        Array.prototype.slice.call(document.querySelectorAll('.register-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                var eventId = button.getAttribute('data-id');
                appUtils.ajax({
                    method: 'POST',
                    url: '/api/events/' + eventId + '/register',
                    success: function (response) {
                        if (!response.success) {
                            window.alert(response.message || '报名失败');
                            return;
                        }
                        loadEventData();
                    },
                    error: function (xhr, response) {
                        window.alert((response && response.message) || '报名失败');
                    }
                });
            });
        });

        Array.prototype.slice.call(document.querySelectorAll('.cancel-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                var eventId = button.getAttribute('data-id');
                appUtils.ajax({
                    method: 'DELETE',
                    url: '/api/events/' + eventId + '/register',
                    success: function (response) {
                        if (!response.success) {
                            window.alert(response.message || '取消报名失败');
                            return;
                        }
                        loadEventData();
                    },
                    error: function (xhr, response) {
                        window.alert((response && response.message) || '取消报名失败');
                    }
                });
            });
        });
    }

    function renderAdminHome() {
        mainView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>系统概览</h3><p class="info-meta">管理员可在此查看系统整体情况。</p></div></div>'
            + '  <div class="summary-grid">'
            + summaryCard('用户总数', state.adminUsers.length)
            + summaryCard('报名记录', state.adminRegistrations.length)
            + summaryCard('比赛项目', state.adminEvents.length)
            + '  </div>'
            + '</div>';
    }

    function renderUserManage() {
        if (!state.adminUsers.length) {
            mainView.innerHTML = '<div class="empty-state"><h3>暂无用户</h3><p>当前系统中还没有用户数据。</p></div>';
            return;
        }

        mainView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>数据概览</h3><p class="info-meta">查看当前系统内用户整体情况。</p></div></div>'
            + '  <div class="summary-grid">'
            + summaryCard('用户总数', state.adminUsers.length)
            + summaryCard('管理员数量', state.adminUsers.filter(function (item) { return item.role === 'ADMIN'; }).length)
            + summaryCard('禁用账号数量', state.adminUsers.filter(function (item) { return item.status === 'DISABLED'; }).length)
            + '  </div>'
            + '</div>'
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>用户列表</h3><p class="info-meta">支持重置密码、禁用、解除禁用和删除账号。</p></div></div>'
            + '  <table class="event-table">'
            + '    <thead><tr><th>姓名</th><th>账号</th><th>身份证号</th><th>电话</th><th>性别</th><th>学院</th><th>班级</th><th>学号</th><th>类别</th><th>角色</th><th>状态</th><th>操作</th></tr></thead>'
            + '    <tbody>'
            + state.adminUsers.map(function (item) {
                var isAdmin = item.role === 'ADMIN';
                var statusText = item.status === 'DISABLED' ? '已禁用' : '正常';
                var enableOrDisable = isAdmin ? '' : (item.status === 'DISABLED'
                    ? '<button class="action-btn enable-user-btn" data-id="' + item.id + '">解除禁用</button>'
                    : '<button class="action-btn disable-user-btn" data-id="' + item.id + '">禁用账户</button>');
                var deleteAction = isAdmin ? '' : '<button class="action-btn delete-user-btn" data-id="' + item.id + '">删除</button>';
                return '<tr>'
                    + '<td>' + escapeHtml(item.name) + '</td>'
                    + '<td>' + escapeHtml(item.username) + '</td>'
                    + '<td>' + escapeHtml(item.idCard) + '</td>'
                    + '<td>' + escapeHtml(item.phone) + '</td>'
                    + '<td>' + escapeHtml(item.gender) + '</td>'
                    + '<td>' + escapeHtml(item.college) + '</td>'
                    + '<td>' + escapeHtml(item.className) + '</td>'
                    + '<td>' + escapeHtml(item.studentNo) + '</td>'
                    + '<td>' + escapeHtml(item.category) + '</td>'
                    + '<td>' + escapeHtml(item.role) + '</td>'
                    + '<td>' + escapeHtml(statusText) + '</td>'
                    + '<td><button class="action-btn reset-password-btn" data-id="' + item.id + '">重置密码</button> ' + enableOrDisable + ' ' + deleteAction + '</td>'
                    + '</tr>';
            }).join('')
            + '    </tbody>'
            + '  </table>'
            + '</div>';

        bindAdminUserActions();
    }

    function renderAthleteManage() {
        if (!state.adminRegistrations.length) {
            mainView.innerHTML = '<div class="empty-state"><h3>暂无报名记录</h3><p>当前还没有参赛人员数据。</p></div>';
            return;
        }

        var coveredEvents = {};
        state.adminRegistrations.forEach(function (item) {
            coveredEvents[item.eventName] = true;
        });

        mainView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>数据概览</h3><p class="info-meta">查看当前参赛人员和报名记录。</p></div></div>'
            + '  <div class="summary-grid">'
            + summaryCard('报名记录总数', state.adminRegistrations.length)
            + summaryCard('已覆盖项目', Object.keys(coveredEvents).length)
            + summaryCard('系统用户数', state.adminUsers.length)
            + '  </div>'
            + '</div>'
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>参赛名单</h3><p class="info-meta">显示所有已报名人员和项目详情。</p></div></div>'
            + '  <table class="event-table">'
            + '    <thead><tr><th>姓名</th><th>账号</th><th>电话</th><th>学院</th><th>类别</th><th>项目名称</th><th>项目分类</th><th>时间地点</th><th>状态</th><th>报名时间</th></tr></thead>'
            + '    <tbody>'
            + state.adminRegistrations.map(function (item) {
                return '<tr>'
                    + '<td>' + escapeHtml(item.studentName) + '</td>'
                    + '<td>' + escapeHtml(item.username) + '</td>'
                    + '<td>' + escapeHtml(item.phone) + '</td>'
                    + '<td>' + escapeHtml(item.college) + '</td>'
                    + '<td>' + escapeHtml(item.category) + '</td>'
                    + '<td>' + escapeHtml(item.eventName) + '</td>'
                    + '<td>' + escapeHtml(item.eventCategory) + '</td>'
                    + '<td>' + escapeHtml((item.eventTime || '') + ' / ' + (item.location || '')) + '</td>'
                    + '<td>' + escapeHtml(item.status) + '</td>'
                    + '<td>' + escapeHtml(item.createdAt) + '</td>'
                    + '</tr>';
            }).join('')
            + '    </tbody>'
            + '  </table>'
            + '</div>';
    }

    function renderEventManage() {
        var editingItem = state.adminEvents.find(function (item) {
            return item.id === state.editingEventId;
        }) || {
            eventName: '',
            eventCategory: '',
            location: '',
            quota: '',
            eventTime: '',
            description: ''
        };

        mainView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>' + (state.editingEventId ? '编辑项目' : '新增项目') + '</h3><p class="info-meta">在这里维护比赛项目基础信息。</p></div></div>'
            + '  <form id="eventForm" class="form-grid two-columns">'
            + fieldInput('项目名称', 'eventName', editingItem.eventName, '请输入项目名称')
            + fieldInput('项目分类', 'eventCategory', editingItem.eventCategory, '请输入项目分类')
            + fieldInput('比赛地点', 'location', editingItem.location, '请输入比赛地点')
            + '    <label class="field"><span>人数上限</span><input name="quota" type="number" min="1" value="' + escapeHtml(editingItem.quota) + '" placeholder="请输入人数上限"></label>'
            + fieldInput('比赛时间', 'eventTime', editingItem.eventTime, '例如 2026-05-20 08:30', true)
            + fieldInput('项目说明', 'description', editingItem.description, '请输入项目说明', true)
            + '    <div class="form-actions full-row">'
            + '      <button type="submit" class="primary-btn">' + (state.editingEventId ? '保存修改' : '新增项目') + '</button>'
            + '      <button type="button" class="ghost-btn" id="resetEventForm">清空表单</button>'
            + '    </div>'
            + '    <p id="eventFormMessage" class="form-message full-row"></p>'
            + '  </form>'
            + '</div>'
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>项目列表</h3><p class="info-meta">查看、编辑和删除当前项目。</p></div></div>'
            + (state.adminEvents.length ? ''
                + '<table class="event-table">'
                + '  <thead><tr><th>项目名称</th><th>项目分类</th><th>比赛时间</th><th>比赛地点</th><th>人数上限</th><th>已报名</th><th>项目说明</th><th>操作</th></tr></thead>'
                + '  <tbody>'
                + state.adminEvents.map(function (item) {
                    return '<tr>'
                        + '<td>' + escapeHtml(item.eventName) + '</td>'
                        + '<td>' + escapeHtml(item.eventCategory) + '</td>'
                        + '<td>' + escapeHtml(item.eventTime) + '</td>'
                        + '<td>' + escapeHtml(item.location) + '</td>'
                        + '<td>' + escapeHtml(item.quota) + '</td>'
                        + '<td>' + escapeHtml(item.registeredCount || 0) + '</td>'
                        + '<td>' + escapeHtml(item.description) + '</td>'
                        + '<td><button class="action-btn edit-event-btn" data-id="' + item.id + '">编辑</button> <button class="action-btn delete-event-btn" data-id="' + item.id + '">删除</button></td>'
                        + '</tr>';
                }).join('')
                + '  </tbody>'
                + '</table>'
                : '<div class="empty-state"><h3>暂无项目</h3><p>请先新增比赛项目。</p></div>')
            + '</div>';

        bindEventManageActions();
    }

    function renderPlaceholder(title, desc) {
        mainView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>' + escapeHtml(title) + '</h3><p class="info-meta">' + escapeHtml(desc) + '</p></div></div>'
            + '  <div class="empty-state"><h3>功能持续完善中</h3><p>这个模块的详细功能可以继续在现有框架上补充。</p></div>'
            + '</div>';
    }

    function renderCurrentView() {
        var meta = getMeta(state.currentView);
        sectionTitle.textContent = meta.label;
        sectionDesc.textContent = meta.desc;
        renderTabs();

        if (state.currentView === 'profile') {
            renderProfile();
            return;
        }
        if (state.currentView === 'events') {
            renderEventTable(state.currentTab === 'mine' ? state.myEvents : state.events, state.currentTab === 'mine');
            return;
        }
        if (state.currentView === 'admin-home') {
            renderAdminHome();
            return;
        }
        if (state.currentView === 'user-manage') {
            renderUserManage();
            return;
        }
        if (state.currentView === 'athlete-manage') {
            renderAthleteManage();
            return;
        }
        if (state.currentView === 'event-manage') {
            renderEventManage();
            return;
        }
        if (state.currentView === 'team-info') {
            renderPlaceholder('团体信息管理', '可继续补充学院、班级、代表队等团体信息管理功能。');
            return;
        }
        if (state.currentView === 'score-manage') {
            renderPlaceholder('参赛成绩管理', '可继续补充成绩录入、成绩维护、成绩查询等功能。');
            return;
        }
        if (state.currentView === 'record-manage') {
            renderPlaceholder('项目记录管理', '可继续补充项目记录、秩序册和赛事档案管理功能。');
            return;
        }
        if (state.currentView === 'system-manage') {
            renderPlaceholder('系统管理', '可继续补充系统配置、权限设置和运行维护功能。');
            return;
        }

        renderPlaceholder('系统首页', '欢迎进入运动会报名系统。');
    }

    function switchView(view) {
        state.currentView = view;
        if (view === 'events' && state.currentTab !== 'mine') {
            state.currentTab = 'all';
        }
        renderSidebar();
        renderCurrentView();
    }

    function loadEventData() {
        appUtils.ajax({
            method: 'GET',
            url: '/api/events',
            success: function (response) {
                if (response.success) {
                    state.events = response.data || [];
                    if (state.currentView === 'events') {
                        renderCurrentView();
                    }
                }
            }
        });

        appUtils.ajax({
            method: 'GET',
            url: '/api/events/my',
            success: function (response) {
                if (response.success) {
                    state.myEvents = response.data || [];
                    if (state.currentView === 'events') {
                        renderCurrentView();
                    }
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

        appUtils.ajax({
            method: 'GET',
            url: '/api/admin/events',
            success: function (response) {
                if (response.success) {
                    state.adminEvents = response.data || [];
                    renderCurrentView();
                }
            }
        });
    }

    function bindAdminUserActions() {
        bindUserAction('.reset-password-btn', 'POST', '/api/admin/users/{id}/reset-password', '重置密码成功');
        bindUserAction('.disable-user-btn', 'POST', '/api/admin/users/{id}/disable', '账号已禁用');
        bindUserAction('.enable-user-btn', 'POST', '/api/admin/users/{id}/enable', '账号已解除禁用');
        bindUserAction('.delete-user-btn', 'DELETE', '/api/admin/users/{id}', '用户已删除');
    }

    function bindUserAction(selector, method, urlTemplate, successText) {
        Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function (button) {
            button.addEventListener('click', function () {
                var userId = button.getAttribute('data-id');
                appUtils.ajax({
                    method: method,
                    url: urlTemplate.replace('{id}', userId),
                    success: function (response) {
                        if (!response.success) {
                            window.alert(response.message || '操作失败');
                            return;
                        }
                        if (successText) {
                            window.alert(successText);
                        }
                        loadAdminData();
                    },
                    error: function (xhr, response) {
                        window.alert((response && response.message) || '操作失败');
                    }
                });
            });
        });
    }

    function bindEventManageActions() {
        var form = document.getElementById('eventForm');
        var resetButton = document.getElementById('resetEventForm');
        var messageEl = document.getElementById('eventFormMessage');

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var formData = new FormData(form);
                var payload = {
                    eventName: String(formData.get('eventName') || '').trim(),
                    eventCategory: String(formData.get('eventCategory') || '').trim(),
                    location: String(formData.get('location') || '').trim(),
                    quota: Number(formData.get('quota') || 0),
                    eventTime: String(formData.get('eventTime') || '').trim(),
                    description: String(formData.get('description') || '').trim()
                };

                appUtils.ajax({
                    method: state.editingEventId ? 'PUT' : 'POST',
                    url: state.editingEventId ? '/api/admin/events/' + state.editingEventId : '/api/admin/events',
                    data: payload,
                    success: function (response) {
                        if (!response.success) {
                            appUtils.showMessage(messageEl, response.message || '保存失败', false);
                            return;
                        }
                        state.editingEventId = null;
                        loadAdminData();
                    },
                    error: function (xhr, response) {
                        appUtils.showMessage(messageEl, (response && response.message) || '保存失败', false);
                    }
                });
            });
        }

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                state.editingEventId = null;
                renderCurrentView();
            });
        }

        Array.prototype.slice.call(document.querySelectorAll('.edit-event-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                state.editingEventId = Number(button.getAttribute('data-id'));
                renderCurrentView();
            });
        });

        Array.prototype.slice.call(document.querySelectorAll('.delete-event-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                var eventId = button.getAttribute('data-id');
                appUtils.ajax({
                    method: 'DELETE',
                    url: '/api/admin/events/' + eventId,
                    success: function (response) {
                        if (!response.success) {
                            window.alert(response.message || '删除失败');
                            return;
                        }
                        if (state.editingEventId === Number(eventId)) {
                            state.editingEventId = null;
                        }
                        loadAdminData();
                    },
                    error: function (xhr, response) {
                        window.alert((response && response.message) || '删除失败');
                    }
                });
            });
        });
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
                state.currentView = state.user.role === 'ADMIN' ? 'admin-home' : 'profile';
                updateCurrentUserName();
                renderSidebar();
                renderCurrentView();
                loadEventData();
                loadAdminData();
            },
            error: function () {
                window.location.href = './login.html';
            }
        });
    }

    function updateCurrentUserName() {
        currentUserName.textContent = state.user.name + (state.user.role === 'ADMIN' ? ' 管理员' : ' 用户');
    }

    function fieldInput(label, name, value, placeholder, fullRow) {
        return '    <label class="field ' + (fullRow ? 'full-row' : '') + '"><span>' + label + '</span><input name="' + name + '" value="' + escapeHtml(value) + '" placeholder="' + placeholder + '"></label>';
    }

    function fieldSelect(label, name, value, options, placeholder, fullRow) {
        return '    <label class="field ' + (fullRow ? 'full-row' : '') + '"><span>' + label + '</span><select name="' + name + '">'
            + '<option value="">' + placeholder + '</option>'
            + options.map(function (item) {
                return '<option value="' + escapeHtml(item) + '"' + (item === value ? ' selected' : '') + '>' + escapeHtml(item) + '</option>';
            }).join('')
            + '</select></label>';
    }

    function infoCard(label, value) {
        return '    <div class="info-card"><strong>' + label + '</strong><p>' + escapeHtml(value) + '</p></div>';
    }

    function summaryCard(label, value) {
        return '    <div class="summary-card"><strong>' + label + '</strong><p>' + escapeHtml(value) + '</p></div>';
    }

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
});
