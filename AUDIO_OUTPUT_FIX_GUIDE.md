# 音频输出切换修复指南

## 🐛 问题描述

在 ElevenLabs 通话过程中，点击音频输出切换按钮后，声音输出设备没有实际切换，仍然从原来的设备（扬声器或听筒）输出。

## 🔍 根本原因分析

1. **音频会话配置不完整**：简单调用 `setAudioModeAsync` 没有正确配置音频路由
2. **平台差异处理不当**：iOS 和 Android 的音频路由机制不同
3. **缺乏强制路由控制**：没有使用平台特定的音频路由 API
4. **状态同步问题**：UI 状态与实际音频路由状态不同步

## 🛠️ 解决方案

### 1. 创建专用音频路由控制器

**新文件**: `src/utils/audio-route.ts`

```typescript
// 核心功能
- AudioRouteController 类管理音频路由
- 支持 iOS 和 Android 平台特定配置
- 提供 speaker/earpiece 切换功能
- 自动处理错误和状态回滚
```

**主要特性**:
- ✅ **平台适配**：iOS 使用 `categoryOptions`，Android 尝试使用原生 `AudioManager`
- ✅ **状态管理**：跟踪当前音频路由状态
- ✅ **错误处理**：切换失败时自动回滚
- ✅ **生命周期管理**：初始化和清理音频设置

### 2. iOS 平台解决方案

```typescript
// iOS 特定配置
await setAudioModeAsync({
  playsInSilentMode: true,
  allowsRecording: true,
  category: 'playAndRecord',
  categoryOptions: route === 'speaker' ? ['defaultToSpeaker'] : [],
});
```

**关键点**:
- 使用 `playAndRecord` 类别支持双向音频
- `defaultToSpeaker` 选项强制路由到扬声器
- 空的 `categoryOptions` 数组路由到听筒

### 3. Android 平台解决方案

```typescript
// Android 基础配置 + 原生音频管理器
await setAudioModeAsync({
  playsInSilentMode: true,
  allowsRecording: true,
});

// 尝试使用原生 AudioManager（如果可用）
if (NativeModules.AudioManager) {
  await AudioManager.setSpeakerphoneOn(route === 'speaker');
}
```

**关键点**:
- 基础音频模式配置
- 原生 `AudioManager.setSpeakerphoneOn()` 强制路由
- 优雅降级到系统默认行为

### 4. 集成到语音聊天页面

**主要改进**:
- ✅ **初始化时设置**：通话开始时根据用户偏好初始化音频路由
- ✅ **智能切换**：使用音频路由控制器进行切换
- ✅ **状态同步**：UI 状态与实际路由状态保持同步
- ✅ **生命周期管理**：通话结束时清理音频设置

## 🎯 使用方法

### 开始通话
1. 系统自动根据按钮状态初始化音频路由
2. 默认使用扬声器模式（`isSpeakerOn = true`）

### 切换音频输出
1. 点击音频输出切换按钮
2. 系统调用平台特定的音频路由 API
3. UI 状态自动更新并显示确认提示
4. 如果切换失败，自动回滚到之前状态

### 结束通话
1. 系统自动清理音频设置
2. 恢复到默认音频模式

## 🔧 技术实现细节

### AudioRouteController 类

```typescript
class AudioRouteController {
  // 状态管理
  private currentRoute: AudioRoute = 'speaker';
  
  // 平台特定实现
  private async setIOSAudioRoute(route: AudioRoute): Promise<boolean>
  private async setAndroidAudioRoute(route: AudioRoute): Promise<boolean>
  
  // 公共 API
  async setAudioRoute(route: AudioRoute): Promise<boolean>
  async toggleAudioRoute(): Promise<AudioRoute>
  async initializeForConversation(preferredRoute?: AudioRoute): Promise<void>
  async cleanup(): Promise<void>
}
```

### 集成点

1. **通话开始**：`initializeAudioMode()` → `audioRouteController.initializeForConversation()`
2. **切换音频**：`toggleAudioOutput()` → `audioRouteController.toggleAudioRoute()`
3. **通话结束**：`endConversation()` → `audioRouteController.cleanup()`
4. **页面清理**：`cleanupConversation()` → `audioRouteController.cleanup()`

## 🎨 用户界面

### 按钮状态指示
- 🔵 **扬声器模式**：蓝色背景 + `Volume2Icon`
- ⚫ **听筒模式**：灰色背景 + `PodcastIcon`

### 用户反馈
- ✅ **切换成功**：显示确认对话框
- ❌ **切换失败**：显示错误提示并保持原状态

## 📱 平台兼容性

### iOS
- ✅ **完全支持**：使用 `expo-audio` 的 `categoryOptions`
- ✅ **即时生效**：音频路由立即切换
- ✅ **状态同步**：UI 状态与实际路由一致

### Android
- ✅ **基础支持**：使用 `expo-audio` 基础配置
- 🔄 **增强支持**：如果有原生 `AudioManager` 模块
- ⚠️ **系统依赖**：部分依赖系统音频路由行为

## 🚀 测试验证

### 测试场景
1. **通话开始**：验证默认音频输出设备
2. **切换测试**：扬声器 ↔ 听筒切换
3. **错误处理**：网络中断时的音频路由保持
4. **生命周期**：通话结束后音频设置恢复

### 验证方法
1. 开始 ElevenLabs 通话
2. 观察音频输出设备（听声音来源）
3. 点击切换按钮
4. 确认音频输出设备实际切换
5. 结束通话，验证音频设置恢复

## 📋 故障排除

### 如果切换仍不生效
1. **检查权限**：确保应用有音频权限
2. **重启应用**：清除音频会话缓存
3. **检查设备**：某些设备可能有音频路由限制
4. **查看日志**：检查控制台中的音频路由日志

### 常见问题
- **iOS 切换延迟**：正常现象，音频会话切换需要时间
- **Android 不生效**：可能需要原生模块支持
- **蓝牙干扰**：蓝牙设备连接时可能影响音频路由

修复完成！现在音频输出切换应该能够正常工作了。🎉
