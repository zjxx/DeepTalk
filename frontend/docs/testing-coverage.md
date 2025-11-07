# 前端测试覆盖率指南

## 概述

本项目使用 Vitest 和 @vitest/coverage-v8 来生成测试覆盖率报告。覆盖率报告可以帮助您了解代码中哪些部分已被测试覆盖，哪些部分需要添加更多测试。

## 安装的依赖

```json
{
  "@vitest/coverage-v8": "latest",
  "@vitest/ui": "latest"
}
```

## 可用的脚本命令

### 1. 运行单元测试
```bash
npm run test:unit
```
- 运行所有测试用例
- 实时监控文件变化

### 2. 生成覆盖率报告
```bash
npm run test:coverage
```
- 运行所有测试并生成覆盖率报告
- 输出文本格式的覆盖率摘要
- 生成 HTML、JSON、LCOV 格式的详细报告

### 3. 监控模式下的覆盖率
```bash
npm run test:coverage-watch
```
- 实时监控文件变化
- 自动重新运行测试并更新覆盖率

### 4. 可视化UI界面
```bash
npm run test:coverage-ui
```
- 启动 Vitest UI 界面
- 提供可视化的测试运行和覆盖率查看

## 覆盖率配置说明

在 `vitest.config.ts` 中的覆盖率配置：

```typescript
coverage: {
  provider: 'v8',           // 使用 V8 引擎进行覆盖率收集
  reporter: ['text', 'json', 'html', 'lcov'], // 输出多种格式的报告
  include: [
    'src/**/*.{vue,js,ts}'  // 包含需要测试的文件
  ],
  exclude: [
    'src/main.ts',          // 排除入口文件
    'src/router.ts',        // 排除路由配置
    'src/config/**',        // 排除配置文件
    'src/types/**',         // 排除类型定义
    'src/**/*.d.ts',        // 排除类型声明文件
    'src/**/*.spec.{js,ts}', // 排除测试文件
    'src/**/*.test.{js,ts}', // 排除测试文件
    'src/**/__tests__/**',   // 排除测试目录
  ],
  thresholds: {
    global: {
      branches: 80,   // 分支覆盖率阈值
      functions: 80,  // 函数覆盖率阈值
      lines: 80,      // 行覆盖率阈值
      statements: 80  // 语句覆盖率阈值
    }
  },
  reportsDirectory: './coverage' // 报告输出目录
}
```

## 覆盖率报告类型

### 1. 终端文本报告
- 显示整体覆盖率摘要
- 列出每个文件的覆盖率情况
- 显示未覆盖的行号

### 2. HTML报告 (`coverage/index.html`)
- 可在浏览器中打开
- 提供可交互的覆盖率查看
- 可以深入查看每个文件的详细覆盖情况
- 高亮显示已覆盖和未覆盖的代码行

### 3. JSON报告 (`coverage/coverage-final.json`)
- 机器可读的完整覆盖率数据
- 可用于CI/CD集成

### 4. LCOV报告 (`coverage/lcov.info`)
- 标准格式，可被多种工具识别
- 适合与其他覆盖率工具集成

## 覆盖率指标解释

### 语句覆盖率 (Statement Coverage)
- 测量执行了多少代码语句
- 计算公式：(执行的语句数 / 总语句数) × 100%

### 分支覆盖率 (Branch Coverage)
- 测量执行了多少条件分支
- 包括 if/else、switch/case、三元运算符等

### 函数覆盖率 (Function Coverage)
- 测量调用了多少函数
- 计算公式：(调用的函数数 / 总函数数) × 100%

### 行覆盖率 (Line Coverage)
- 测量执行了多少代码行
- 计算公式：(执行的代码行数 / 总代码行数) × 100%

## 最佳实践

### 1. 测试组织
```typescript
// 为每个模块创建对应的测试文件
src/utils/math.ts → src/utils/__tests__/math.spec.ts
src/components/Button.vue → src/components/__tests__/Button.spec.ts
```

### 2. 测试命名
```typescript
describe('Math Utils', () => {
  describe('add function', () => {
    it('应该正确计算两个正数的和', () => {
      // 测试代码
    })
    
    it('应该正确处理负数', () => {
      // 测试代码
    })
  })
})
```

### 3. 覆盖率目标
- **工具函数**: 90%+ 覆盖率
- **业务逻辑**: 80%+ 覆盖率
- **UI组件**: 70%+ 覆盖率（重点测试逻辑部分）
- **配置文件**: 可以排除在覆盖率统计之外

### 4. 测试边界情况
- 空值处理
- 错误情况
- 边界值
- 异常场景

## 查看覆盖率报告

### 1. 打开HTML报告
```bash
# 运行覆盖率测试后
cd coverage
# 用浏览器打开 index.html
```

### 2. 使用Vitest UI
```bash
npm run test:coverage-ui
# 浏览器会自动打开 http://localhost:51204/__vitest__/
```

## CI/CD集成

### GitHub Actions 示例
```yaml
- name: 运行测试并生成覆盖率
  run: npm run test:coverage

- name: 上传覆盖率报告
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## 常见问题

### 1. 为什么某些文件显示0%覆盖率？
- 文件没有被任何测试导入和执行
- 需要编写相应的测试用例

### 2. 如何提高覆盖率？
- 识别未覆盖的代码行（在HTML报告中以红色标出）
- 为这些代码编写测试用例
- 测试不同的条件分支

### 3. 覆盖率达到100%是否意味着代码没有bug？
- 覆盖率只能告诉您代码是否被执行过
- 高覆盖率不等于高质量的测试
- 还需要关注测试的质量和边界情况

### 4. 应该为所有代码写测试吗？
- 优先为核心业务逻辑编写测试
- 工具函数和纯函数应该有高覆盖率
- 简单的配置文件可以适当降低要求

## 当前项目覆盖率状况

### 数学工具函数 (src/utils/math.ts)
- ✅ 100% 覆盖率
- 完整测试了所有函数和边界情况

### HTTP工具函数 (src/utils/http.ts)
- ⚠️ 30.66% 覆盖率
- 需要添加更多集成测试

### 其他模块
- ❌ 大部分文件为0%覆盖率
- 需要逐步添加测试用例

## 下一步行动计划

1. 为核心工具函数添加完整测试
2. 为主要组件添加基础测试
3. 为业务逻辑控制器添加测试
4. 逐步提高整体覆盖率至目标值 