'use client';

import { useState, FormEvent } from 'react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (!input) return;

    // Thêm tin nhắn của người dùng vào danh sách
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: input },
    ]);

    // Gọi API để nhận phản hồi từ AI
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    const data = await response.json();

    // Thêm tin nhắn của AI vào danh sách (chỉ thêm AI, không thêm người dùng nữa)
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'ai', text: data.reply },
    ]);

    // Xoá input sau khi gửi
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center p-4 text-2xl font-bold shadow-lg">
        AI Chat
      </header>

      {/* Khu vực tin nhắn */}
      <div className="flex-1 p-6 overflow-y-auto bg-white shadow-inner">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`p-4 rounded-lg shadow-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-black'
                } max-w-xs`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hộp nhập liệu */}
      <form onSubmit={handleSendMessage} className="flex p-4 bg-gray-200 shadow-md max-w-2xl mx-auto w-full">
        <input
          type="text"
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="ml-4 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
