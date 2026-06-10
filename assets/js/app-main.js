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
        allAdminUsers: [],
        adminRegistrations: [],
        adminEvents: [],
        dashboardStats: {
            onlineUsers: 0
        },
        editingEventId: null,
        editingUserId: null,
        userPage: 1,
        userPageSize: 8,
        userKeyword: '',
        userTotal: 0,
        eventPage: 1,
        eventPageSize: 8,
        eventTotal: 0,
        adminEventPage: 1,
        adminEventPageSize: 8,
        adminEventTotal: 0,
        athletePage: 1,
        athletePageSize: 8,
        athleteTotal: 0
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
        { key: 'profile-view', label: '查看信息', desc: '查看当前账号信息。' },
        { key: 'profile-edit', label: '修改信息', desc: '修改个人资料。' },
        { key: 'events', label: '运动会报名', desc: '查看项目、报名和取消报名。' }
    ];

    var adminMenus = [
        { key: 'admin-home', label: '运动会管理', desc: '查看系统概览。' },
        {
            label: '用户信息管理',
            children: [
                { key: 'user-list', label: '用户列表', desc: '查询、导出、重置密码及禁用等操作。' },
                { key: 'user-add', label: '新增用户', desc: '新增系统用户或批量上传。' }
            ]
        },
        { key: 'team-info', label: '团体信息管理', desc: '管理学院、班级等团体信息。' },
        {
            label: '项目管理',
            children: [
                { key: 'event-list', label: '项目列表', desc: '查看、编辑和删除比赛项目。' },
                { key: 'event-add', label: '新增项目', desc: '新增比赛项目。' }
            ]
        },
        { key: 'athlete-manage', label: '参赛运动员管理', desc: '查看所有已报名人员。' },
        { key: 'score-manage', label: '参赛成绩管理', desc: '录入和维护成绩。' },
        { key: 'record-manage', label: '项目记录管理', desc: '维护项目记录。' },
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
        var menus = getMenus();
        for (var i = 0; i < menus.length; i++) {
            var item = menus[i];
            if (item.key === viewKey) return item;
            if (item.children) {
                for (var j = 0; j < item.children.length; j++) {
                    if (item.children[j].key === viewKey) return item.children[j];
                }
            }
        }
        return { label: '系统首页', desc: '欢迎进入运动会报名系统。' };
    }

    function isParentActive(item) {
        if (item.key === state.currentView) return true;
        if (item.children) {
            for (var i = 0; i < item.children.length; i++) {
                if (item.children[i].key === state.currentView) return true;
            }
        }
        return false;
    }

    function renderSidebar() {
        var expandedParent = null;
        var menus = getMenus();
        for (var i = 0; i < menus.length; i++) {
            if (menus[i].children && isParentActive(menus[i])) {
                expandedParent = menus[i].label;
                break;
            }
        }

        var html = '';
        for (var p = 0; p < menus.length; p++) {
            var item = menus[p];
            if (item.children) {
                var isExpanded = (item.label === expandedParent);
                html += '<div class="nav-group">';
                html += '<button class="nav-parent ' + (isExpanded ? 'expanded' : '') + '" data-parent="' + escapeHtml(item.label) + '">'
                    + '<span class="nav-arrow">&#9654;</span> ' + item.label + '</button>';
                html += '<div class="nav-children' + (isExpanded ? ' open' : '') + '" data-parent-group="' + escapeHtml(item.label) + '">';
                for (var c = 0; c < item.children.length; c++) {
                    var child = item.children[c];
                    html += '<button class="nav-item nav-sub ' + (child.key === state.currentView ? 'active' : '') + '" data-view="' + child.key + '">' + child.label + '</button>';
                }
                html += '</div>';
                html += '</div>';
            } else {
                html += '<button class="nav-item ' + (item.key === state.currentView ? 'active' : '') + '" data-view="' + item.key + '">' + item.label + '</button>';
            }
        }
        sidebarNav.innerHTML = html;

        Array.prototype.slice.call(sidebarNav.querySelectorAll('.nav-item[data-view]')).forEach(function (btn) {
            btn.addEventListener('click', function () {
                switchView(btn.getAttribute('data-view'));
            });
        });

        Array.prototype.slice.call(sidebarNav.querySelectorAll('.nav-parent')).forEach(function (btn) {
            btn.addEventListener('click', function () {
                var parentLabel = btn.getAttribute('data-parent');
                var childGroup = sidebarNav.querySelector('[data-parent-group="' + CSS.escape(parentLabel) + '"]');
                if (childGroup) {
                    var isOpen = childGroup.classList.contains('open');
                    Array.prototype.slice.call(sidebarNav.querySelectorAll('.nav-children.open')).forEach(function (g) {
                        g.classList.remove('open');
                    });
                    Array.prototype.slice.call(sidebarNav.querySelectorAll('.nav-parent.expanded')).forEach(function (p) {
                        p.classList.remove('expanded');
                    });
                    if (!isOpen) {
                        childGroup.classList.add('open');
                        btn.classList.add('expanded');
                    }
                }
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

    // ===================== 查看信息（独立页面） =====================
    function renderProfileView() {
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
            + '</div>';
    }

    // ===================== 修改信息（独立页面） =====================
    function renderProfileEdit() {
        mainView.innerHTML = ''
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
            + '      <button type="button" class="ghost-btn" id="cancelProfileEdit">取消</button>'
            + '    </div>'
            + '    <p id="profileMessage" class="form-message full-row"></p>'
            + '  </form>'
            + '</div>';

        var form = document.getElementById('profileForm');
        var messageEl = document.getElementById('profileMessage');
        var cancelBtn = document.getElementById('cancelProfileEdit');

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
                    appUtils.showMessage(messageEl, '个人信息修改成功', true);
                    setTimeout(function () {
                        switchView('profile-view');
                    }, 800);
                },
                error: function (xhr, response) {
                    appUtils.showMessage(messageEl, (response && response.message) || '保存失败', false);
                }
            });
        });

        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                switchView('profile-view');
            });
        }
    }

    // ===================== 运动会报名 =====================
    function renderEventTable(list, isMine) {
        state.eventTotal = list.length;
        var totalPages = Math.ceil(state.eventTotal / state.eventPageSize) || 1;
        if (state.eventPage > totalPages) state.eventPage = totalPages;
        var start = (state.eventPage - 1) * state.eventPageSize;
        var pageItems = list.slice(start, start + state.eventPageSize);

        if (!list.length) {
            mainView.innerHTML = '<div class="empty-state"><h3>暂无数据</h3><p>' + (isMine ? '你还没有报名任何项目。' : '当前暂无可展示项目。') + '</p></div>';
            return;
        }

        mainView.innerHTML = ''
            + '<table class="data-table">'
            + '  <thead><tr><th>项目名称</th><th>项目分类</th><th>比赛时间</th><th>比赛地点</th><th>报名情况</th><th>项目说明</th><th>操作</th></tr></thead>'
            + '  <tbody>'
            + pageItems.map(function (item) {
                var buttonHtml = isMine
                    ? '<button class="action-btn cancel-btn small-btn" data-id="' + item.id + '">取消报名</button>'
                    : '<button class="action-btn register-btn small-btn' + (item.registered ? ' disabled-btn' : '') + '" data-id="' + item.id + '"' + (item.registered ? ' disabled' : '') + '>' + (item.registered ? '已报名' : '报名') + '</button>';
                return '<tr>'
                    + '<td>' + escapeHtml(item.eventName) + '</td>'
                    + '<td>' + escapeHtml(item.eventCategory) + '</td>'
                    + '<td>' + escapeHtml(item.eventTime) + '</td>'
                    + '<td>' + escapeHtml(item.location) + '</td>'
                    + '<td>' + escapeHtml((item.registeredCount || 0) + '/' + (item.quota || 0)) + '</td>'
                    + '<td>' + escapeHtml(item.description) + '</td>'
                    + '<td class="actions-cell">' + buttonHtml + '</td>'
                    + '</tr>';
            }).join('')
            + '  </tbody>'
            + '</table>'
            + renderEventPagination(totalPages);

        bindEventTableActions();
    }

    function renderEventPagination(totalPages) {
        var html = '<div class="pagination">';
        html += '<button class="page-btn" ' + (state.eventPage <= 1 ? 'disabled' : '') + ' data-type="event" data-page="' + (state.eventPage - 1) + '">上一页</button>';
        var maxShow = 5;
        var startPage = Math.max(1, state.eventPage - Math.floor(maxShow / 2));
        var endPage = Math.min(totalPages, startPage + maxShow - 1);
        if (endPage - startPage < maxShow - 1) {
            startPage = Math.max(1, endPage - maxShow + 1);
        }
        for (var i = startPage; i <= endPage; i++) {
            html += '<button class="page-btn ' + (i === state.eventPage ? 'active' : '') + '" data-type="event" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button class="page-btn" ' + (state.eventPage >= totalPages ? 'disabled' : '') + ' data-type="event" data-page="' + (state.eventPage + 1) + '">下一页</button>';
        html += '</div>';
        html += '<p class="page-info">共 ' + state.eventTotal + ' 条记录，第 ' + state.eventPage + ' / ' + totalPages + ' 页</p>';
        return html;
    }

    function bindEventTableActions() {
        Array.prototype.slice.call(document.querySelectorAll('.register-btn:not([disabled])')).forEach(function (button) {
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

        bindEventPaginationActions();
    }

    function bindEventPaginationActions() {
        Array.prototype.slice.call(document.querySelectorAll('.page-btn[data-type="event"]:not([disabled])')).forEach(function (button) {
            button.addEventListener('click', function () {
                var page = Number(button.getAttribute('data-page'));
                if (page >= 1) {
                    state.eventPage = page;
                    renderCurrentView();
                }
            });
        });
    }

    // ===================== 管理员首页 =====================
    function renderAdminHome() {
        var totalUsers = state.allAdminUsers.length;
        var totalRegistrations = state.adminRegistrations.length;
        var totalEvents = state.adminEvents.length;
        var activeUsers = state.allAdminUsers.filter(function (item) {
            return item.status !== 'DISABLED';
        }).length;
        var disabledUsers = totalUsers - activeUsers;
        var avgFillRate = totalEvents
            ? Math.round(state.adminEvents.reduce(function (sum, item) {
                var quota = Number(item.quota || 0);
                var registered = Number(item.registeredCount || 0);
                return sum + (quota > 0 ? Math.min(registered / quota, 1) : 0);
            }, 0) / totalEvents * 100)
            : 0;
        var onlineUsers = Number((state.dashboardStats && state.dashboardStats.onlineUsers) || 0);
        var collegeStats = buildCountStats(state.adminRegistrations, function (item) {
            return item.college;
        });
        var categoryStats = buildCountStats(state.adminEvents, function (item) {
            return item.eventCategory;
        });
        var compactCategoryStats = compressStats(categoryStats, 4, '其他分类');
        var statusStats = [
            { label: '正常用户', count: activeUsers, color: '#0f766e' },
            { label: '禁用用户', count: Math.max(disabledUsers, 0), color: '#f97316' }
        ].filter(function (item) {
            return item.count > 0;
        });
        var latestRegistrations = state.adminRegistrations
            .slice()
            .sort(function (a, b) {
                return parseDateValue(b.createdAt) - parseDateValue(a.createdAt);
            })
            .slice(0, 4);
        var upcomingEvents = state.adminEvents
            .slice()
            .sort(function (a, b) {
                return parseDateValue(a.eventTime) - parseDateValue(b.eventTime);
            })
            .filter(function (item) {
                return parseDateValue(item.eventTime) > 0;
            })
            .slice(0, 4);
        var hotEvents = state.adminEvents
            .slice()
            .sort(function (a, b) {
                return Number(b.registeredCount || 0) - Number(a.registeredCount || 0);
            })
            .slice(0, 4);

        mainView.innerHTML = ''
            + '<div class="dashboard-shell">'
            + '  <section class="dashboard-top">'
            + '    <article class="dashboard-hero-card">'
            + '      <div class="dashboard-hero-copy">'
            + '        <p class="dashboard-kicker">Sports Meet Admin</p>'
            + '        <h3>运动会管理仪表盘</h3>'
            + '        <p class="info-meta">查看系统运行概况、项目热度和最新报名动态。</p>'
            + '        <div class="dashboard-actions">'
            + '          <button type="button" class="primary-btn dashboard-link" data-view="user-list">用户列表</button>'
            + '          <button type="button" class="ghost-btn dashboard-link" data-view="event-list">项目列表</button>'
            + '          <button type="button" class="ghost-btn dashboard-link" data-view="athlete-manage">报名名单</button>'
            + '        </div>'
            + '      </div>'
            + renderDonutPanel('用户状态分布', totalUsers, statusStats, '账号状态')
            + '    </article>'
            + '    <article class="dashboard-hero-card compact">'
            + renderCategoryOverviewPanel('项目分类概览', compactCategoryStats)
            + '    </article>'
            + '  </section>'
            + '  <section class="dashboard-metrics">'
            + dashboardMetricCard('实时在线', onlineUsers, onlineUsers > 0 ? '当前会话在线用户数' : '当前暂无在线用户')
            + dashboardMetricCard('用户总数', totalUsers, activeUsers + ' 正常 / ' + disabledUsers + ' 禁用')
            + dashboardMetricCard('报名记录', totalRegistrations, totalEvents ? '覆盖 ' + totalEvents + ' 个比赛项目' : '暂无比赛项目')
            + dashboardMetricCard('项目总数', totalEvents, categoryStats.length + ' 个项目分类')
            + dashboardMetricCard('平均满额率', avgFillRate + '%', '便于掌握项目热度与容量')
            + '  </section>'
            + '  <section class="dashboard-bottom">'
            + '    <div class="dashboard-panel">'
            + '      <div class="section-head"><div><h3>热门项目排行</h3><p class="info-meta">按报名人数排序，突出最受关注项目。</p></div></div>'
            + renderCompactEventRanking(hotEvents, '当前没有项目数据')
            + '    </div>'
            + '    <div class="dashboard-panel">'
            + '      <div class="section-head"><div><h3>最新动态</h3><p class="info-meta">把报名时间和即将开始的项目压缩展示。</p></div></div>'
            + renderCompactFeed(latestRegistrations, upcomingEvents)
            + '    </div>'
            + '  </section>'
            + '</div>';

        bindDashboardActions();
    }

    function dashboardMetricCard(label, value, hint) {
        return ''
            + '<article class="metric-card">'
            + '  <span class="metric-label">' + escapeHtml(label) + '</span>'
            + '  <strong class="metric-value">' + escapeHtml(value) + '</strong>'
            + '  <p class="metric-hint">' + escapeHtml(hint) + '</p>'
            + '</article>';
    }

    function dashboardStatRow(label, value) {
        return ''
            + '<div class="dashboard-stat-row">'
            + '  <span>' + escapeHtml(label) + '</span>'
            + '  <strong>' + escapeHtml(value) + '</strong>'
            + '</div>';
    }

    function renderDonutPanel(title, total, items, centerLabel) {
        return ''
            + '<div class="donut-panel">'
            + '  <div class="section-head"><div><h3>' + escapeHtml(title) + '</h3><p class="info-meta">当前数据分布概览。</p></div></div>'
            + renderDonutChart(items, total, centerLabel)
            + '</div>';
    }

    function renderCategoryOverviewPanel(title, items) {
        return ''
            + '<div class="donut-panel">'
            + '  <div class="section-head"><div><h3>' + escapeHtml(title) + '</h3><p class="info-meta">按项目分类查看当前数量分布。</p></div></div>'
            + renderCategoryOverview(items)
            + '</div>';
    }

    function buildCountStats(list, getter) {
        var map = {};
        list.forEach(function (item) {
            var key = String(getter(item) || '').trim();
            if (!key) {
                key = '未分类';
            }
            map[key] = (map[key] || 0) + 1;
        });
        return Object.keys(map).map(function (key) {
            return { label: key, count: map[key] };
        }).sort(function (a, b) {
            return b.count - a.count;
        });
    }

    function compressStats(items, maxItems, otherLabel) {
        if (!items.length || items.length <= maxItems) {
            return items;
        }

        var kept = items.slice(0, maxItems - 1);
        var rest = items.slice(maxItems - 1);
        var restCount = rest.reduce(function (sum, item) {
            return sum + Number(item.count || 0);
        }, 0);

        kept.push({
            label: otherLabel || '其他',
            count: restCount,
            color: '#94a3b8'
        });

        return kept;
    }

    function parseDateValue(value) {
        var text = String(value || '').trim();
        if (!text) {
            return 0;
        }
        var normalized = text.replace(/-/g, '/');
        var time = new Date(normalized).getTime();
        return isNaN(time) ? 0 : time;
    }

    function renderMiniBars(items, emptyText) {
        if (!items.length) {
            return '<div class="dashboard-empty">' + escapeHtml(emptyText) + '</div>';
        }
        var max = items[0].count || 1;
        return '<div class="mini-bars">'
            + items.map(function (item) {
                var width = Math.max(14, Math.round((item.count / max) * 100));
                return ''
                    + '<div class="mini-bar-row">'
                    + '  <div class="mini-bar-text"><span>' + escapeHtml(item.label) + '</span><strong>' + escapeHtml(item.count) + '</strong></div>'
                    + '  <div class="mini-bar-track"><span style="width:' + width + '%"></span></div>'
                    + '</div>';
            }).join('')
            + '</div>';
    }

    function renderRegistrationTimeline(list) {
        if (!list.length) {
            return '<div class="dashboard-empty">当前还没有报名记录</div>';
        }
        return '<div class="timeline-list">'
            + list.map(function (item) {
                return ''
                    + '<article class="timeline-item">'
                    + '  <div class="timeline-dot"></div>'
                    + '  <div class="timeline-content">'
                    + '    <strong>' + escapeHtml(item.studentName) + ' 报名了 ' + escapeHtml(item.eventName) + '</strong>'
                    + '    <p>' + escapeHtml((item.college || '未填写学院') + ' · ' + (item.eventCategory || '未分类')) + '</p>'
                    + '    <span>' + escapeHtml(item.createdAt || '时间未知') + '</span>'
                    + '  </div>'
                    + '</article>';
            }).join('')
            + '</div>';
    }

    function renderDonutChart(items, total, centerLabel) {
        if (!items.length || total <= 0) {
            return '<div class="dashboard-empty">当前没有可统计的数据</div>';
        }
        var palette = ['#0f766e', '#2563eb', '#f97316', '#e11d48', '#14b8a6', '#8b5cf6'];
        var current = 0;
        var gradientParts = [];
        var legendItems = [];

        items.forEach(function (item, index) {
            var count = Number(item.count || 0);
            if (count <= 0) {
                return;
            }
            var color = item.color || palette[index % palette.length];
            var percent = total > 0 ? (count / total) * 100 : 0;
            var start = current;
            var end = current + percent;
            gradientParts.push(color + ' ' + start + '% ' + end + '%');
            current = end;
            legendItems.push({
                label: item.label,
                count: count,
                color: color,
                percent: Math.round(percent)
            });
        });

        return ''
            + '<div class="donut-layout">'
            + '  <div class="donut-chart" style="background: conic-gradient(' + gradientParts.join(', ') + ');">'
            + '    <div class="donut-hole">'
            + '      <strong>' + escapeHtml(total) + '</strong>'
            + '      <span>' + escapeHtml(centerLabel || '总计') + '</span>'
            + '    </div>'
            + '  </div>'
            + '  <div class="donut-legend">'
            + legendItems.map(function (item) {
                return ''
                    + '<div class="donut-legend-item">'
                    + '  <span class="donut-dot" style="background:' + item.color + '"></span>'
                    + '  <div class="donut-legend-text"><strong>' + escapeHtml(item.label) + '</strong><p>' + escapeHtml(item.count + ' · ' + item.percent + '%') + '</p></div>'
                    + '</div>';
            }).join('')
            + '  </div>'
            + '</div>';
    }

    function renderCategoryOverview(items) {
        if (!items.length) {
            return '<div class="dashboard-empty">当前没有可统计的数据</div>';
        }
        var max = Math.max.apply(null, items.map(function (item) {
            return Number(item.count || 0);
        }));
        return '<div class="category-overview-list">'
            + items.map(function (item, index) {
                var count = Number(item.count || 0);
                var width = max > 0 ? Math.max(12, Math.round((count / max) * 100)) : 0;
                return ''
                    + '<div class="category-overview-item">'
                    + '  <div class="category-overview-head">'
                    + '    <strong>' + escapeHtml(item.label) + '</strong>'
                    + '    <span>' + escapeHtml(count + ' 个项目') + '</span>'
                    + '  </div>'
                    + '  <div class="category-overview-track"><span class="category-overview-fill fill-' + (index % 5) + '" style="width:' + width + '%"></span></div>'
                    + '  </div>';
            }).join('')
            + '</div>';
    }

    function renderEventRanking(list, emptyText) {
        if (!list.length) {
            return '<div class="dashboard-empty">' + escapeHtml(emptyText) + '</div>';
        }
        var max = Number(list[0].registeredCount || 0) || 1;
        return '<div class="ranking-list">'
            + list.map(function (item, index) {
                var registered = Number(item.registeredCount || 0);
                var quota = Number(item.quota || 0);
                var width = Math.max(10, Math.round((registered / max) * 100));
                return ''
                    + '<div class="ranking-item">'
                    + '  <div class="ranking-head"><span class="ranking-index">TOP ' + (index + 1) + '</span><strong>' + escapeHtml(item.eventName) + '</strong></div>'
                    + '  <p>' + escapeHtml((item.eventCategory || '未分类') + ' · ' + (item.location || '地点待定')) + '</p>'
                    + '  <div class="mini-bar-track"><span style="width:' + width + '%"></span></div>'
                    + '  <span class="ranking-meta">' + escapeHtml(registered + ' / ' + quota + ' 人') + '</span>'
                    + '</div>';
            }).join('')
            + '</div>';
    }

    function renderCompactEventRanking(list, emptyText) {
        if (!list.length) {
            return '<div class="dashboard-empty">' + escapeHtml(emptyText) + '</div>';
        }
        return '<div class="compact-ranking-list">'
            + list.map(function (item, index) {
                var registered = Number(item.registeredCount || 0);
                var quota = Number(item.quota || 0);
                return ''
                    + '<div class="compact-ranking-item">'
                    + '  <span class="compact-rank-no">' + (index + 1) + '</span>'
                    + '  <div class="compact-ranking-main">'
                    + '    <strong>' + escapeHtml(item.eventName) + '</strong>'
                    + '    <p>' + escapeHtml((item.eventCategory || '未分类') + ' · ' + registered + '/' + quota + ' 人') + '</p>'
                    + '  </div>'
                    + '  <span class="compact-rank-badge">' + escapeHtml(item.location || '地点待定') + '</span>'
                    + '</div>';
            }).join('')
            + '</div>';
    }

    function renderUpcomingEvents(list) {
        if (!list.length) {
            return '<div class="dashboard-empty">当前没有可展示的比赛时间数据</div>';
        }
        return '<div class="upcoming-list">'
            + list.map(function (item) {
                return ''
                    + '<article class="upcoming-item">'
                    + '  <strong>' + escapeHtml(item.eventName) + '</strong>'
                    + '  <p>' + escapeHtml(item.eventCategory || '未分类') + '</p>'
                    + '  <span>' + escapeHtml((item.eventTime || '时间待定') + ' · ' + (item.location || '地点待定')) + '</span>'
                    + '</article>';
            }).join('')
            + '</div>';
    }

    function renderCompactFeed(registrations, events) {
        var feedItems = [];

        registrations.forEach(function (item) {
            feedItems.push({
                time: item.createdAt || '',
                title: (item.studentName || '有用户') + ' 报名了 ' + (item.eventName || '项目'),
                desc: (item.college || '未填写学院') + ' · ' + (item.eventCategory || '未分类'),
                type: '报名'
            });
        });

        events.forEach(function (item) {
            feedItems.push({
                time: item.eventTime || '',
                title: (item.eventName || '项目') + ' 即将开始',
                desc: (item.location || '地点待定') + ' · ' + (item.eventCategory || '未分类'),
                type: '赛程'
            });
        });

        feedItems = feedItems
            .sort(function (a, b) {
                return parseDateValue(b.time) - parseDateValue(a.time);
            })
            .slice(0, 6);

        if (!feedItems.length) {
            return '<div class="dashboard-empty">当前没有最新动态</div>';
        }

        return '<div class="compact-feed-list">'
            + feedItems.map(function (item) {
                return ''
                    + '<article class="compact-feed-item">'
                    + '  <span class="compact-feed-tag">' + escapeHtml(item.type) + '</span>'
                    + '  <div class="compact-feed-body">'
                    + '    <strong>' + escapeHtml(item.title) + '</strong>'
                    + '    <p>' + escapeHtml(item.desc) + '</p>'
                    + '  </div>'
                    + '  <span class="compact-feed-time">' + escapeHtml(item.time || '时间待定') + '</span>'
                    + '</article>';
            }).join('')
            + '</div>';
    }

    function bindDashboardActions() {
        Array.prototype.slice.call(document.querySelectorAll('.dashboard-link')).forEach(function (button) {
            button.addEventListener('click', function () {
                switchView(button.getAttribute('data-view'));
            });
        });
    }

    // ===================== 用户列表 =====================
    function getPagedUsers() {
        var filtered = state.allAdminUsers;
        if (state.userKeyword) {
            var kw = state.userKeyword.toLowerCase();
            filtered = state.allAdminUsers.filter(function (u) {
                return (u.name && u.name.toLowerCase().indexOf(kw) >= 0)
                    || (u.username && u.username.toLowerCase().indexOf(kw) >= 0)
                    || (u.studentNo && u.studentNo.toLowerCase().indexOf(kw) >= 0)
                    || (u.college && u.college.toLowerCase().indexOf(kw) >= 0)
                    || (u.idCard && u.idCard.toLowerCase().indexOf(kw) >= 0);
            });
        }
        state.userTotal = filtered.length;
        var start = (state.userPage - 1) * state.userPageSize;
        return filtered.slice(start, start + state.userPageSize);
    }

    function renderPagination() {
        var totalPages = Math.ceil(state.userTotal / state.userPageSize) || 1;
        var html = '<div class="pagination">';
        html += '<button class="page-btn" ' + (state.userPage <= 1 ? 'disabled' : '') + ' data-page="' + (state.userPage - 1) + '">上一页</button>';

        var maxShow = 7;
        var startPage = Math.max(1, state.userPage - Math.floor(maxShow / 2));
        var endPage = Math.min(totalPages, startPage + maxShow - 1);
        if (endPage - startPage < maxShow - 1) {
            startPage = Math.max(1, endPage - maxShow + 1);
        }

        for (var i = startPage; i <= endPage; i++) {
            html += '<button class="page-btn ' + (i === state.userPage ? 'active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }

        html += '<button class="page-btn" ' + (state.userPage >= totalPages ? 'disabled' : '') + ' data-page="' + (state.userPage + 1) + '">下一页</button>';
        html += '</div>';
        html += '<p class="page-info">共 ' + state.userTotal + ' 条记录，第 ' + state.userPage + ' / ' + totalPages + ' 页</p>';
        return html;
    }

    function renderUserList() {
        var pageUsers = getPagedUsers();

        mainView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>用户列表</h3><p class="info-meta">支持搜索、分页，以及重置密码、禁用/解除禁用和删除操作。</p></div></div>'
            + '  <div class="toolbar-row">'
            + '    <input type="text" id="userSearchInput" class="search-input" placeholder="搜索姓名、账号、学号、学院..." value="' + escapeHtml(state.userKeyword) + '">'
            + '    <button type="button" class="ghost-btn small" id="userSearchBtn">搜索</button>'
            + '    <button type="button" class="ghost-btn small" id="clearSearchBtn">清空</button>'
            + '    <span style="margin-left:auto;">'
            + '      <button type="button" class="primary-btn small" id="exportUsersBtn">📥 导出用户</button>'
            + '    </span>'
            + '  </div>'
            + '</div>'
            + '<div class="section-block table-wrapper">'
            + (pageUsers.length ? ''
                + '<table class="data-table">'
                + '  <thead><tr><th>姓名</th><th>账号</th><th>身份证号</th><th>电话</th><th>性别</th><th>学院</th><th>班级</th><th>学号</th><th>类别</th><th>角色</th><th>状态</th><th>操作</th></tr></thead>'
                + '  <tbody>'
                + pageUsers.map(function (item) {
                    var isAdmin = item.role === 'ADMIN';
                    var statusText = item.status === 'DISABLED' ? '已禁用' : '正常';
                    var statusClass = item.status === 'DISABLED' ? 'status-disabled' : 'status-active';

                    var actionBtns = '';
                    actionBtns += '<button class="action-btn small-btn edit-user-btn" data-id="' + item.id + '">编辑</button>';
                    actionBtns += '<button class="action-btn small-btn reset-password-btn" data-id="' + item.id + '">重置密码</button>';
                    if (!isAdmin) {
                        if (item.status === 'DISABLED') {
                            actionBtns += '<button class="action-btn small-btn enable-user-btn" data-id="' + item.id + '">解除禁用</button>';
                        } else {
                            actionBtns += '<button class="action-btn small-btn disable-user-btn" data-id="' + item.id + '">禁用</button>';
                        }
                        actionBtns += '<button class="action-btn small-btn danger-btn delete-user-btn" data-id="' + item.id + '">删除</button>';
                    }

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
                        + '<td><span class="' + statusClass + '">' + escapeHtml(statusText) + '</span></td>'
                        + '<td class="actions-cell">' + actionBtns + '</td>'
                        + '</tr>';
                }).join('')
                + '  </tbody>'
                + '</table>'
                + renderPagination()
                : '<div class="empty-state"><h3>暂无用户</h3><p>当前系统中还没有用户数据，或搜索结果为空。</p></div>')
            + '</div>';

        bindUserListActions();
        bindPaginationActions();
    }

    function bindUserListActions() {
        var searchInput = document.getElementById('userSearchInput');
        var searchBtn = document.getElementById('userSearchBtn');
        var clearSearchBtn = document.getElementById('clearSearchBtn');
        var exportBtn = document.getElementById('exportUsersBtn');

        if (searchBtn) {
            searchBtn.addEventListener('click', function () {
                state.userKeyword = String(searchInput ? searchInput.value : '').trim();
                state.userPage = 1;
                renderCurrentView();
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', function () {
                state.userKeyword = '';
                state.userPage = 1;
                if (searchInput) { searchInput.value = ''; }
                renderCurrentView();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    state.userKeyword = String(searchInput.value).trim();
                    state.userPage = 1;
                    renderCurrentView();
                }
            });
        }

        // 导出用户 — 前端生成 CSV 下载
        if (exportBtn) {
            exportBtn.addEventListener('click', function () {
                var exportData = state.userKeyword ? getPagedUsers() : state.allAdminUsers;
                if (!exportData.length) {
                    window.alert('没有可导出的用户数据');
                    return;
                }
                var headers = ['姓名', '账号', '身份证号', '电话', '性别', '学院', '班级', '学号', '类别', '角色', '状态'];
                var csvContent = '\uFEFF' + headers.join(',') + '\n';
                exportData.forEach(function (u) {
                    var row = [
                        u.name || '',
                        u.username || '',
                        u.idCard || '',
                        u.phone || '',
                        u.gender || '',
                        u.college || '',
                        u.className || '',
                        u.studentNo || '',
                        u.category || '',
                        u.role || '',
                        u.status || ''
                    ];
                    csvContent += row.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',') + '\n';
                });
                var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = '用户列表.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            });
        }

        bindAdminUserActions();
    }

    // ===================== 新增用户（独立页面） =====================
    function renderUserAdd() {
        var editingUser = null;
        if (state.editingUserId) {
            editingUser = state.allAdminUsers.find(function (u) { return u.id === state.editingUserId; }) || null;
        }
        var isEditing = !!editingUser;

        mainView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>' + (isEditing ? '编辑用户信息' : '新增用户') + '</h3><p class="info-meta">' + (isEditing ? '修改现有用户的基本信息。' : '管理员可在此新增系统用户。') + '</p></div></div>'
            + '  <form id="userForm" class="form-grid two-columns">'
            + fieldInput('身份证号', 'idCard', isEditing ? editingUser.idCard : '', '请输入身份证号')
            + fieldInput('邮箱', 'email', isEditing ? editingUser.username : '', '请输入邮箱地址')
            + (!isEditing ? fieldInput('密码', 'password', '', '请输入密码（不少于6位）') + fieldInput('确认密码', 'confirmPassword', '', '请再次输入密码') : '')
            + fieldInput('姓名', 'name', isEditing ? editingUser.name : '', '请输入姓名')
            + fieldInput('联系电话', 'phone', isEditing ? editingUser.phone : '', '请输入电话')
            + fieldSelect('性别', 'gender', isEditing ? editingUser.gender : '', genderOptions, '请选择性别')
            + fieldSelect('学院', 'college', isEditing ? editingUser.college : '', collegeOptions, '请选择学院')
            + fieldInput('班级', 'className', isEditing ? editingUser.className : '', '请输入班级')
            + fieldInput('学号', 'studentNo', isEditing ? editingUser.studentNo : '', '请输入学号')
            + fieldSelect('类别', 'category', isEditing ? editingUser.category : '', categoryOptions, '请选择类别')
            + '    <div class="form-actions full-row">'
            + '      <button type="submit" class="primary-btn">' + (isEditing ? '保存修改' : '新增用户') + '</button>'
            + '      <button type="button" class="ghost-btn" id="clearUserForm">' + (isEditing ? '取消编辑' : '清空表单') + '</button>'
            + '    </div>'
            + '    <p id="userFormMessage" class="form-message full-row"></p>'
            + '  </form>'
            + '</div>'
            + (!isEditing ? ''
            // 批量上传区域（仅新增时显示）
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>批量上传用户</h3><p class="info-meta">通过 Excel 或 CSV 文件批量导入用户信息。</p></div></div>'
            + '  <div class="upload-area">'
            + '    <div class="upload-hint">'
            + '      <p><strong>支持格式：</strong>.csv</p>'
            + '      <p><strong>📝 文件要求（列顺序固定）：</strong></p>'
            + '      <p>身份证号 | 邮箱 | 密码 | 姓名 | 电话 | 性别 | 学院 | 班级 | 学号 | 类别</p>'
            + '      <p>第一行为表头，数据从第二行开始。性别：男/女，类别：青年组/老年组。</p>'
            + '      <p><strong>注意：</strong>当前不支持直接上传 Excel，也不要直接把用户导出文件回传导入。</p>'
            + '    </div>'
            + '    <div class="upload-actions">'
            + '      <button type="button" class="primary-btn" id="uploadUsersBtn">选择 CSV 并上传</button>'
            + '      <input type="file" id="uploadFileInput" accept=".csv" style="display:none;">'
            + '      <span id="uploadFileName" class="upload-file-name"></span>'
            + '    </div>'
            + '    <p id="uploadMessage" class="form-message"></p>'
            + '  </div>'
            + '</div>' : '');

        bindUserAddActions();
    }

    function bindUserAddActions() {
        var form = document.getElementById('userForm');
        var clearBtn = document.getElementById('clearUserForm');
        var messageEl = document.getElementById('userFormMessage');
        var uploadBtn = document.getElementById('uploadUsersBtn');
        var fileInput = document.getElementById('uploadFileInput');
        var fileNameEl = document.getElementById('uploadFileName');
        var uploadMsgEl = document.getElementById('uploadMessage');
        var isEditing = !!state.editingUserId;

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var formData = new FormData(form);

                var payload = {
                    idCard: String(formData.get('idCard') || '').trim(),
                    email: String(formData.get('email') || '').trim(),
                    name: String(formData.get('name') || '').trim(),
                    phone: String(formData.get('phone') || '').trim(),
                    gender: String(formData.get('gender') || '').trim(),
                    college: String(formData.get('college') || '').trim(),
                    className: String(formData.get('className') || '').trim(),
                    studentNo: String(formData.get('studentNo') || '').trim(),
                    category: String(formData.get('category') || '').trim()
                };

                if (!isEditing) {
                    var pwd = String(formData.get('password') || '');
                    var confirmPwd = String(formData.get('confirmPassword') || '');
                    if (pwd !== confirmPwd) {
                        appUtils.showMessage(messageEl, '两次输入的密码不一致', false);
                        return;
                    }
                    if (pwd.length < 6) {
                        appUtils.showMessage(messageEl, '密码长度不能少于6位', false);
                        return;
                    }
                    payload.password = pwd;
                }

                appUtils.ajax({
                    method: isEditing ? 'PUT' : 'POST',
                    url: isEditing ? '/api/admin/users/' + state.editingUserId : '/api/admin/users',
                    data: payload,
                    success: function (response) {
                        if (!response.success) {
                            appUtils.showMessage(messageEl, response.message || '保存失败', false);
                            return;
                        }
                        appUtils.showMessage(messageEl, isEditing ? '用户信息已更新' : '用户新增成功', true);
                        state.editingUserId = null;
                        switchView('user-list');
                        loadAllAdminUsers();
                    },
                    error: function (xhr, response) {
                        appUtils.showMessage(messageEl, (response && response.message) || '保存失败', false);
                    }
                });
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                state.editingUserId = null;
                switchView('user-list');
            });
        }

        var isEditingLocal = !!state.editingUserId;
        if (!isEditingLocal && uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', function () {
                fileInput.click();
            });
            fileInput.addEventListener('change', function () {
                var file = fileInput.files[0];
                if (!file) return;
                if (fileNameEl) {
                    fileNameEl.textContent = '已选择：' + file.name;
                }
                var formDataUpload = new FormData();
                formDataUpload.append('file', file);
                appUtils.ajax({
                    method: 'POST',
                    url: '/api/admin/users/import',
                    data: formDataUpload,
                    success: function (response) {
                        if (!response.success) {
                            appUtils.showMessage(uploadMsgEl, response.message || '上传失败', false);
                            return;
                        }
                        appUtils.showMessage(uploadMsgEl, response.message || '用户信息上传成功', true);
                        state.userKeyword = '';
                        state.userPage = 1;
                        loadAllAdminUsers();
                        setTimeout(function () {
                            switchView('user-list');
                        }, 800);
                    },
                    error: function (xhr, response) {
                        appUtils.showMessage(uploadMsgEl, (response && response.message) || '上传失败', false);
                    }
                });
                fileInput.value = '';
                if (fileNameEl) fileNameEl.textContent = '';
            });
        }

    }

    function bindPaginationActions() {
        Array.prototype.slice.call(document.querySelectorAll('.page-btn:not([disabled])')).forEach(function (button) {
            button.addEventListener('click', function () {
                var page = Number(button.getAttribute('data-page'));
                if (page >= 1) {
                    state.userPage = page;
                    renderCurrentView();
                }
            });
        });
    }

    function bindAdminUserActions() {
        Array.prototype.slice.call(document.querySelectorAll('.edit-user-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                state.editingUserId = Number(button.getAttribute('data-id'));
                switchView('user-add');
            });
        });
        bindUserAction('.reset-password-btn', 'POST', '/api/admin/users/{id}/reset-password', '重置密码成功');
        bindUserAction('.disable-user-btn', 'POST', '/api/admin/users/{id}/disable', '账号已禁用');
        bindUserAction('.enable-user-btn', 'POST', '/api/admin/users/{id}/enable', '账号已解除禁用');
        bindUserAction('.delete-user-btn', 'DELETE', '/api/admin/users/{id}', '用户已删除');
    }

    function bindUserAction(selector, method, urlTemplate, successText) {
        Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function (button) {
            button.addEventListener('click', function () {
                if (!confirm('确定要执行此操作吗？')) return;
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
                        loadAllAdminUsers();
                    },
                    error: function (xhr, response) {
                        window.alert((response && response.message) || '操作失败');
                    }
                });
            });
        });
    }

    // ===================== 参赛运动员管理 =====================
    function renderAthleteManage() {
        if (!state.adminRegistrations.length) {
            mainView.innerHTML = '<div class="empty-state"><h3>暂无报名记录</h3><p>当前还没有参赛人员数据。</p></div>';
            return;
        }

        state.athleteTotal = state.adminRegistrations.length;
        var totalPages = Math.ceil(state.athleteTotal / state.athletePageSize) || 1;
        if (state.athletePage > totalPages) state.athletePage = totalPages;
        var start = (state.athletePage - 1) * state.athletePageSize;
        var pageItems = state.adminRegistrations.slice(start, start + state.athletePageSize);
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
            + summaryCard('系统用户数', state.allAdminUsers.length)
            + '  </div>'
            + '</div>'
            + '<div class="section-block table-wrapper">'
            + '  <div class="section-head"><div><h3>参赛名单</h3><p class="info-meta">显示所有已报名人员和项目详情。</p></div></div>'
            + '  <div class="toolbar-row">'
            + '    <span style="margin-left:auto;">'
            + '      <button type="button" class="primary-btn small" id="exportAthleteBtn">📥 导出参赛名单</button>'
            + '    </span>'
            + '  </div>'
            + '  <table class="data-table">'
            + '    <thead><tr><th>姓名</th><th>账号</th><th>电话</th><th>学院</th><th>类别</th><th>项目名称</th><th>项目分类</th><th>时间地点</th><th>状态</th><th>报名时间</th></tr></thead>'
            + '    <tbody>'
            + pageItems.map(function (item) {
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
            + renderAthletePagination(totalPages)
            + '</div>';

        bindAthleteActions();
    }

    function renderAthletePagination(totalPages) {
        var html = '<div class="pagination">';
        html += '<button class="page-btn" ' + (state.athletePage <= 1 ? 'disabled' : '') + ' data-type="athlete" data-page="' + (state.athletePage - 1) + '">上一页</button>';
        var maxShow = 5;
        var startPage = Math.max(1, state.athletePage - Math.floor(maxShow / 2));
        var endPage = Math.min(totalPages, startPage + maxShow - 1);
        if (endPage - startPage < maxShow - 1) {
            startPage = Math.max(1, endPage - maxShow + 1);
        }
        for (var i = startPage; i <= endPage; i++) {
            html += '<button class="page-btn ' + (i === state.athletePage ? 'active' : '') + '" data-type="athlete" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button class="page-btn" ' + (state.athletePage >= totalPages ? 'disabled' : '') + ' data-type="athlete" data-page="' + (state.athletePage + 1) + '">下一页</button>';
        html += '</div>';
        html += '<p class="page-info">共 ' + state.athleteTotal + ' 条记录，第 ' + state.athletePage + ' / ' + totalPages + ' 页</p>';
        return html;
    }

    function bindAthleteActions() {
        var exportBtn = document.getElementById('exportAthleteBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', function () {
                var exportData = state.adminRegistrations;
                if (!exportData.length) {
                    window.alert('没有可导出的参赛名单数据');
                    return;
                }
                var headers = ['姓名', '账号', '电话', '学院', '类别', '项目名称', '项目分类', '比赛时间', '比赛地点', '状态', '报名时间'];
                var csvContent = '\uFEFF' + headers.join(',') + '\n';
                exportData.forEach(function (item) {
                    var row = [
                        item.studentName || '',
                        item.username || '',
                        item.phone || '',
                        item.college || '',
                        item.category || '',
                        item.eventName || '',
                        item.eventCategory || '',
                        item.eventTime || '',
                        item.location || '',
                        item.status || '',
                        item.createdAt || ''
                    ];
                    csvContent += row.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',') + '\n';
                });
                var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = '参赛名单.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            });
        }

        bindAthletePaginationActions();
    }

    function bindAthletePaginationActions() {
        Array.prototype.slice.call(document.querySelectorAll('.page-btn[data-type="athlete"]:not([disabled])')).forEach(function (button) {
            button.addEventListener('click', function () {
                var page = Number(button.getAttribute('data-page'));
                if (page >= 1) {
                    state.athletePage = page;
                    renderCurrentView();
                }
            });
        });
    }

    // ===================== 项目列表 =====================
    function renderEventList() {
        state.adminEventTotal = state.adminEvents.length;
        var totalPages = Math.ceil(state.adminEventTotal / state.adminEventPageSize) || 1;
        if (state.adminEventPage > totalPages) state.adminEventPage = totalPages;
        var start = (state.adminEventPage - 1) * state.adminEventPageSize;
        var pageItems = state.adminEvents.slice(start, start + state.adminEventPageSize);

        mainView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>项目列表</h3><p class="info-meta">查看、编辑和删除当前项目。</p></div></div>'
            + (state.adminEvents.length ? ''
                + '<table class="data-table">'
                + '  <thead><tr><th>项目名称</th><th>项目分类</th><th>比赛时间</th><th>比赛地点</th><th>人数上限</th><th>已报名</th><th>项目说明</th><th>操作</th></tr></thead>'
                + '  <tbody>'
                + pageItems.map(function (item) {
                    return '<tr>'
                        + '<td>' + escapeHtml(item.eventName) + '</td>'
                        + '<td>' + escapeHtml(item.eventCategory) + '</td>'
                        + '<td>' + escapeHtml(item.eventTime) + '</td>'
                        + '<td>' + escapeHtml(item.location) + '</td>'
                        + '<td>' + escapeHtml(item.quota) + '</td>'
                        + '<td>' + escapeHtml(item.registeredCount || 0) + '</td>'
                        + '<td>' + escapeHtml(item.description) + '</td>'
                        + '<td class="actions-cell">'
                        + '<button class="action-btn small-btn edit-event-btn" data-id="' + item.id + '">编辑</button>'
                        + '<button class="action-btn small-btn danger-btn delete-event-btn" data-id="' + item.id + '">删除</button>'
                        + '</td>'
                        + '</tr>';
                }).join('')
                + '  </tbody>'
                + '</table>'
                + renderAdminEventPagination(totalPages)
                : '<div class="empty-state"><h3>暂无项目</h3><p>请先到新增项目页面添加比赛项目。</p></div>')
            + '</div>';

        bindEventListActions();
    }

    function renderAdminEventPagination(totalPages) {
        var html = '<div class="pagination">';
        html += '<button class="page-btn" ' + (state.adminEventPage <= 1 ? 'disabled' : '') + ' data-type="adminEvent" data-page="' + (state.adminEventPage - 1) + '">上一页</button>';
        var maxShow = 5;
        var startPage = Math.max(1, state.adminEventPage - Math.floor(maxShow / 2));
        var endPage = Math.min(totalPages, startPage + maxShow - 1);
        if (endPage - startPage < maxShow - 1) {
            startPage = Math.max(1, endPage - maxShow + 1);
        }
        for (var i = startPage; i <= endPage; i++) {
            html += '<button class="page-btn ' + (i === state.adminEventPage ? 'active' : '') + '" data-type="adminEvent" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button class="page-btn" ' + (state.adminEventPage >= totalPages ? 'disabled' : '') + ' data-type="adminEvent" data-page="' + (state.adminEventPage + 1) + '">下一页</button>';
        html += '</div>';
        html += '<p class="page-info">共 ' + state.adminEventTotal + ' 条记录，第 ' + state.adminEventPage + ' / ' + totalPages + ' 页</p>';
        return html;
    }

    function bindEventListActions() {
        Array.prototype.slice.call(document.querySelectorAll('.edit-event-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                state.editingEventId = Number(button.getAttribute('data-id'));
                switchView('event-add');
            });
        });

        Array.prototype.slice.call(document.querySelectorAll('.delete-event-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                if (!confirm('确定要删除该项目吗？')) return;
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

        bindAdminEventPaginationActions();
    }

    function bindAdminEventPaginationActions() {
        Array.prototype.slice.call(document.querySelectorAll('.page-btn[data-type="adminEvent"]:not([disabled])')).forEach(function (button) {
            button.addEventListener('click', function () {
                var page = Number(button.getAttribute('data-page'));
                if (page >= 1) {
                    state.adminEventPage = page;
                    renderCurrentView();
                }
            });
        });
    }

    // ===================== 新增项目 =====================
    function renderEventAdd() {
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
            + '</div>';

        bindEventAddActions();
    }

    function bindEventAddActions() {
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
                        appUtils.showMessage(messageEl, '项目保存成功', true);
                        loadAdminData();
                        setTimeout(function () {
                            renderCurrentView();
                        }, 800);
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
    }

    // ===================== 占位页面 =====================
    function renderPlaceholder(title, desc) {
        mainView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>' + escapeHtml(title) + '</h3><p class="info-meta">' + escapeHtml(desc) + '</p></div></div>'
            + '  <div class="empty-state"><h3>功能持续完善中</h3><p>这个模块的详细功能可以继续在现有框架上补充。</p></div>'
            + '</div>';
    }

    // ===================== 视图路由 =====================
    function renderCurrentView() {
        var meta = getMeta(state.currentView);
        sectionTitle.textContent = meta.label;
        sectionDesc.textContent = meta.desc;
        renderTabs();

        if (state.currentView === 'profile-view') {
            renderProfileView();
            return;
        }
        if (state.currentView === 'profile-edit') {
            renderProfileEdit();
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
        if (state.currentView === 'user-list') {
            renderUserList();
            return;
        }
        if (state.currentView === 'user-add') {
            renderUserAdd();
            return;
        }
        if (state.currentView === 'event-list') {
            renderEventList();
            return;
        }
        if (state.currentView === 'event-add') {
            renderEventAdd();
            return;
        }
        if (state.currentView === 'athlete-manage') {
            renderAthleteManage();
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
        if (view === 'user-list') {
            state.userPage = 1;
        }
        renderSidebar();
        renderCurrentView();
    }

    // ===================== 数据加载 =====================
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
                    state.allAdminUsers = response.data || [];
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

        appUtils.ajax({
            method: 'GET',
            url: '/api/admin/dashboard/stats',
            success: function (response) {
                if (response.success && response.data) {
                    state.dashboardStats = response.data;
                    renderCurrentView();
                }
            }
        });
    }

    function loadAllAdminUsers() {
        if (!state.user || state.user.role !== 'ADMIN') {
            return;
        }
        appUtils.ajax({
            method: 'GET',
            url: '/api/admin/users',
            success: function (response) {
                if (response.success) {
                    state.allAdminUsers = response.data || [];
                    state.adminUsers = response.data || [];
                    renderCurrentView();
                }
            }
        });
    }

    // ===================== 辅助函数 =====================
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
                state.currentView = state.user.role === 'ADMIN' ? 'admin-home' : 'profile-view';
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
