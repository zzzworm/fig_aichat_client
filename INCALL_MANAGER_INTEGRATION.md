# React Native InCallManager 集成指南

## 🎯 概述

已成功集成 `react-native-incall-manager` 到 `AudioRouteController`，提供更可靠的音频输出切换功能。InCallManager 是专门为处理通话期间音频路由而设计的库，能够更好地控制扬声器和听筒之间的切换。

## 🔧 主要改进

### 1. 使用 InCallManager 的音频会话管理

```typescript
// 启动通话音频会话
InCallManager.start({ media: 'audio' });

// 切换到扬声器
InCallManager.setSpeakerphoneOn(true);

// 切换到听筒
InCallManager.setSpeakerphoneOn(false);

// 停止通话音频会话
InCallManager.stop();
```

### 2. 增强的 AudioRouteController

#### 新增功能
- ✅ **通话会话管理**：自动启动/停止 InCall 音频会话
- ✅ **状态跟踪**：跟踪通话会话是否活跃
- ✅ **错误恢复**：音频路由刷新机制
- ✅ **智能初始化**：根据需要自动初始化会话

#### 核心方法
```typescript
class AudioRouteController {
  // 通话会话管理
  private async startInCallSession(): Promise<void>
  private async stopInCallSession(): Promise<void>
  
  // 音频路由控制
  async setAudioRoute(route: AudioRoute): Promise<boolean>
  async toggleAudioRoute(): Promise<AudioRoute>
  
  // 状态查询
  isInCallActive(): boolean
  getCurrentRoute(): AudioRoute
  
  // 错误恢复
  async refreshAudioRoute(): Promise<boolean>
}
```

## 🚀 使用方法

### 1. 通话开始时
```typescript
// 自动初始化通话音频会话和路由
await audioRouteController.initializeForConversation('speaker');
```

### 2. 切换音频输出
```typescript
// 智能切换，自动检查会话状态
const newRoute = await audioRouteController.toggleAudioRoute();
```

### 3. 通话结束时
```typescript
// 自动清理通话会话和音频设置
await audioRouteController.cleanup();
```

## 🔄 工作流程

### 通话开始流程
1. **初始化会话**：`InCallManager.start({ media: 'audio' })`
2. **设置音频路由**：根据用户偏好设置扬声器/听筒
3. **状态跟踪**：标记会话为活跃状态

### 音频切换流程
1. **检查会话**：确保 InCall 会话处于活跃状态
2. **执行切换**：`InCallManager.setSpeakerphoneOn(true/false)`
3. **更新状态**：同步 UI 状态和内部状态
4. **错误恢复**：如果失败，尝试刷新音频路由

### 通话结束流程
1. **停止会话**：`InCallManager.stop()`
2. **清理状态**：重置内部状态标志
3. **可选清理**：重置 expo-audio 设置（非关键）

## 🛡️ 错误处理和恢复

### 智能会话检查
```typescript
if (!audioRouteController.isInCallActive()) {
  console.warn('⚠️ InCall session not active, initializing...');
  await audioRouteController.initializeForConversation(currentRoute);
}
```

### 自动恢复机制
```typescript
try {
  await audioRouteController.refreshAudioRoute();
  console.log('🔄 Audio route refreshed as recovery');
} catch (refreshError) {
  console.error('Failed to refresh audio route:', refreshError);
}
```

## 📱 平台兼容性

### iOS
- ✅ **完全支持**：InCallManager 在 iOS 上表现优秀
- ✅ **即时切换**：音频路由立即生效
- ✅ **系统集成**：与 iOS 音频系统完美集成

### Android
- ✅ **完全支持**：InCallManager 提供原生 Android 音频管理
- ✅ **可靠切换**：比之前的方案更可靠
- ✅ **权限处理**：自动处理音频权限

## 🎨 用户体验改进

### 1. 减少用户干扰
- 移除了切换成功的弹窗提示
- 保留了错误提示以便调试

### 2. 视觉状态指示
- 🔵 **扬声器模式**：蓝色背景 + Volume2 图标
- ⚫ **听筒模式**：灰色背景 + Podcast 图标

### 3. 智能状态同步
- UI 状态与实际音频路由保持同步
- 自动检查和恢复会话状态

## 🔍 调试和监控

### 日志输出
```
🎵 Initializing audio for conversation with InCallManager...
📞 InCall audio session started
🔄 Switching audio from speaker to earpiece via InCallManager
📱 Earpiece enabled via InCallManager
🔊 Audio output switched to: earpiece via InCallManager
```

### 状态检查
```typescript
// 检查通话会话状态
const isActive = audioRouteController.isInCallActive();

// 获取当前音频路由
const currentRoute = audioRouteController.getCurrentRoute();
```

## ⚠️ 注意事项

### 1. 库依赖
确保项目中已正确安装和配置 `react-native-incall-manager`：

```bash
npm install react-native-incall-manager
# iOS
cd ios && pod install
# Android 需要在 MainApplication.java 中手动链接（如果使用旧版本）
```

### 2. 权限要求
InCallManager 需要以下权限：
- **iOS**：自动处理音频权限
- **Android**：`MODIFY_AUDIO_SETTINGS` 权限（通常已包含在 app.json 中）

### 3. 最佳实践
- 始终在通话开始时初始化音频会话
- 通话结束时务必清理音频会话
- 使用错误恢复机制处理异常情况

## 🎉 预期效果

集成 `react-native-incall-manager` 后，音频输出切换应该：

1. **立即生效**：点击按钮后音频立即从扬声器/听筒切换
2. **状态同步**：按钮颜色和图标准确反映当前音频输出
3. **可靠性高**：减少切换失败的情况
4. **用户友好**：减少不必要的提示，提供流畅体验

现在您的 ElevenLabs 通话应用应该具有可靠的音频输出切换功能了！🎉
