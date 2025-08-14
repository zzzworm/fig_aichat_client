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
    <Box className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden my-2 mx-4">
      <HStack className="p-4 items-center">
        <VStack className="flex-1 mr-4">
          <Text className="text-base font-bold text-gray-900 dark:text-white" numberOfLines={1}>
            {aiCharacter.name}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1" numberOfLines={2}>
            {aiCharacter.introduce}
          </Text>
        </VStack>
        <Box className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
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
