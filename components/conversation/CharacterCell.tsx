import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { AICharacter } from '@/src/conversation/types/character';
import React from 'react';

interface CharacterCellProps {
  aiCharacter: AICharacter;
}

export const CharacterCell: React.FC<CharacterCellProps> = ({ aiCharacter }) => {
  return (
    <Box className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden mx-4 my-3 border border-gray-100 dark:border-gray-700">
      <HStack className="p-6 items-center">
        <VStack className="flex-1 mr-4">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
            {aiCharacter.name}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed" numberOfLines={2}>
            {aiCharacter.introduce}
          </Text>
        </VStack>
        <Box className="w-16 h-16 rounded-2xl overflow-hidden bg-blue-50 dark:bg-gray-700 border-2 border-blue-200 dark:border-gray-600">
          <Image
            source={{ uri: aiCharacter.coverUrl }}
            className="w-full h-full"
            resizeMode="cover"
            alt={aiCharacter.name}
          />
        </Box>
      </HStack>
    </Box>
  );
};
