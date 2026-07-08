# TCMapApi 腾讯地图中心

`TCMapApi/` 是当前主线的腾讯地图能力一级目录，用于页面展示、接口测试和后续业务接入。

## 入口

- `/TCMapApi/`：腾讯地图中心首页
- `/TCMapApi/pages/api-check.html`：接口测试页

## 相关后端接口

- `/api/health`
- `/api/config/public`
- `/api/tencent/bootstrap`
- `/api/tencent/search/suggestion`
- `/api/tencent/search/poi`
- `/api/tencent/geo/geocode`
- `/api/tencent/geo/regeo`
- `/api/tencent/route/driving`

## 说明

- 前端 JS API Key 建议由后端统一管理
- Web Service Key 仍然放在后端配置，不要暴露到前端
