import React from 'react';
import { Platform, SafeAreaView as RN_SafeAreaView, ViewStyle } from 'react-native';
import { SafeAreaView as SafeAreaViewProvider } from 'react-native-safe-area-context';

interface CustomSafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  className?: string;
  // 支持其他通用属性
  testID?: string;
  accessibilityLabel?: string;
}

export const SafeAreaView = ({ 
  children, 
  style, 
  className, 
  testID,
  accessibilityLabel,
  ...otherProps 
}: CustomSafeAreaViewProps) => {
  // iOS 使用 React Native 原生的 SafeAreaView
  // Android 使用 react-native-safe-area-context 的 SafeAreaView
  if (Platform.OS === 'ios') {
    return (
      <RN_SafeAreaView 
        style={style} 
        className={className}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        {...otherProps}
      >
        {children}
      </RN_SafeAreaView>
    );
  } else {
    return (
      <SafeAreaViewProvider 
        style={style} 
        className={className}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        {...otherProps}
      >
        {children}
      </SafeAreaViewProvider>
    );
  }
};