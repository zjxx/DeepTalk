# Live2D 模型目录

此目录用于存放 Live2D 模型文件。每个模型应该放在独立的子目录中，例如：

```
models/
  ├── miku/              # 初音未来模型
  │   ├── miku.model3.json
  │   ├── miku.moc3
  │   └── textures/      # 模型贴图
  │
  └── other-model/       # 其他模型
      ├── model.json
      └── textures/
```

## 支持的模型格式

- Cubism 2.1 模型 (.model.json)
- Cubism 3 模型 (.model3.json)
- Cubism 4 模型 (.model3.json)

## 使用说明

1. 将模型文件放在对应的子目录中
2. 在 `Live2DView.vue` 中更新 `modelPath` 路径
3. 确保模型文件包含所有必要的资源（贴图、动作等） 