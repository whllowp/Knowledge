# 第三方声明 / Third-Party Notices

《灶台风暴 SIZZLE!》的代码以 MIT 发布。运行时打包/使用到的第三方组件如下。

## three.js

- 版本：r186（`three@0.186.1`）
- 用途：3D 渲染、场景图、PBR 材质、灯光/阴影、WebGL 渲染器
- 许可证：MIT
- 主页：https://threejs.org/
- 源码：https://github.com/mrdoob/three.js
- 说明：`dist/game.js` 中打包了 three.js 的构建产物（含 `RoomEnvironment` 示例模块）。

three.js 的 MIT 许可证文本：

```text
The MIT License

Copyright © 2010-2025 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## awesome-gamedev-agent-skills

- 用途：本项目的开发流程、技能路由与设计方法参考（未复制其源码/资产）
- 许可证：Apache-2.0
- 仓库：https://github.com/gamedev-skills/awesome-gamedev-agent-skills

`awesome-gamedev-agent-skills-main/` 仅作为只读参考留在工作区，不进入 `dist/` 构建产物，也不参与运行时。
其 Apache-2.0 许可证与 NOTICE 以原仓库中的文件为准。

## 工具链（不随游戏分发）

- **esbuild** — MIT — 构建打包。
- **Playwright** — Apache-2.0 — 仅用于本地自动化测试/截图，不进入 `dist/`。
- **Node.js** — MIT — 构建与测试环境。

## 字体与表情

- UI 使用系统字体（Microsoft YaHei / PingFang SC / Trebuchet MS / Impact 等），不嵌入字体文件。
- 食材与工位图标使用操作系统自带 emoji 字体（Segoe UI Emoji / Apple Color Emoji / Noto Color Emoji）。
  不同系统上的 emoji 造型会有差异。

## 素材来源

- 全部纹理、招牌、海报、菜单黑板、订单纸、UI 图形均由 Canvas 2D 在运行时程序化绘制。
- 全部食物/设备为 three.js 基础几何体（Box/Sphere/Cylinder/Cone/Torus 等）组合。
- 全部音效与音乐由 WebAudio API 在运行时合成。
- **没有**使用第三方图片、音频、模型或字体文件。
