# dididamo

## 目录

- 业务前台：`/`
- TCMapApi 中心：`/TCMapApi/`
- 启动脚本：`/start`
- 后端说明：`/后端说明.MD`

## 目标前端架构

- 主栈：Taro 4 + React
- 目标产物：H5 网页 + 微信小程序
- UI 组件：Taro UI 或轻量自定义组件
- 地图接入：腾讯地图 JS API + Web 服务 API 混合方案

## 2026年7月8日

- 前后端已拆分为 `frontend` / `backend`
- 腾讯能力已独立到 `TCMapApi` 一级目录
- 腾讯配置保存在 `backend/config/runtime.json`
- 腾讯单独测试页已按接口拆分
