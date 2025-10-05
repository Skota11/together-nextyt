import { ChatMessageEvent, ChatMessageEventType, Message } from '@ably/chat';
import { useMessages } from '@ably/chat/react';
import { User } from '@heroui/user';
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';

interface MessageMetadata {
  username?: string;
}

export function Chat({username}: {username?: string}) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const { sendMessage } = useMessages({
    listener: (event: ChatMessageEvent) => {
      const message = event.message;
      switch (event.type) {
        case ChatMessageEventType.Created: {
          // Add the new message to the list
          setMessages((prevMessages) => [...prevMessages, message]);
          break;
        }
        default: {
          break;
        }
      }
    }
  });

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage({ text: inputValue.trim() , metadata : {username : username} }).catch((err) =>
      console.error('Error sending message', err))
    setInputValue('');
  };

  return (
  <div className="flex flex-col w-full h-[300px] item-left overflow-hidden mx-auto">
    <div className="flex-1 p-4 overflow-y-auto space-y-2">
      {messages.map((msg: Message) => {
        const data = new Date(msg.timestamp).toLocaleTimeString();
        const metadata = msg.metadata as MessageMetadata;
        return (
          <div key={msg.serial}>
            <User name={metadata.username} description={data}/>
            <p>{msg.text}</p>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
    <div className="flex items-center px-2 mt-auto mb-2 gap-x-2">
      <Input
        type="text"
        placeholder="メッセージを入力"
        className=""
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleSend();
          }
        }}
      />
      <Button
        variant='solid'
        color='primary'
        onClick={handleSend}
      >
        送信
      </Button>
    </div>
  </div>
  );
}