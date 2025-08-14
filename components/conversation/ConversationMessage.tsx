import { BottomInputBar } from "@/components/common/BottomInputBar";
import { VStack } from "@/components/ui/vstack";
import '@/global.css';
import { SendIcon } from "lucide-react-native";
import React, { useEffect, useState } from 'react';
import { IMessage, InputToolbarProps, Send, SendProps } from "react-native-gifted-chat";
import MarkdownDisplay from "react-native-markdown-display";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';



const MessageText = (props: any) => {
  const { position = 'left', containerStyle, currentMessage, isNew } = props;
  //const style = containerStyle?.[position];
  const [displayedText, setDisplayedText] = useState(currentMessage?.text ?? '');

  useEffect(() => {
    if (isNew && currentMessage?.user?._id !== 1) {
      const fullText = currentMessage?.text ?? '';
      const duration = 1500; // 1.5 seconds
      let startTime = Date.now();
      let intervalId: any;

      const updateText = () => {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= duration) {
          setDisplayedText(fullText);
          clearInterval(intervalId);
          return;
        }
        const textLength = Math.floor((elapsedTime / duration) * fullText.length);
        setDisplayedText(fullText.substring(0, textLength));
      };

      intervalId = setInterval(updateText, 40);

      return () => clearInterval(intervalId);
    } else {
      setDisplayedText(currentMessage?.text ?? '');
    }
  }, [currentMessage?.text, isNew, currentMessage?.user?._id]);

  return (
    <VStack className="m-2 shrink overflow-hidden">
      <MarkdownDisplay>
        {displayedText}
      </MarkdownDisplay>
    </VStack>
  );
};

const renderMessageText = (props: any) => <MessageText {...props} />;

const renderSend = (props: SendProps<IMessage>) => {
  return (
    <Send {...props} containerStyle={{ justifyContent: 'center', paddingHorizontal: 10 }}>
      <SendIcon size={30} color="blue" />
    </Send>
  )
}

const renderInputToolbar = (props: InputToolbarProps<IMessage>) => {
  const { onSend, ...rest } = props;
  return (
    <BottomInputBar onSubmit={(query) => {
      const message: IMessage = {
        _id: uuidv4(),
        text: query,
        createdAt: new Date(),
        user: {
          _id: 1,
        },
      };
      onSend([message]);
    }} {...rest} />
  )
}

export { renderInputToolbar, renderMessageText, renderSend };

