import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { HStack } from "@/components/ui/hstack";
import { useConversation } from "@elevenlabs/react-native";
import type {
  ConversationStatus,
  ConversationEvent,
  Role,
} from "@elevenlabs/react-native";
import { getBatteryLevel, changeBrightness, flashScreen } from "@/src/utils/tools";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useAICharacterStore } from "@/src/conversation/store/character.store";
import { AICharacter } from "@/src/conversation/types/character";
import HoldRecordButton from "@/components/common/HoldRecordButton";
import speechanalysisService from "@/src/api/speechanalysis.service";
import { PhoneIcon, PhoneOffIcon } from "lucide-react-native";

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
          // Check if there is audio content
        //   if ('audio' in message && message.audio) {
        //     console.log(`🎵 AI audio received:`, message.audio);
        //   }
          // Check message type
        //   if ('type' in message && message.type) {
        //     console.log(`📝 AI message type: ${message.type}`, message);
        //   }
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
  
    // Handle voice transcription completion
    const handleRecordingComplete = async (uri: string | null) => {
      if (!uri) {
        console.warn('Recording failed, no audio file obtained');
        Alert.alert('Recording Failed', 'Failed to obtain audio file, please try again');
        return;
      }

    //   console.log('Recording completed, starting transcription:', uri);

      try {
        // Call transcription API
        const result = await speechanalysisService.transcribe(uri);
        console.log('💬 User says:', result.transcription);
        
        // Send transcription result to conversation
        if (result.transcription && result.transcription.trim()) {
          setIsProcessing(true); // Set Processing state
          conversation.sendUserMessage(result.transcription.trim());
          
          // Show transcription success prompt
          if (result.confidence && result.confidence > 0.8) {
            console.log(`Transcription successful, confidence: ${(result.confidence * 100).toFixed(1)}%`);
          }
        }
      } catch (error) {
        console.error('Transcription failed:', error);
        const errorMsg = error instanceof Error ? error.message : 'Transcription failed, please try again';
        
        Alert.alert('Transcription Failed', errorMsg);
        setIsProcessing(false); // Reset Processing state on error
      }
    };
  
    const startConversation = async () => {
      if (isStarting || !character) return;
  
      setIsStarting(true);
      try {
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
      } catch (error) {
        console.error("Failed to end conversation:", error);
      }
    };

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
        <View className="absolute bottom-5 left-0 right-0">
          <HStack space="md" className="justify-center items-center">
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

            {/* Voice Input Button - Only show when connected with animation */}
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
                  <HoldRecordButton className="h-20" onRecordingComplete={handleRecordingComplete} />
              )}
            </Animated.View>
          </HStack>
        </View>
        </View>
    );
  };
  

export default VoiceChatScreen;