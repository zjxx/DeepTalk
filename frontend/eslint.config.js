import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      // Live2D 相关文件
      "public/live2d/**",
      "public/runtime/**",
      // 其他常见需要忽略的文件
      "node_modules/**",
      "dist/**"
    ]
  },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  { 
    files: ["**/*.vue"], 
    languageOptions: { 
      parserOptions: { 
        parser: tseslint.parser 
      } 
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off"
    }
  },
]);
