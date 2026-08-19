# 水鱼博客 - 服务状态页

将 [咕咕监控](https://www.gugujiankong.com) 与 [UptimeRobot](https://uptimerobot.com) 数据统一展示的公开状态页，部署于 Vercel。

## 部署步骤

1. **Fork 或导入此仓库到 Vercel**

2. **设置环境变量**
   - 在 Vercel 项目 Settings → Environment Variables 中添加：
   - `UPTIMEROBOT_API_KEY` = 你的 UptimeRobot Read-Only API Key

3. **部署**
   - Vercel 会自动部署，部署完成后即可访问

## 数据来源

- **咕咕监控**: 通过 iframe 嵌入现有的公开状态页
- **UptimeRobot**: 通过 Vercel Serverless Function 代理 API 请求