# 运动会报名系统

## 项目简介

这是一个基于 Spring Boot + 原生 Web 前端技术栈开发的运动会报名管理系统，支持学生在线报名运动会项目、管理员统一管理用户与报名数据。

---

## 技术栈

### 后端
| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 8+ | 开发语言 |
| Spring Boot | 2.x | 核心框架 |
| MyBatis | 3.x | ORM 框架 |
| MySQL | 5.7+ | 关系型数据库 |
| Maven | 3.6+ | 项目构建 |

### 前端
| 技术 | 说明 |
|------|------|
| HTML5 | 页面结构 |
| CSS3 | 样式设计（纯原生，无框架依赖） |
| JavaScript (ES5) | 交互逻辑（纯原生，无框架依赖） |

---

## 项目结构

```
运动会报名/
├── backend/                          # 后端 Spring Boot 项目
│   ├── src/main/java/                # Java 源代码
│   │   └── com/sports/               #   主包
│   │       ├── controller/           #     控制器层
│   │       ├── service/              #     业务逻辑层
│   │       ├── mapper/               #     数据访问层
│   │       ├── entity/               #     实体类
│   │       ├── vo/                   #     视图对象
│   │       ├── dto/                  #     数据传输对象
│   │       └── config/               #     配置类
│   ├── src/main/resources/           # 配置文件
│   │   ├── application.properties   #   应用配置
│   │   ├── schema.sql               #   数据库表结构
│   │   └── data.sql                 #   初始数据
│   ├── API文档.md                    # 接口文档
│   └── pom.xml                       # Maven 配置
│
└── frontend/                         # 前端项目
    ├── assets/
    │   ├── css/
    │   │   ├── style.css             # 全局样式（830 行）
    │   │   ├── login.css             # 登录/注册页样式
    │   │   └── app.css               # 主应用页样式
    │   └── js/
    │       ├── common.js             # 公共工具库（API 请求、消息提示等）
    │       ├── login.js              # 登录页逻辑
    │       ├── register.js           # 注册页逻辑
    │       ├── app-main.js           # 主应用页核心逻辑（714 行）
    │       └── app.js                # 备用页面逻辑
    ├── login.html                    # 登录页面
    ├── register.html                 # 注册页面
    ├── app.html                      # 主应用页面（登录后跳转）
    └── README.md                     # 项目说明（本文件）
```

---

## 页面说明

### login.html — 登录页
- 用户输入 **登录账号** + **密码** + **图形验证码**
- 验证码为 Canvas 绘制的 4 位随机字符
- 登录成功后将用户信息存入 `sessionStorage`，跳转至 `app.html`
- 包含"去注册"按钮跳转至注册页

### register.html — 注册页
- 填写完整的个人信息（身份证号、姓名、手机号、性别、学院、班级、学号、类别）
- 注册成功后自动登录并跳转至 `app.html`
- 包含"返回登录"按钮

### app.html — 主应用页
- **顶栏**：系统标题 + 当前用户名 + 退出登录按钮
- **左侧导航**：根据角色（学生/管理员）显示对应菜单
- **右侧内容区**：动态渲染对应功能模块

#### 学生菜单
| 菜单项 | 功能 |
|--------|------|
| 个人信息 | 查看并维护当前登录人员的基础资料 |
| 运动会报名 | 浏览所有项目并完成报名，也可查看自己的报名信息 |

#### 管理员菜单
| 菜单项 | 功能 |
|--------|------|
| 运动会管理 | 查看后台首页和系统概览 |
| 团体信息管理 | 维护参赛团体与组织信息 |
| 用户信息管理 | 查看、维护用户资料并执行账号管理操作 |
| 报名管理 | 查看全部报名记录并进行管理 |
| 赛事管理 | 管理所有运动会赛事项目 |
| 系统管理 | 系统配置、权限设置和运行维护 |

---

## 快速开始

### 环境要求
- JDK 8 或更高版本
- Maven 3.6+
- MySQL 5.7+
- 任意现代浏览器（推荐 Chrome / Edge）

### 1. 数据库配置

```sql
CREATE DATABASE IF NOT EXISTS sports_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sports_db;
```

然后导入 `backend/src/main/resources/schema.sql` 和 `data.sql` 初始化表结构和数据。

### 2. 修改后端配置

编辑 `backend/src/main/resources/application.properties`：

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sports_db?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.username=你的数据库用户名
spring.datasource.password=你的数据库密码
server.port=8080
```

### 3. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端默认运行在 `http://localhost:8080`。

### 4. 启动前端

**方式一：Python HTTP 服务器**
```bash
cd frontend
python -m http.server 5500
```
访问 `http://localhost:5500/login.html`

**方式二：VS Code Live Server**
- 安装 Live Server 插件
- 右键 `login.html` → "Open with Live Server"

**方式三：直接打开文件（file:// 协议）**
- 直接双击 `login.html`
- 前端会自动将 API 请求指向 `http://localhost:8080`

> **注意**：前端 JS 会自动检测协议——如果通过 `file://` 打开，API 地址自动指向 `http://localhost:8080`；否则指向当前域名 + 端口 8080。

---

## 默认账号

| 登录账号 | 密码 | 角色 |
|----------|------|------|
| admin | admin | 管理员 |
| student | student | 普通学生 |

---

## 系统架构

```
┌─────────────────────────────────────┐
│           前端 (Native Web)          │
│  login.html → app.html              │
│  common.js 提供 Ajax 工具库          │
└──────────────┬──────────────────────┘
               │ HTTP (JSON)
               │ Session + Cookie 认证
┌──────────────▼──────────────────────┐
│       后端 (Spring Boot)             │
│  Controller → Service → Mapper       │
│  /api/auth/*     无需认证            │
│  /api/**         需登录              │
│  /api/admin/**   需 ADMIN 角色        │
└──────────────┬──────────────────────┘
               │ JDBC
┌──────────────▼──────────────────────┐
│           MySQL 数据库               │
└─────────────────────────────────────┘
```

### 认证流程

1. 用户在登录页提交账号密码
2. 后端验证通过后写入 Session（`session.currentUserId`）
3. 前端收到用户信息后存入 `sessionStorage`，跳转至 `app.html`
4. `app.html` 加载后调用 `/api/auth/me` 验证登录状态
5. 验证通过则初始化用户数据、加载侧边栏和主页内容
6. 后续 API 请求自动携带 Cookie（Session）

### 前端核心逻辑 (app-main.js)

- `loadCurrentUser()` → 调用 `/api/auth/me` 获取当前用户
- `buildApp()` → 渲染侧边栏 + 初始化数据
- `renderSidebar()` → 根据角色（学生/管理员）渲染导航菜单
- `renderCurrentView()` → 根据当前选中菜单渲染内容区域
- `loadEventData()` → 加载赛事数据
- `loadAdminData()` → 加载管理员相关数据

---

## API 接口概览

详细的接口文档请参考 `backend/API文档.md`。

### 认证接口 `/api/auth`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/register | 用户注册 |
| GET | /api/auth/me | 获取当前登录用户信息 |
| POST | /api/auth/logout | 退出登录 |

### 赛事接口 `/api/events`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/events | 获取所有赛事 |
| GET | /api/events/my | 获取我的报名 |
| POST | /api/events/{id}/register | 报名赛事 |
| DELETE | /api/events/{id}/register | 取消报名 |

### 管理员接口 `/api/admin`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/users | 获取所有用户 |
| GET | /api/admin/registrations | 获取所有报名记录 |
| GET | /api/admin/events | 获取赛事管理数据 |
| POST | /api/admin/users/{id}/reset-password | 重置用户密码 |
| POST | /api/admin/users/{id}/disable | 禁用用户 |
| POST | /api/admin/users/{id}/enable | 启用用户 |
| DELETE | /api/admin/users/{id} | 删除用户 |

---

## 编码说明

- 所有前端 HTML/CSS/JS 文件均使用 **UTF-8 编码**
- 如遇中文乱码，请检查文件是否以 UTF-8 格式保存
- 后端使用 UTF-8 编码，数据库使用 utf8mb4

---

## 常见问题

### Q: 登录后页面卡在"加载中..."
**A:** 请检查：
1. 后端服务是否已启动（`http://localhost:8080`）
2. 浏览器控制台是否有跨域或网络错误
3. JS 文件编码是否为 UTF-8（不是 GBK）

### Q: 注册时身份证号怎么填？
**A:** 15 位或 18 位的有效身份证号，如 `110101200001010000`。

### Q: 如何添加新的赛事项目？
**A:** 使用管理员账号登录，在"赛事管理"模块中操作，或直接在数据库中插入数据。