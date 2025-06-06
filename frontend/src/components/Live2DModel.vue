<template>
  <!-- Canvas 不再由这个组件创建和管理 -->
  <!-- 这个 div 可以用于定位或添加特定模型的非 Pixi 元素 -->
  <div class="live2d-model-wrapper" :class="containerClass" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed, ref, watch } from 'vue';
import type { Application as PIXIApplication, DisplayObject } from 'pixi.js';
import { initLive2DModel } from '../utils/live2d';
import type { Live2DModel as Live2DModelType } from 'pixi-live2d-display';

// 声明全局变量
declare global {
  interface Window {
    PIXI: typeof import('pixi.js')
    Live2DModel: typeof import('pixi-live2d-display').Live2DModel
  }
}

interface Props {
  app: PIXIApplication; // 接收 PIXI Application
  modelPath?: string;
  initialX?: number;    // 新增: 初始位置 X
  initialY?: number;    // 新增: 初始位置 Y
  scale?: number;
  type?: 'user' | 'partner';
}

const props = withDefaults(defineProps<Props>(), {
  modelPath: '/live2d/miku/runtime/miku.model3.json',
  initialX: 0,
  initialY: 0,
  scale: 0.25,
  type: 'user',
});

const containerClass = computed(() => ({
  'live2d-user-model': props.type === 'user',
  'live2d-partner-model': props.type === 'partner',
  // 添加一个通用类名方便样式控制
  'live2d-model-instance': true 
}));

const live2dModelInstance = ref<Live2DModelType | null>(null);

onMounted(async () => {
  if (props.app && props.app.stage) { // 确保 app 和 app.stage 存在
    try {
      const model = await initLive2DModel({
        app: props.app,
        modelPath: props.modelPath,
        position: {
          scale: props.scale,
          x: props.initialX,
          y: props.initialY,
        }
      });
      live2dModelInstance.value = model;
    } catch (error) {
      console.error(`初始化 ${props.type} Live2D 模型失败:`, error);
    }
  }
});

onBeforeUnmount(() => {
  if (live2dModelInstance.value) {
    if (props.app && props.app.stage) { // 确保 app 和 app.stage 仍然存在
        props.app.stage.removeChild(live2dModelInstance.value as unknown as DisplayObject);
    }
    live2dModelInstance.value.destroy(); // 销毁模型自身资源
    live2dModelInstance.value = null;
  }
});

watch(() => props.scale, (newScale) => {
  if (live2dModelInstance.value && newScale !== undefined) {
    live2dModelInstance.value.scale.set(newScale);
  }
});

watch(() => [props.initialX, props.initialY], ([newX, newY]) => {
  if (live2dModelInstance.value) {
    if (newX !== undefined) live2dModelInstance.value.x = newX;
    if (newY !== undefined) live2dModelInstance.value.y = newY;
  }
});

// 暴露方法给父组件，用于独立控制，例如播放动画
const playMotion = (motionGroup: string, motionIndex?: number) => {
  if (live2dModelInstance.value) {
    live2dModelInstance.value.motion(motionGroup, motionIndex);
  }
};

const setExpression = (expressionId?: string | number) => {
  if (live2dModelInstance.value) {
    live2dModelInstance.value.expression(expressionId);
  }
};

// 销毁方法
const destroy = () => {
  try {
    if (live2dModelInstance.value) {
      // 确保在销毁前检查父容器是否存在
      if (props.app && props.app.stage && live2dModelInstance.value.parent) {
        props.app.stage.removeChild(live2dModelInstance.value as unknown as DisplayObject);
      }
      
      // 销毁模型资源
      live2dModelInstance.value.destroy();
      live2dModelInstance.value = null;
      
      console.log(`Live2D模型 ${props.type} 已安全销毁`);
    }
  } catch (error) {
    console.error(`Live2D模型 ${props.type} 销毁时出错:`, error);
  }
};

defineExpose({
  playMotion,
  setExpression,
  destroy,
  getModel: () => live2dModelInstance.value // 可以暴露模型实例本身以进行更细致的控制
});

</script>

<style scoped>
.live2d-model-wrapper {
  /* 这个 div 本身不显示，只是一个逻辑包装器或用于非 Pixi 的 DOM 元素 */
  position: absolute; /* 如果需要相对于父元素进行定位控制 */
  /* width: 0; height: 0; */ /* 避免干扰布局 */
}

/* 可以为不同类型的模型添加一些特定的占位符样式（如果需要） */
.live2d-user-model {
  z-index: 1; /* 用户模型层级 */
}

.live2d-partner-model {
  z-index: 2; /* 对方模型层级 */
}
</style>