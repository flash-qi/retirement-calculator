# 退休计算器

微信小程序退休计算器。帮助用户了解中国社保养老金、规划退休储蓄、查询延迟退休年龄。

## 技术栈
- Taro 4 + React 18 + TypeScript
- Sass
- 微信小程序原生 API（Canvas 2D）

## 开发命令
```bash
npm install
npm run dev:weapp    # 开发模式
npm run build:weapp  # 生产构建
```

## 项目结构
```
src/
├── pages/          # 页面
│   ├── index/      # 首页 - 三个计算器入口
│   ├── pension/    # 社保养老金计算
│   ├── savings/    # 退休储蓄规划
│   ├── retire-age/ # 延迟退休年龄查询
│   └── result/     # 计算结果展示页
├── components/     # 通用组件
├── utils/          # 计算逻辑
├── data/           # 31省城市数据
└── constants.ts    # 常量定义
```
