import { HStack } from "@/components/ui/hstack";
import { useAICharacterStore } from "@/src/conversation/store/character.store";
import { AICharacter } from "@/src/conversation/types/character";
import { AudioRoute, audioRouteController } from "@/src/utils/audio-route";
import { changeBrightness, flashScreen, getBatteryLevel } from "@/src/utils/tools";
import type {
  ConversationEvent,
  ConversationStatus,
  Role,
} from "@elevenlabs/react-native";
import { useConversation } from "@elevenlabs/react-native";
import { useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { PhoneIcon, PhoneOffIcon, PodcastIcon, Volume2Icon } from "lucide-react-native";
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const VoiceChatScreen = () => {
    const params = useLocalSearchParams();
    const navigation = useNavigation();
    const { aiCharacterList, fetchAICharacters } = useAICharacterStore();
    const [character, setCharacter] = useState<AICharacter | null>(null);

    // Fetch AI characters on component mount
    useEffect(() => {
        if (aiCharacterList.length === 0) {
            fetchAICharacters();
        }
    }, [fetchAICharacters, aiCharacterList]);

    // Find character by documentId from route params
    useEffect(() => {
        if (params.id && aiCharacterList.length > 0) {
            const foundCharacter = aiCharacterList.find(
                (char) => char.documentId === params.id
            );
            if (foundCharacter) {
                setCharacter(foundCharacter);
            } else {
                console.error(`Character with documentId ${params.id} not found`);
            }
        }
    }, [params.id, aiCharacterList]);

    // Set navigation title to character's name
    useLayoutEffect(() => {
        if (character) {
            navigation.setOptions({
                title: character.name
            });
        }
    }, [character, navigation]);

    const conversation = useConversation({
      clientTools: {
        getBatteryLevel,
        changeBrightness: changeBrightness as any,
        flashScreen,
      },
      onConnect: ({ conversationId }: { conversationId: string }) => {
        console.log("✅ Connected to conversation", conversationId);
      },
      onDisconnect: (details: string) => {
        console.log("❌ Disconnected from conversation", details);
      },
      onError: (message: string, context?: Record<string, unknown>) => {
        console.error("❌ Conversation error:", message, context);
      },
      onMessage: ({
        message,
        source,
      }: {
        message: ConversationEvent;
        source: Role;
      }) => {
        // Filter out ping type messages, don't print
        if (message && typeof message === 'object' && 'type' in message && message.type === 'ping') {
          return;
        }
        
        // Listen for AI speech content
        if (source === 'ai' && message && typeof message === 'object') {
          // Check if there is agent_response content
          if ('agent_response_event' in message && 
              message.agent_response_event && 
              typeof message.agent_response_event === 'object' &&
              'agent_response' in message.agent_response_event &&
              typeof message.agent_response_event.agent_response === 'string' &&
              message.agent_response_event.agent_response.trim()) {
            
            const aiText = message.agent_response_event.agent_response.trim();
            console.log(`🤖 AI says: "${aiText}"`);
            setAiSpeechText(aiText);
          }
          // check for user transcript
          if ('user_transcription_event' in message && 
              message.user_transcription_event && 
              typeof message.user_transcription_event === 'object' &&
              'user_transcript' in message.user_transcription_event &&
              typeof message.user_transcription_event.user_transcript === 'string' &&
              message.user_transcription_event.user_transcript.trim()) {
            const userText = message.user_transcription_event.user_transcript.trim();
            console.log(`👤 User says: "${userText}"`);
          }
        }
        
        // console.log(`💬 Message from ${source}:`, message);
      },
      onModeChange: ({ mode }: { mode: "speaking" | "listening" }) => {
        // console.log(`🔊 Mode: ${mode}`);
      },
      onStatusChange: ({ status }: { status: ConversationStatus }) => {
        console.log(`📡 Status: ${status}`);
      },
      onCanSendFeedbackChange: ({
        canSendFeedback,
      }: {
        canSendFeedback: boolean;
      }) => {
        console.log(`🔊 Can send feedback: ${canSendFeedback}`);
      },
    });

    const [isStarting, setIsStarting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [voiceButtonAnimation] = useState(new Animated.Value(0));
    const [aiSpeechText, setAiSpeechText] = useState<string>("");
    const [isSpeakerOn, setIsSpeakerOn] = useState(true); // 音频输出状态：true=扬声器，false=听筒

    // Listen for AI speaking state changes, reset Processing state
    useEffect(() => {
        if (conversation.isSpeaking && isProcessing) {
            setIsProcessing(false);
        }
    }, [conversation.isSpeaking, isProcessing]);

    // Listen for conversation state changes, control voice button animation
    useEffect(() => {
        if (conversation.status === "connected") {
            // Show voice button animation
            Animated.timing(voiceButtonAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            // Hide voice button animation
            Animated.timing(voiceButtonAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [conversation.status, voiceButtonAnimation]);
  
    // 切换音频输出设备（扬声器/听筒）
    const toggleAudioOutput = async () => {
      try {
        // 检查通话会话是否活跃
        if (!audioRouteController.isInCallActive()) {
          console.warn('⚠️ InCall session not active, initializing...');
          await audioRouteController.initializeForConversation(isSpeakerOn ? 'speaker' : 'earpiece');
        }

        const currentRoute = audioRouteController.getCurrentRoute();
        const newRoute: AudioRoute = currentRoute === 'speaker' ? 'earpiece' : 'speaker';
        
        console.log(`🔄 Switching audio from ${currentRoute} to ${newRoute} via InCallManager`);
        
        // 使用音频路由控制器切换
        const actualRoute = await audioRouteController.toggleAudioRoute();
        
        // 更新 UI 状态
        setIsSpeakerOn(actualRoute === 'speaker');
        
        console.log(`🔊 Audio output switched to: ${actualRoute} via InCallManager`);
        
        
      } catch (error) {
        console.error('Failed to toggle audio output via InCallManager:', error);
        
        // 尝试刷新音频路由作为恢复措施
        try {
          await audioRouteController.refreshAudioRoute();
          console.log('🔄 Audio route refreshed as recovery');
        } catch (refreshError) {
          console.error('Failed to refresh audio route:', refreshError);
        }
        
        Alert.alert('Audio Output', 'Failed to switch audio output device. Please try again.');
      }
    };
  
    // 初始化音频模式
    const initializeAudioMode = async () => {
      try {
        const preferredRoute: AudioRoute = isSpeakerOn ? 'speaker' : 'earpiece';
        await audioRouteController.initializeForConversation(preferredRoute);
        console.log(`🎵 Audio mode initialized with output: ${preferredRoute}`);
      } catch (error) {
        console.error('Failed to initialize audio mode:', error);
      }
    };

    const startConversation = async () => {
      if (isStarting || !character) return;
  
      setIsStarting(true);
      try {
        // 初始化音频模式
        await initializeAudioMode();
        
        await conversation.startSession({
          agentId: character.agentId,
          dynamicVariables: {
            platform: Platform.OS,
          },
        });
      } catch (error) {
        console.error("Failed to start conversation:", error);
      } finally {
        setIsStarting(false);
      }
    };
  
    const endConversation = async () => {
      try {
        await conversation.endSession();
        // 清理音频设置
        await audioRouteController.cleanup();
      } catch (error) {
        console.error("Failed to end conversation:", error);
      }
    };

    // Cleanup function to end conversation when leaving the screen
    const cleanupConversation = useCallback(async () => {
      if (conversation.status === "connected") {
        console.log("🔄 Cleaning up conversation before navigation...");
        try {
          await conversation.endSession();
          // 清理音频设置
          await audioRouteController.cleanup();
        } catch (error) {
          console.error("Failed to cleanup conversation:", error);
        }
      }
    }, [conversation]);

    // Handle navigation events (back button, gesture, etc.)
    useFocusEffect(
      useCallback(() => {
        const onBeforeRemove = (e: any) => {
          // If conversation is not connected, allow navigation
          if (conversation.status !== "connected") {
            return;
          }

          // Prevent default behavior of leaving the screen
          e.preventDefault();

          // Show confirmation alert
          Alert.alert(
            'End Voice Chat?',
            'You are currently in a voice conversation. Do you want to end the conversation and leave?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  console.log('User cancelled navigation');
                },
              },
              {
                text: 'End & Leave',
                style: 'destructive',
                onPress: async () => {
                  console.log('User confirmed to end conversation and leave');
                  await cleanupConversation();
                  // Dispatch the action again to actually leave
                  navigation.dispatch(e.data.action);
                },
              },
            ]
          );
        };

        // Add the listener
        const unsubscribe = navigation.addListener('beforeRemove', onBeforeRemove);

        // Android hardware back button handler
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
          if (conversation.status === "connected") {
            Alert.alert(
              'End Voice Chat?',
              'You are currently in a voice conversation. Do you want to end the conversation and leave?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: () => {
                    console.log('User cancelled Android back navigation');
                  },
                },
                {
                  text: 'End & Leave',
                  style: 'destructive',
                  onPress: async () => {
                    console.log('User confirmed Android back navigation');
                    await cleanupConversation();
                    navigation.goBack();
                  },
                },
              ]
            );
            return true; // Prevent default back action
          }
          return false; // Allow default back action
        });

        // Cleanup function
        return () => {
          unsubscribe();
          backHandler.remove();
        };
      }, [navigation, conversation.status, cleanupConversation])
    );

    const canStart = conversation.status === "disconnected" && !isStarting && character !== null;
    
    // Calculate whether button should be disabled
    const isButtonDisabled = conversation.status === "disconnected" && !canStart || conversation.status === "connecting";
  
    return (
        <View className="flex-1 justify-center items-center bg-gray-100 p-5">
          <Text className="text-2xl font-bold mb-2 text-gray-800">
            {character ? `${character.name} Voice Chat` : 'Voice Chat'}
          </Text>
          {character && (
            <Text className="text-base text-gray-600 mb-8">
              {character.introduce}
            </Text>
          )}
          {!character && (
            <Text className="text-base text-gray-600 mb-8">
              Loading character information...
            </Text>
          )}

          <View className="flex-row items-center mb-6">
            <View
              className={`w-3 h-3 rounded-full mr-2 ${
                conversation.status === "connected" ? "bg-green-500" :
                conversation.status === "connecting" ? "bg-yellow-500" :
                "bg-red-500"
              }`}
            />
            <Text className="text-base font-medium text-gray-700">
              {conversation.status[0].toUpperCase() + conversation.status.slice(1)}
            </Text>
          </View>

          {/* Speaking Indicator */}
          {conversation.status === "connected" && (
            <View className="flex-row items-center mb-6">
              <View
                className={`w-3 h-3 rounded-full mr-2 ${
                  isProcessing ? "bg-blue-500" :
                  conversation.isSpeaking ? "bg-purple-500" : "bg-gray-300"
                }`}
              />
              <Text
                className={`text-sm font-medium ${
                  isProcessing ? "text-blue-600" :
                  conversation.isSpeaking ? "text-purple-600" : "text-gray-500"
                }`}
              >
                {isProcessing ? "🤔 AI Processing" :
                 conversation.isSpeaking ? "🎤 AI Speaking" : "👂 AI Listening"}
              </Text>
            </View>
          )}

          {/* AI Speech Text Display */}
          {aiSpeechText && conversation.status === "connected" && (
            <View className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Text className="text-sm font-medium text-blue-800 mb-2">
                🤖 AI Said:
              </Text>
              <Text className="text-sm text-blue-700 leading-5">
                {aiSpeechText}
              </Text>
            </View>
          )}

         

          {/* Feedback Buttons */}
          {conversation.status === "connected" &&
            conversation.canSendFeedback && (
              <View className="mt-6 items-center">
                <Text className="text-base font-medium text-gray-700 mb-3">
                  How was that response?
                </Text>
                <View className="flex-row gap-4">
                  <TouchableOpacity
                    className="bg-green-500 py-4 px-8 rounded-lg items-center"
                    onPress={() => conversation.sendFeedback(true)}
                  >
                    <Text className="text-white text-base font-semibold">👍 Like</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-red-500 py-4 px-8 rounded-lg items-center"
                    onPress={() => conversation.sendFeedback(false)}
                  >
                    <Text className="text-white text-base font-semibold">👎 Dislike</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

        {/* Bottom Controls - Conversation Control Button and Voice Input Button */}
        <View className="absolute bottom-5">
          <HStack space="2xl" className="justify-center items-center">
            {/* Conversation Control Button */}
            <TouchableOpacity
              className={`w-20 h-20 rounded-full items-center justify-center ${
                conversation.status === "connected" 
                  ? "bg-red-500" 
                  : "bg-green-500"
              } ${
                isButtonDisabled ? "bg-gray-400" : ""
              }`}
              onPress={conversation.status === "connected" ? endConversation : startConversation}
              disabled={isButtonDisabled}
            >
              {conversation.status === "connected" ? (
                // Hang up icon
                <PhoneOffIcon size={24} color="white" />
              ) : (
                // Phone call icon
                <PhoneIcon size={24} color="white" />
              )}
            </TouchableOpacity>

            {/* Audio Output Toggle Button - Only show when connected with animation */}
            <Animated.View
              style={{
                opacity: voiceButtonAnimation,
                transform: [{
                  scale: voiceButtonAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  })
                }]
              }}
            >
              {conversation.status === "connected" && (
                <TouchableOpacity
                  className={`w-20 h-20 rounded-full items-center justify-center ${
                    isSpeakerOn ? "bg-blue-500" : "bg-gray-500"
                  }`}
                  onPress={toggleAudioOutput}
                >
                  {isSpeakerOn ? (
                    <Volume2Icon size={24} color="white" />
                  ) : (
                    <PodcastIcon size={24} color="white" />
                  )}
                </TouchableOpacity>
              )}
            </Animated.View>
          </HStack>
        </View>
        </View>
    );
  };
  

export default VoiceChatScreen;