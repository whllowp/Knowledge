# RSI 动态菜单与年度相册

## 1. 来源与边界

目标是参考 [Dream-RSI](https://arxiv.org/html/2609.14858v2#S3) 的循环结构，让厨房“活起来”：

```text
在线班次（online rollout）
  → 记录推荐 / 实际出餐 / 分数 / 星级 / 超时（discovery history）
  → 用历史班次回放候选策略（replay worlds）
  → 选择 replay score 更高的策略（policy improvement / selection）
  → 下一班生效（deployed policy）
```

这是**游戏尺度的确定性适配**，不是论文实验复现：

- 没有 LLM、神经网络、网络请求或云端训练。
- “世界”是每天的菜单上下文（城市、天气、偏好、班次）与出餐历史，不是代码/数学题。
- “策略”是一组菜谱标签权重 + 探索率，不是函数/内核。
- “回放”用历史班次做离线打分，选择候选权重，不执行真实代码。

## 2. 玩家看到的

### 2.1 今日动态菜单

选择模式页的 **RSI KITCHEN BRAIN** 面板：

- 城市：上海 / 成都 / 广州 / 北京 / 杭州。
- 天气：晴朗 / 下雨 / 下雪 / 热浪 / 起风。
- 偏好：清爽 / 素食 / 肉食 / 芝士 / 辛香 / 番茄 / 经典（最多 4 个）。
- 推荐 3 道菜，显示推荐理由（城市、天气、偏好、新鲜感）。
- “换一批”轮换候选；“年度相册”进入回忆。

城市和天气是**玩家/主持人选择**，不是真实天气 API；这样演示和测试可复现，也避免联网依赖。面板的“自动定位/季节”只用浏览器时区 + 当前月份推导，不联网。

### 2.2 推荐菜 +25%

- 订单池 = 3 道推荐 + 班次基础池；推荐菜在订单池里权重 ×2.2，确保“今日推荐”真的会出现。
- 推荐订单票据有金色描边和“RSI 推荐 · 出餐 +25%”标签。
- 上菜时在基础分 + 小费 + 连击倍率之后，推荐菜再加 25%。
- `GameSession` 记录 `rsiBonus`、`recommendedServed`、`dishCounts`。

### 2.3 年度相册

- 入口：主菜单“年度相册”或 RSI 面板“年度相册”。
- 汇总：班次、端出的菜、星星、总分；月份/季节；城市/天气；最常做菜；最高分班次；RSI 版本。
- 回忆录文案：由模板从真实历史生成，不编造未发生的菜。
- 导出：独立 HTML（内联 CSS，可直接打开/发送）；打印/存 PDF。
- 没有记录时明确显示“还没有开火记录”，不伪造封面数据。

## 3. 数据结构

代码：`src/core/rsi.js`，本机键 `sizzle-rush:rsi:v1`。

```js
{
  version: 1,
  context: { city: 'shanghai', weather: 'sunny', prefs: ['fresh'] },
  policy: {
    version: 1,
    weights: { fresh: 1, light: 1, ..., double: 1 },
    exploration: 0.12,
    replayScore: 0,
    updatedAt: null
  },
  history: [{
    id, at, year, month, day, mode, level, players,
    context, recommended: [recipeId],
    dishCounts: { recipeId: n },
    served, score, stars, timeoutRate, difficulty, wantReplay,
    policyVersion
  }],
  lastRecommendation: [recipeId]
}
```

历史上限 180 班；`dishCounts` 来自 `GameSession.stats`。

## 4. 推荐打分

对每个候选菜：

```text
score = 0.25
      + Σ 标签权重 × 基础 0.30
      + Σ 标签权重 × 城市匹配 0.80
      + Σ 标签权重 × 天气匹配 1.00
      + Σ 标签权重 × 偏好匹配 1.25
      + 热浪清爽加成 / 雨雪热食加成
      + 新鲜感（没做过/做得少）
      - 最近推荐重复惩罚
      + 日期 + 菜 + 变体的确定性微扰
```

- 只取 `tier <= 班次 tier` 的菜；推荐 3 道。
- 探索位：从前 8 名里挑一道做得最少的，避免菜单僵化。
- 所有随机/微扰是确定性的，同一日期/上下文/变体结果可复现。

## 5. 回放与策略改进

对每个历史班次 `i`：

1. 用 `history[0..i)` 构造“当时能看到的历史”；
2. 用候选权重推荐 3 道菜；
3. 计算覆盖率 `hit = 推荐菜实际出餐数 / 总出餐数`；
4. 计算满意度：星级、超时率、重玩意愿、难度是否在 3–4；
5. `shiftScore = hit × 0.6 + satisfaction × 0.4`。

候选策略：

- 当前策略；
- 10 个标签各 +0.2 / −0.2（20 个）；
- 探索率 0.05 / 0.20 / 0.30；
- 经验策略：按历史实际出餐菜谱的标签累计权重。

选择 replay score 最高且超过当前 `replayScore` 的策略；版本 +1，记录 `replayScore` 与 `updatedAt`。至少 2 个班次才改进；没有更好策略时保持版本并记录状态。

## 6. 验证

- 单元：`tests/rsi.test.js` — tier、上下文、历史、版本、年度汇总、空相册、HTML 导出。
- E2E：`scripts/rsi-test.mjs` — 城市/天气/偏好持久化、推荐随上下文变化、班次拿到推荐、推荐菜 +25%、历史入库、相册汇总、HTML 下载。
- `npm run test:e2e` 已包含该脚本。

## 7. 已知限制

- 推荐是规则 + 小规模回放，不是论文的完整递归自我改进；不声称达到论文效果。
- 城市/天气不由真实 API 自动获取；避免离线包依赖。
- 相册只按当前年份生成；跨年历史会保留数据，但 UI 尚未做年份选择。
- 推荐策略只在本机；换浏览器/清缓存会回到 v1。
