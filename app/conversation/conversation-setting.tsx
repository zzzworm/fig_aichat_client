import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper, ActionsheetItem, ActionsheetItemText } from '@/components/ui/actionsheet';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { CheckIcon, ChevronRightIcon, Icon } from '@/components/ui/icon';
import { Menu, MenuItem, MenuItemLabel } from '@/components/ui/menu';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useConversationSettingStore } from '@/src/conversation/store/conversationsetting.store';
import React from 'react';

// Reuse PickerModal implementation from profile/edit.tsx
interface PickerModalProps<T> {
  visible: boolean;
  title: string;
  items: readonly T[];
  selectedValue: T;
  onClose: () => void;
  onSelect: (item: T) => void;
  renderItemLabel: (item: T) => string;
}
function PickerModal<T>({ visible, title, items, selectedValue, onClose, onSelect, renderItemLabel }: PickerModalProps<T>) {
  return (
    <Actionsheet isOpen={visible} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <ActionsheetItem isDisabled={true}>
          <ActionsheetItemText className="font-bold text-center">{title}</ActionsheetItemText>
        </ActionsheetItem>
        {items.map((item) => (
          <ActionsheetItem key={String(item)} onPress={() => onSelect(item)}>
            <HStack className="w-full justify-between items-center">
              <ActionsheetItemText>{renderItemLabel(item)}</ActionsheetItemText>
              {selectedValue === item && <Icon as={CheckIcon} className="text-typography-500 m-2 w-4 h-4" />}
            </HStack>
          </ActionsheetItem>
        ))}
        <ActionsheetItem onPress={onClose} className="mt-2 border-t border-gray-200">
          <ActionsheetItemText className="text-center text-blue-500">Cancel</ActionsheetItemText>
        </ActionsheetItem>
      </ActionsheetContent>
    </Actionsheet>
  );
}

const LANGUAGE_OPTIONS = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
];

const ConversationSettingScreen = () => {
  // State management
  const {
    language,
    speed,
    autoSpeech,
    setLanguage,
    setSpeed,
    setAutoSpeech,
  } = useConversationSettingStore();

  return (
    <VStack space="xl" className="flex-1 bg-background-0 p-6">
      {/* Group 1: Conversation language, reading speed */}
      <VStack space="md" className="bg-background-50 rounded-xl p-4">
        <Text bold size="lg">Conversation Settings</Text>
        {/* Conversation language */}
        <HStack className="justify-between items-center py-2">
          <Text>Conversation Language</Text>
          <Menu
            trigger={triggerProps => (
              <Button
                variant="outline"
                size="sm"
                {...triggerProps}
                // onPress controlled by triggerProps
              >
                <ButtonText>{LANGUAGE_OPTIONS.find(opt => opt.value === language)?.label}</ButtonText>
                <Icon as={ChevronRightIcon} size="sm" />
              </Button>
            )}
            
          >
            {LANGUAGE_OPTIONS.map(opt => (
              <MenuItem key={opt.value} onPress={() => setLanguage(opt.value)}>
                <MenuItemLabel bold={language === opt.value}>{opt.label}</MenuItemLabel>
                {language === opt.value && <Icon as={CheckIcon} size="sm" className="ml-2" />}
              </MenuItem>
            ))}
          </Menu>
        </HStack>
        <Divider />
        <HStack className="justify-between items-center py-2">
          <Text>Auto Speech</Text>
          <Switch value={autoSpeech} onValueChange={setAutoSpeech} size="md" />
        </HStack>
      </VStack>
    </VStack>
  );
};

export default ConversationSettingScreen;
