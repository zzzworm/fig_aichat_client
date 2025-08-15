/**
 * Audio Route Control Utility
 * 
 * This utility provides methods to control audio output routing
 * for better ElevenLabs conversation experience.
 */

import { setAudioModeAsync } from 'expo-audio';
import InCallManager from 'react-native-incall-manager';

export type AudioRoute = 'speaker' | 'earpiece';

class AudioRouteController {
  private currentRoute: AudioRoute = 'speaker';
  private isInCallStarted: boolean = false;

  /**
   * Set audio output route using InCallManager
   */
  async setAudioRoute(route: AudioRoute): Promise<boolean> {
    try {
      console.log(`🔄 Setting audio route to: ${route}`);
      
      if (route === 'speaker') {
        // 切换到扬声器
        InCallManager.setSpeakerphoneOn(true);
        console.log('📢 Speakerphone enabled via InCallManager');
      } else {
        // 切换到听筒
        InCallManager.setSpeakerphoneOn(false);
        console.log('📱 Earpiece enabled via InCallManager');
      }

      // 更新当前路由状态
      this.currentRoute = route;
      
      return true;
    } catch (error) {
      console.error('Failed to set audio route via InCallManager:', error);
      return false;
    }
  }

  /**
   * Start in-call audio session
   */
  private async startInCallSession(): Promise<void> {
    try {
      if (!this.isInCallStarted) {
        // 启动通话音频会话
        InCallManager.start({ media: 'audio' });
        this.isInCallStarted = true;
        console.log('📞 InCall audio session started');
        
        // 设置初始音频路由
        await this.setAudioRoute(this.currentRoute);
      }
    } catch (error) {
      console.error('Failed to start InCall session:', error);
    }
  }

  /**
   * Stop in-call audio session
   */
  private async stopInCallSession(): Promise<void> {
    try {
      if (this.isInCallStarted) {
        InCallManager.stop();
        this.isInCallStarted = false;
        console.log('📞 InCall audio session stopped');
      }
    } catch (error) {
      console.error('Failed to stop InCall session:', error);
    }
  }

  /**
   * Get current audio route
   */
  getCurrentRoute(): AudioRoute {
    return this.currentRoute;
  }

  /**
   * Toggle between speaker and earpiece
   */
  async toggleAudioRoute(): Promise<AudioRoute> {
    const newRoute: AudioRoute = this.currentRoute === 'speaker' ? 'earpiece' : 'speaker';
    const success = await this.setAudioRoute(newRoute);
    
    if (!success) {
      // If setting failed, revert to previous state
      console.warn('Audio route toggle failed, staying on:', this.currentRoute);
    }
    
    return this.currentRoute;
  }

  /**
   * Initialize audio for conversation
   */
  async initializeForConversation(preferredRoute: AudioRoute = 'speaker'): Promise<void> {
    console.log('🎵 Initializing audio for conversation with InCallManager...');
    
    try {
      // 设置首选路由
      this.currentRoute = preferredRoute;
      
      // 启动通话音频会话
      await this.startInCallSession();
      
      console.log(`🎵 Audio initialized with route: ${this.currentRoute}`);
    } catch (error) {
      console.error('Failed to initialize conversation audio:', error);
    }
  }

  /**
   * Cleanup audio settings
   */
  async cleanup(): Promise<void> {
    try {
      // 停止通话音频会话
      await this.stopInCallSession();
      
      // 重置到默认音频模式（可选）
      try {
        await setAudioModeAsync({
          playsInSilentMode: false,
          allowsRecording: false,
        });
      } catch (error) {
        // expo-audio 重置失败不是致命错误
        console.warn('expo-audio cleanup failed:', error);
      }
      
      console.log('🧹 Audio settings cleaned up');
    } catch (error) {
      console.error('Audio cleanup failed:', error);
    }
  }

  /**
   * Check if in-call session is active
   */
  isInCallActive(): boolean {
    return this.isInCallStarted;
  }

  /**
   * Force refresh audio route (useful for recovering from errors)
   */
  async refreshAudioRoute(): Promise<boolean> {
    console.log('🔄 Refreshing audio route...');
    return await this.setAudioRoute(this.currentRoute);
  }
}

// Export singleton instance
export const audioRouteController = new AudioRouteController();

// Export utility functions
export const setAudioRoute = (route: AudioRoute) => audioRouteController.setAudioRoute(route);
export const toggleAudioRoute = () => audioRouteController.toggleAudioRoute();
export const getCurrentAudioRoute = () => audioRouteController.getCurrentRoute();
export const initializeAudioForConversation = (route?: AudioRoute) => 
  audioRouteController.initializeForConversation(route);
export const cleanupAudio = () => audioRouteController.cleanup();
export const isInCallActive = () => audioRouteController.isInCallActive();
export const refreshAudioRoute = () => audioRouteController.refreshAudioRoute();
