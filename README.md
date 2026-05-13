
# 运动会报名系统

## 项目简介

这是一个基于 Spring Boot 和前端技术栈开发的运动会报名系统，用于管理学校运动会的项目报名工作。

## 技术栈

### 后端
- Java 8+
- Spring Boot 2.x
- MyBatis
- MySQL 数据库

### 前端
- HTML5 / CSS3 / JavaScript
- Bootstrap 样式框架

## 项目结构

```
运动会报名/
├── backend/                 # 后端代码
│   ├── src/main/java/      # Java 源代码
│   ├── src/main/resources/ # 配置文件
│   └── pom.xml             # Maven 配置
├── frontend/               # 前端代码
│   ├── assets/             # 静态资源
│   │   ├── css/            # 样式文件
│   │   └── js/             # JavaScript 文件
│   ├── index.html          # 首页
│   ├── login.html          # 登录页
│   ├── register.html       # 注册页
│   └── app.html            # 主应用页面
└── README.md               # 项目说明
```

## 功能模块

### 用户功能
- 用户注册与登录
- 个人信息管理
- 运动会项目浏览
- 项目报名与取消

### 管理员功能
- 用户信息管理
- 报名总览查看
- 报名记录统计

## 快速开始

### 环境要求
- JDK 8 或更高版本
- Maven 3.6+
- MySQL 5.7+

### 数据库配置

创建数据库并导入初始数据：

```sql
CREATE DATABASE sports_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sports_db;
```

导入 `backend/src/main/resources/schema.sql` 和 `backend/src/main/resources/data.sql`

### 启动后端服务

```bash
cd backend
mvn spring-boot:run
```

### 启动前端服务

使用任意 HTTP 服务器启动前端，例如：

```bash
cd frontend
python -m http.server 8080
```

### 访问地址

- 前端页面: http://localhost:8080
- 后端 API: http://localhost:8081

## 默认账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | admin | 管理员 |
| student | student | 普通用户 |

## 开发说明

### 代码规范
- Java 代码遵循 Spring 编码规范
- JavaScript 代码使用 ES6+ 语法
- 数据库表名使用下划线命名

### 注意事项
- 开发环境下请确保 MySQL 服务已启动
- 修改配置文件后需要重启服务才能生效
