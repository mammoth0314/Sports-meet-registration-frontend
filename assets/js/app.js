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

    var studentMenus = [
        { key: 'profile', label: '涓汉淇℃伅', desc: '鏌ョ湅骞剁淮鎶ゅ綋鍓嶇櫥褰曚汉鍛樼殑鍩虹璧勬枡銆? },
        { key: 'events', label: '杩愬姩浼氭姤鍚?, desc: '娴忚鎵€鏈夐」鐩苟瀹屾垚鎶ュ悕锛屼篃鍙互鏌ョ湅鑷繁鐨勬姤鍚嶄俊鎭€? }
    ];

    var adminMenus = [
        { key: 'admin-home', label: '杩愬姩浼氱鐞?, desc: '鏌ョ湅鍚庡彴棣栭〉鍜岀郴缁熸瑙堛€? },
        { key: 'team-info', label: '鍥綋淇℃伅绠＄悊', desc: '缁存姢鍙傝禌鍥綋涓庣粍缁囦俊鎭€? },
        { key: 'user-manage', label: '鐢ㄦ埛淇℃伅绠＄悊', desc: '鏌ョ湅銆佺淮鎶ょ敤鎴疯祫鏂欏苟鎵ц璐﹀彿绠＄悊鎿嶄綔銆? },
        { key: 'event-manage', label: '椤圭洰绠＄悊', desc: '缁存姢璧涗簨椤圭洰銆佸垎绫汇€佺粍鍒拰鎶ュ悕鍙傛暟銆? },
        { key: 'athlete-manage', label: '鍙傝禌杩愬姩鍛樼鐞?, desc: '鏌ョ湅鎵€鏈夊凡鎶ュ悕杩愬姩鍛樺拰鍙傝禌鍚嶅崟銆? },
        { key: 'score-manage', label: '鍙傝禌鎴愮哗绠＄悊', desc: '褰曞叆銆佹煡鐪嬪拰缁存姢姣旇禌鎴愮哗銆? },
        { key: 'record-manage', label: '椤圭洰璁板綍绠＄悊', desc: '绠＄悊椤圭洰璁板綍銆佺З搴忓唽鍜岃禌浜嬭褰曘€? },
        { key: 'system-manage', label: '绯荤粺绠＄悊', desc: '缁存姢绯荤粺鍩虹閰嶇疆鍜屽悗鍙拌繍琛屼俊鎭€? }
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

    function renderSidebar() {
        var menus = getMenus();
        sidebarNav.innerHTML = menus.map(function (item, index) {
            return '<button class="nav-item ' + (item.key === state.currentView ? 'active' : '') + '" data-view="' + item.key + '">' + item.label + '</button>';
        }).join('');

        Array.prototype.slice.call(sidebarNav.querySelectorAll('.nav-item')).forEach(function (button) {
            button.addEventListener('click', function () {
                switchView(button.getAttribute('data-view'));
            });
        });
    }

    function renderTabs() {
        var html = '';
        if (state.currentView === 'events') {
            html = ''
                + '<button class="tab-item ' + (state.currentTab === 'all' ? 'active' : '') + '" data-tab="all">鎶ュ悕</button>'
                + '<button class="tab-item ' + (state.currentTab === 'mine' ? 'active' : '') + '" data-tab="mine">鎶ュ悕淇℃伅</button>';
        }
        subTabs.innerHTML = html;
        subTabs.classList.toggle('hidden', !html);
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
            + '  <div class="section-head"><div><h3>鍩虹璧勬枡</h3><p class="info-meta">褰撳墠璐﹀彿鐨勪釜浜轰俊鎭涓嬨€?/p></div></div>'
            + '  <div class="profile-grid">'
            + '    <div class="info-card"><strong>韬唤璇佸彿</strong><p>' + escapeHtml(state.user.idCard) + '</p></div>'
            + '    <div class="info-card"><strong>鐧诲綍璐﹀彿</strong><p>' + escapeHtml(state.user.username) + '</p></div>'
            + '    <div class="info-card"><strong>濮撳悕</strong><p>' + escapeHtml(state.user.name) + '</p></div>'
            + '    <div class="info-card"><strong>鑱旂郴鐢佃瘽</strong><p>' + escapeHtml(state.user.phone) + '</p></div>'
            + '    <div class="info-card"><strong>鎬у埆</strong><p>' + escapeHtml(state.user.gender) + '</p></div>'
            + '    <div class="info-card"><strong>瀛﹂櫌</strong><p>' + escapeHtml(state.user.college) + '</p></div>'
            + '    <div class="info-card"><strong>鐝骇</strong><p>' + escapeHtml(state.user.className) + '</p></div>'
            + '    <div class="info-card"><strong>瀛﹀彿</strong><p>' + escapeHtml(state.user.studentNo) + '</p></div>'
            + '    <div class="info-card"><strong>绫诲埆</strong><p>' + escapeHtml(state.user.category) + '</p></div>'
            + '    <div class="info-card"><strong>瑙掕壊</strong><p>' + escapeHtml(state.user.role) + '</p></div>'
            + '  </div>'
            + '</div>';
    }

    function renderProfile() {
        mainView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>鍩虹璧勬枡</h3><p class="info-meta">褰撳墠璐﹀彿鐨勪釜浜轰俊鎭涓嬨€?/p></div></div>'
            + '  <div class="profile-grid">'
            + '    <div class="info-card"><strong>韬唤璇佸彿</strong><p>' + escapeHtml(state.user.idCard) + '</p></div>'
            + '    <div class="info-card"><strong>鐧诲綍璐﹀彿</strong><p>' + escapeHtml(state.user.username) + '</p></div>'
            + '    <div class="info-card"><strong>濮撳悕</strong><p>' + escapeHtml(state.user.name) + '</p></div>'
            + '    <div class="info-card"><strong>鑱旂郴鐢佃瘽</strong><p>' + escapeHtml(state.user.phone) + '</p></div>'
            + '    <div class="info-card"><strong>鎬у埆</strong><p>' + escapeHtml(state.user.gender) + '</p></div>'
            + '    <div class="info-card"><strong>瀛﹂櫌</strong><p>' + escapeHtml(state.user.college) + '</p></div>'
            + '    <div class="info-card"><strong>鐝骇</strong><p>' + escapeHtml(state.user.className) + '</p></div>'
            + '    <div class="info-card"><strong>瀛﹀彿</strong><p>' + escapeHtml(state.user.studentNo) + '</p></div>'
            + '    <div class="info-card"><strong>绫诲埆</strong><p>' + escapeHtml(state.user.category) + '</p></div>'
            + '    <div class="info-card"><strong>瑙掕壊</strong><p>' + escapeHtml(state.user.role) + '</p></div>'
            + '  </div>'
            + '</div>'
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>淇敼涓汉淇℃伅</h3><p class="info-meta">鍙互鍦ㄨ繖閲屾洿鏂板鍚嶃€佺數璇濄€佸闄€佺彮绾у拰瀛﹀彿绛変俊鎭€?/p></div></div>'
            + '  <form id="profileForm" class="form-grid two-columns">'
            + '    <label class="field"><span>濮撳悕</span><input name="name" value="' + escapeHtml(state.user.name) + '" placeholder="璇疯緭鍏ュ鍚?></label>'
            + '    <label class="field"><span>鑱旂郴鐢佃瘽</span><input name="phone" value="' + escapeHtml(state.user.phone) + '" placeholder="璇疯緭鍏ョ數璇?></label>'
            + '    <label class="field"><span>Gender</span><input name="gender" value="' + escapeHtml(state.user.gender) + '" placeholder="gender"></label>'
            + '    <label class="field"><span>???</span><input name="college" value="' + escapeHtml(state.user.college) + '" placeholder="????????></label>'
            + '    <label class="field"><span>???</span><input name="className" value="' + escapeHtml(state.user.className) + '" placeholder="????????></label>'
            + '    <label class="field"><span>???</span><input name="studentNo" value="' + escapeHtml(state.user.studentNo) + '" placeholder="????????></label>'
            + '    <label class="field full-row"><span>???</span><input name="category" value="' + escapeHtml(state.user.category) + '" placeholder="?????????????></label>'
            + '    </label>'
            + '    <label class="field"><span>瀛﹂櫌</span><input name="college" value="' + escapeHtml(state.user.college) + '" placeholder="璇疯緭鍏ュ闄?></label>'
            + '    <label class="field"><span>鐝骇</span><input name="className" value="' + escapeHtml(state.user.className) + '" placeholder="璇疯緭鍏ョ彮绾?></label>'
            + '    <label class="field"><span>瀛﹀彿</span><input name="studentNo" value="' + escapeHtml(state.user.studentNo) + '" placeholder="璇疯緭鍏ュ鍙?></label>'
            + '    <label class="field full-row"><span>绫诲埆</span><input name="category" value="' + escapeHtml(state.user.category) + '" placeholder="渚嬪锛氬鐢熴€佹暀甯?></label>'
            + '    <div class="form-actions full-row">'
            + '      <button type="submit" class="primary-btn">淇濆瓨淇敼</button>'
            + '    </div>'
            + '    <p id="profileMessage" class="form-message full-row"></p>'
            + '  </form>'
            + '</div>';

        bindProfileForm();
    }

    function bindProfileForm() {
        var form = document.getElementById('profileForm');
        var messageEl = document.getElementById('profileMessage');

        if (!form) {
            return;
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var formData = new FormData(form);
            var payload = {
                name: String(formData.get('name') || '').trim(),
                phone: String(formData.get('phone') || '').trim(),
                gender: String(formData.get('gender') || '').trim(),
                college: String(formData.get('college') || '').trim(),
                className: String(formData.get('className') || '').trim(),
                studentNo: String(formData.get('studentNo') || '').trim(),
                category: String(formData.get('category') || '').trim()
            };

            appUtils.ajax({
                method: 'PUT',
                url: '/api/users/me',
                data: payload,
                success: function (response) {
                    if (!response.success || !response.data) {
                        appUtils.showMessage(messageEl, response.message || '淇敼澶辫触', false);
                        return;
                    }

                    state.user = response.data;
                    currentUserName.textContent = state.user.name + (state.user.role === 'ADMIN' ? ' 绠＄悊鍛? : ' 鐢ㄦ埛');
                    renderProfile();
                    appUtils.showMessage(document.getElementById('profileMessage'), 'Saved successfully', true);
                },
                error: function (xhr, response) {
                    appUtils.showMessage(messageEl, (response && response.message) || '淇敼澶辫触', false);
                }
            });
        });
    }

    function renderEventTable(list, isMine) {
        if (!list.length) {
            mainView.innerHTML = '<div class="empty-state"><h3>鏆傛棤鏁版嵁</h3><p>' + (isMine ? '褰撳墠杩樻病鏈夋姤鍚嶈褰曘€? : '褰撳墠娌℃湁鍙睍绀洪」鐩€?) + '</p></div>';
            return;
        }

        mainView.innerHTML = ''
            + '<table class="event-table">'
            + '  <thead><tr><th>椤圭洰鍚嶇О</th><th>椤圭洰绫诲埆</th><th>姣旇禌鏃堕棿</th><th>姣旇禌鍦扮偣</th><th>鎶ュ悕鎯呭喌</th><th>椤圭洰璇存槑</th><th>鎿嶄綔</th></tr></thead>'
            + '  <tbody>'
            + list.map(function (item) {
                var actionHtml = isMine
                    ? '<button class="action-btn cancel-btn" data-id="' + item.id + '">鍙栨秷鎶ュ悕</button>'
                    : '<button class="action-btn register-btn" data-id="' + item.id + '" ' + (item.registered ? 'disabled' : '') + '>' + (item.registered ? '宸叉姤鍚? : '鎶ュ悕') + '</button>';
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

        bindEventButtons();
    }

    function renderUserManage() {
        if (!state.adminUsers.length) {
            mainView.innerHTML = '<div class="empty-state"><h3>鏆傛棤鐢ㄦ埛</h3><p>褰撳墠绯荤粺杩樻病鏈夌敤鎴锋暟鎹€?/p></div>';
            return;
        }

        mainView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>鏁版嵁姒傝</h3><p class="info-meta">鏌ョ湅褰撳墠绯荤粺鍐呯敤鎴锋€讳綋鎯呭喌銆?/p></div></div>'
            + '  <div class="summary-grid">'
            + '    <div class="summary-card"><strong>鐢ㄦ埛鎬绘暟</strong><p>' + state.adminUsers.length + '</p></div>'
            + '    <div class="summary-card"><strong>绠＄悊鍛樻暟閲?/strong><p>' + state.adminUsers.filter(function (item) { return item.role === "ADMIN"; }).length + '</p></div>'
            + '    <div class="summary-card"><strong>绂佺敤璐﹀彿鏁伴噺</strong><p>' + state.adminUsers.filter(function (item) { return item.status === "DISABLED"; }).length + '</p></div>'
            + '  </div>'
            + '</div>'
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>鐢ㄦ埛鍒楄〃</h3><p class="info-meta">鏌ョ湅绯荤粺鍐呮墍鏈夌敤鎴蜂俊鎭€?/p></div></div>'
            + '  <table class="event-table">'
            + '    <thead><tr><th>濮撳悕</th><th>璐﹀彿</th><th>韬唤璇佸彿</th><th>鐢佃瘽</th><th>鎬у埆</th><th>瀛﹂櫌</th><th>绫诲埆</th><th>瑙掕壊</th><th>鐘舵€?/th><th>鎿嶄綔</th></tr></thead>'
            + '    <tbody>'
            + state.adminUsers.map(function (item) {
                    var isAdmin = item.role === 'ADMIN';
                    var statusText = item.status === 'DISABLED' ? '宸茬鐢? : '姝ｅ父';
                    var statusAction = isAdmin
                        ? ''
                        : (item.status === 'DISABLED'
                            ? '<button class="action-btn enable-user-btn" data-id="' + item.id + '">瑙ｉ櫎绂佺敤</button>'
                            : '<button class="action-btn disable-user-btn" data-id="' + item.id + '">绂佺敤璐︽埛</button>');
                    var deleteAction = isAdmin ? '' : '<button class="action-btn delete-user-btn" data-id="' + item.id + '">鍒犻櫎</button>';
                    return ''
                        + '<tr>'
                        + '<td>' + escapeHtml(item.name) + '</td>'
                        + '<td>' + escapeHtml(item.username) + '</td>'
                        + '<td>' + escapeHtml(item.idCard) + '</td>'
                        + '<td>' + escapeHtml(item.phone) + '</td>'
                        + '<td>' + escapeHtml(item.gender) + '</td>'
                        + '<td>' + escapeHtml(item.college) + '</td>'
                        + '<td>' + escapeHtml(item.category) + '</td>'
                        + '<td>' + escapeHtml(isAdmin ? '绠＄悊鍛? : '鏅€氱敤鎴?) + '</td>'
                        + '<td>' + escapeHtml(statusText) + '</td>'
                        + '<td><button class="action-btn reset-password-btn" data-id="' + item.id + '">閲嶇疆瀵嗙爜</button> ' + statusAction + ' ' + deleteAction + '</td>'
                        + '</tr>';
                }).join('')
            + '    </tbody>'
            + '  </table>'
            + '</div>';

        bindUserManageActions();
    }

    function renderAthleteManage() {
        if (!state.adminRegistrations.length) {
            mainView.innerHTML = '<div class="empty-state"><h3>鏆傛棤鎶ュ悕璁板綍</h3><p>褰撳墠杩樻病鏈夊弬璧涜繍鍔ㄥ憳鏁版嵁銆?/p></div>';
            return;
        }

        mainView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>鏁版嵁姒傝</h3><p class="info-meta">鏌ョ湅褰撳墠鍙傝禌杩愬姩鍛樼殑鎬讳綋缁熻銆?/p></div></div>'
            + '  <div class="summary-grid">'
            + '    <div class="summary-card"><strong>鎶ュ悕璁板綍鎬绘暟</strong><p>' + state.adminRegistrations.length + '</p></div>'
            + '    <div class="summary-card"><strong>宸叉姤鍚嶇姸鎬?/strong><p>' + state.adminRegistrations.filter(function (item) { return item.status === "宸叉姤鍚?; }).length + '</p></div>'
            + '    <div class="summary-card"><strong>瑕嗙洊椤圭洰鏁?/strong><p>' + uniqueEventCount() + '</p></div>'
            + '  </div>'
            + '</div>'
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>鍙傝禌鍚嶅崟</h3><p class="info-meta">鏌ョ湅鎵€鏈夊凡鎶ュ悕杩愬姩鍛樺拰椤圭洰鏄庣粏銆?/p></div></div>'
            + '  <table class="event-table">'
            + '    <thead><tr><th>濮撳悕</th><th>璐﹀彿</th><th>鐢佃瘽</th><th>瀛﹂櫌</th><th>绫诲埆</th><th>椤圭洰鍚嶇О</th><th>椤圭洰绫诲埆</th><th>鏃堕棿鍦扮偣</th><th>鐘舵€?/th><th>鎶ュ悕鏃堕棿</th></tr></thead>'
            + '    <tbody>'
            + state.adminRegistrations.map(function (item) {
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
            + '    </tbody>'
            + '  </table>'
            + '</div>';
    }

    function renderEventManage() {
        var formTitle = state.editingEventId ? '缂栬緫椤圭洰' : '鏂板椤圭洰';
        var editingItem = state.adminEvents.find(function (item) {
            return item.id === state.editingEventId;
        }) || {
            eventName: '',
            eventCategory: '',
            location: '',
            quota: '',
            description: '',
            eventTime: ''
        };

        mainView.innerHTML = ''
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>' + formTitle + '</h3><p class="info-meta">鍙湪杩欓噷缁存姢姣旇禌椤圭洰鐨勫熀纭€淇℃伅銆?/p></div></div>'
            + '  <form id="eventForm" class="form-grid two-columns">'
            + '    <label class="field"><span>椤圭洰鍚嶇О</span><input name="eventName" value="' + escapeHtml(editingItem.eventName) + '" placeholder="渚嬪锛氱敺瀛?00绫?></label>'
            + '    <label class="field"><span>椤圭洰鍒嗙被</span><input name="eventCategory" value="' + escapeHtml(editingItem.eventCategory) + '" placeholder="渚嬪锛氱敯寰勭煭璺?></label>'
            + '    <label class="field"><span>姣旇禌鍦扮偣</span><input name="location" value="' + escapeHtml(editingItem.location) + '" placeholder="渚嬪锛氫笢鎿嶅満A鍖?></label>'
            + '    <label class="field"><span>浜烘暟涓婇檺</span><input name="quota" type="number" min="1" value="' + escapeHtml(editingItem.quota) + '" placeholder="璇疯緭鍏ヤ汉鏁颁笂闄?></label>'
            + '    <label class="field full-row"><span>姣旇禌鏃堕棿</span><input name="eventTime" value="' + escapeHtml(editingItem.eventTime) + '" placeholder="渚嬪锛?026-05-20 08:30"></label>'
            + '    <label class="field full-row"><span>椤圭洰璇存槑</span><input name="description" value="' + escapeHtml(editingItem.description) + '" placeholder="璇疯緭鍏ラ」鐩鏄?></label>'
            + '    <div class="form-actions full-row">'
            + '      <button type="submit" class="primary-btn">' + (state.editingEventId ? '淇濆瓨淇敼' : '鏂板椤圭洰') + '</button>'
            + '      <button type="button" class="ghost-btn" id="resetEventForm">娓呯┖琛ㄥ崟</button>'
            + '    </div>'
            + '    <p id="eventFormMessage" class="form-message full-row"></p>'
            + '  </form>'
            + '</div>'
            + '<div class="section-block">'
            + '  <div class="section-head"><div><h3>椤圭洰鍒楄〃</h3><p class="info-meta">褰撳墠绯荤粺鍐呯殑鍏ㄩ儴姣旇禌椤圭洰銆?/p></div></div>'
            + (state.adminEvents.length ? ''
                + '<table class="event-table">'
                + '  <thead><tr><th>椤圭洰鍚嶇О</th><th>椤圭洰鍒嗙被</th><th>姣旇禌鏃堕棿</th><th>姣旇禌鍦扮偣</th><th>浜烘暟涓婇檺</th><th>宸叉姤鍚?/th><th>椤圭洰璇存槑</th><th>鎿嶄綔</th></tr></thead>'
                + '  <tbody>'
                + state.adminEvents.map(function (item) {
                    return ''
                        + '<tr>'
                        + '<td>' + escapeHtml(item.eventName) + '</td>'
                        + '<td>' + escapeHtml(item.eventCategory) + '</td>'
                        + '<td>' + escapeHtml(item.eventTime) + '</td>'
                        + '<td>' + escapeHtml(item.location) + '</td>'
                        + '<td>' + escapeHtml(item.quota) + '</td>'
                        + '<td>' + escapeHtml(item.registeredCount || 0) + '</td>'
                        + '<td>' + escapeHtml(item.description) + '</td>'
                        + '<td><button class="action-btn edit-event-btn" data-id="' + item.id + '">缂栬緫</button> <button class="action-btn delete-event-btn" data-id="' + item.id + '">鍒犻櫎</button></td>'
                        + '</tr>';
                }).join('')
                + '  </tbody>'
                + '</table>'
                : '<div class="empty-state"><h3>鏆傛棤椤圭洰</h3><p>褰撳墠杩樻病鏈夋瘮璧涢」鐩紝璇峰厛鏂板椤圭洰銆?/p></div>')
            + '</div>';

        bindEventManageActions();
    }

    function renderPlaceholder(title, text) {
        mainView.innerHTML = ''
            + '<div class="empty-state">'
            + '  <h3>' + title + '</h3>'
            + '  <p>' + text + '</p>'
            + '</div>';
    }

    function uniqueEventCount() {
        var map = {};
        state.adminRegistrations.forEach(function (item) {
            map[item.eventName] = true;
        });
        return Object.keys(map).length;
    }

    function bindEventButtons() {
        Array.prototype.slice.call(document.querySelectorAll('.register-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                appUtils.ajax({
                    method: 'POST',
                    url: '/api/events/' + button.getAttribute('data-id') + '/register',
                    success: function (response) {
                        if (!response.success) {
                            window.alert(response.message || '鎶ュ悕澶辫触');
                            return;
                        }
                        window.alert('鎶ュ悕鎴愬姛');
                        loadEventData();
                    },
                    error: function (xhr, response) {
                        window.alert((response && response.message) || '鎶ュ悕澶辫触');
                    }
                });
            });
        });

        Array.prototype.slice.call(document.querySelectorAll('.cancel-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                appUtils.ajax({
                    method: 'DELETE',
                    url: '/api/events/' + button.getAttribute('data-id') + '/register',
                    success: function (response) {
                        if (!response.success) {
                            window.alert(response.message || '鍙栨秷鎶ュ悕澶辫触');
                            return;
                        }
                        window.alert('鍙栨秷鎶ュ悕鎴愬姛');
                        loadEventData();
                    },
                    error: function (xhr, response) {
                        window.alert((response && response.message) || '鍙栨秷鎶ュ悕澶辫触');
                    }
                });
            });
        });
    }

    function bindUserManageActions() {
        Array.prototype.slice.call(document.querySelectorAll('.reset-password-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                var id = button.getAttribute('data-id');
                appUtils.ajax({
                    method: 'POST',
                    url: '/api/admin/users/' + id + '/reset-password',
                    success: function (response) {
                        if (!response.success) {
                            window.alert(response.message || '閲嶇疆瀵嗙爜澶辫触');
                            return;
                        }
                        window.alert('瀵嗙爜宸查噸缃负 123456');
                    },
                    error: function (xhr, response) {
                        window.alert((response && response.message) || '閲嶇疆瀵嗙爜澶辫触');
                    }
                });
            });
        });

        Array.prototype.slice.call(document.querySelectorAll('.disable-user-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                var id = button.getAttribute('data-id');
                appUtils.ajax({
                    method: 'POST',
                    url: '/api/admin/users/' + id + '/disable',
                    success: function (response) {
                        if (!response.success) {
                            window.alert(response.message || '绂佺敤璐︽埛澶辫触');
                            return;
                        }
                        loadAdminData();
                    },
                    error: function (xhr, response) {
                        window.alert((response && response.message) || '绂佺敤璐︽埛澶辫触');
                    }
                });
            });
        });

        Array.prototype.slice.call(document.querySelectorAll('.enable-user-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                var id = button.getAttribute('data-id');
                appUtils.ajax({
                    method: 'POST',
                    url: '/api/admin/users/' + id + '/enable',
                    success: function (response) {
                        if (!response.success) {
                            window.alert(response.message || '瑙ｉ櫎绂佺敤澶辫触');
                            return;
                        }
                        loadAdminData();
                    },
                    error: function (xhr, response) {
                        window.alert((response && response.message) || '瑙ｉ櫎绂佺敤澶辫触');
                    }
                });
            });
        });

        Array.prototype.slice.call(document.querySelectorAll('.delete-user-btn')).forEach(function (button) {
            button.addEventListener('click', function () {
                var id = button.getAttribute('data-id');
                if (!window.confirm('纭畾瑕佸垹闄よ繖涓处鍙峰悧锛?)) {
                    return;
                }
                appUtils.ajax({
                    method: 'DELETE',
                    url: '/api/admin/users/' + id,
                    success: function (response) {
                        if (!response.success) {
                            window.alert(response.message || '鍒犻櫎鐢ㄦ埛澶辫触');
                            return;
                        }
                        loadAdminData();
                    },
                    error: function (xhr, response) {
                        window.alert((response && response.message) || '鍒犻櫎鐢ㄦ埛澶辫触');
                    }
                });
            });
        });
    }

    function renderCurrentView() {
        var currentMenu = getMenus().find(function (item) {
            return item.key === state.currentView;
        });

        if (currentMenu) {
            sectionTitle.textContent = currentMenu.label;
            sectionDesc.textContent = currentMenu.desc;
        }

        renderTabs();

        if (state.currentView === 'profile') {
            renderProfile();
            return;
        }

        if (state.currentView === 'events') {
            renderEventTable(state.currentTab === 'mine' ? state.myEvents : state.events, state.currentTab === 'mine');
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

        if (state.currentView === 'admin-home') {
            renderPlaceholder('杩愬姩浼氱鐞?, '杩欓噷灏嗕綔涓虹鐞嗗憳鍚庡彴棣栭〉锛屽彲灞曠ず鎶ュ悕鎬昏銆佺郴缁熷叕鍛娿€佽繍鍔ㄤ細绠＄悊鍏ュ彛绛夊唴瀹广€?);
            return;
        }

        if (state.currentView === 'team-info') {
            renderPlaceholder('鍥綋淇℃伅绠＄悊', '杩欓噷灏嗙户缁ˉ鍏呭闄€侀儴闂ㄣ€佷唬琛ㄩ槦绛夊洟浣撲俊鎭鐞嗗姛鑳姐€?);
            return;
        }

        if (state.currentView === 'event-manage') {
            renderEventManage();
            return;
        }

        if (state.currentView === 'score-manage') {
            renderPlaceholder('鍙傝禌鎴愮哗绠＄悊', '杩欓噷灏嗙户缁ˉ鍏呮垚缁╁綍鍏ャ€佹垚缁╃淮鎶ゃ€佹垚缁╂煡璇㈢瓑鍔熻兘銆?);
            return;
        }

        if (state.currentView === 'record-manage') {
            renderPlaceholder('椤圭洰璁板綍绠＄悊', '杩欓噷灏嗙户缁ˉ鍏呴」鐩褰曘€佽禌浜嬬З搴忓唽鍜岄」鐩。妗堢鐞嗗姛鑳姐€?);
            return;
        }

        if (state.currentView === 'system-manage') {
            renderPlaceholder('绯荤粺绠＄悊', '杩欓噷灏嗙户缁ˉ鍏呯郴缁熼厤缃€佽处鍙锋潈闄愬拰杩愯缁存姢鍔熻兘銆?);
        }
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
                    description: String(formData.get('description') || '').trim(),
                    eventTime: String(formData.get('eventTime') || '').trim()
                };
                var successText = state.editingEventId ? '椤圭洰淇敼鎴愬姛' : '椤圭洰鏂板鎴愬姛';

                appUtils.ajax({
                    method: state.editingEventId ? 'PUT' : 'POST',
                    url: state.editingEventId ? '/api/admin/events/' + state.editingEventId : '/api/admin/events',
                    data: payload,
                    success: function (response) {
                        if (!response.success) {
                            appUtils.showMessage(messageEl, response.message || '淇濆瓨澶辫触', false);
                            return;
                        }
                        state.editingEventId = null;
                        window.alert(successText);
                        loadAdminData();
                    },
                    error: function (xhr, response) {
                        appUtils.showMessage(messageEl, (response && response.message) || '淇濆瓨澶辫触', false);
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
                if (!window.confirm('纭畾瑕佸垹闄よ繖涓」鐩悧锛熷垹闄ゅ悗璇ラ」鐩殑鎶ュ悕璁板綍涔熶細涓€骞舵竻闄ゃ€?)) {
                    return;
                }
                appUtils.ajax({
                    method: 'DELETE',
                    url: '/api/admin/events/' + eventId,
                    success: function (response) {
                        if (!response.success) {
                            window.alert(response.message || '鍒犻櫎澶辫触');
                            return;
                        }
                        if (state.editingEventId === Number(eventId)) {
                            state.editingEventId = null;
                        }
                        loadAdminData();
                    },
                    error: function (xhr, response) {
                        window.alert((response && response.message) || '鍒犻櫎澶辫触');
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
                currentUserName.textContent = state.user.name + (state.user.role === 'ADMIN' ? ' 绠＄悊鍛? : ' 鐢ㄦ埛');
                state.currentView = state.user.role === 'ADMIN' ? 'admin-home' : 'profile';

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
