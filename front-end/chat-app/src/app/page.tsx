'use client';

import { useState, FormEvent, memo } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark as dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import parse, { DOMNode } from 'html-react-parser';
import { Element, Text } from 'domhandler';
import katex from 'katex';
import 'katex/dist/katex.min.css'; // KaTeX CSS

// Định nghĩa kiểu cho các tin nhắn
interface Message {
  role: 'user' | 'assistant';
  content: string;
  htmlContent?: string; // Thêm trường này để lưu HTML đã chuyển đổi
}

// Hàm này để render mã code với SyntaxHighlighter
const renderHTMLWithCodeHighlighting = (gptContent: string) => {
  // console.log("Noi dung ban dau : --> ", gptContent);
  gptContent = gptContent.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, '\\[ $1 \\]');
  const katexContent = gptContent.replace(/\\\((.*?)\\\)|\\\[(.*?)\\\]/g, (match, inline, display) => {
    const formula = inline || display;
    const renderedFormula = katex.renderToString(formula, {
      throwOnError: true,
      displayMode: !!display, // Display mode nếu là \[...\]
    });
    return renderedFormula;
  });

  // console.log("Sau khi replace katex: --> ", katexContent);

  const htmlContent = marked(katexContent);

  // console.log("Noi dung htmlContent sau khi dùng marked: --> ", htmlContent);
  
  const sanitizedContent = DOMPurify.sanitize(htmlContent as string);

  // console.log(sanitizedContent);
  return parse(sanitizedContent, {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Element && domNode.name === 'code' && (domNode.parent instanceof Element) && domNode.parent.name === 'pre') {
        const language = domNode.attribs.class ? domNode.attribs.class.replace('language-', '') : 'text';
        const childNode = domNode.children[0];
        const code = (childNode instanceof Text)? childNode.data : '';
        return (
          <SyntaxHighlighter language={language} style={dark} >
            {code}
          </SyntaxHighlighter>
        );
      }
    },
  });
};

// Tạo component tin nhắn được memo hóa để tránh render lại không cần thiết
const MessageBubble = memo(({ key, message }: { key: number, message: Message }) => {
  return (
    <div
      key={key}
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`p-4 rounded-lg ${
          message.role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-black'
        } max-w-2xl prose`}
      >
        {/* Hiển thị tin nhắn của user trực tiếp và assistant dưới dạng HTML */}
        {message.role === 'assistant' ? (
          <div>{renderHTMLWithCodeHighlighting(message.content || '')}</div>
        ) : (
          <div>{parse(marked(message.content) as string)}</div>
        )}
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]); // Sử dụng mảng các đối tượng kiểu Message
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // State để quản lý trạng thái loading

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Thêm tin nhắn của người dùng vào lịch sử tin nhắn
    const newMessages: Message[] = [...messages, { role: 'user', content: input }];

    // Xóa nội dung ô input ngay lập tức
    setInput('');
    setMessages(newMessages);
    setLoading(true); // Bắt đầu trạng thái loading

    try {
      // Gọi API `/api/chat` và gửi toàn bộ lịch sử tin nhắn
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }), // Gửi toàn bộ lịch sử tin nhắn
      });

      const data = await response.json();

      // Chuyển đổi nội dung Markdown của phản hồi thành HTML
      // const formattedMessage = await sanitizeAndFormatMessage(data.reply);

      // Thêm phản hồi của AI (bao gồm HTML đã chuyển đổi) vào lịch sử tin nhắn
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: data.reply, htmlContent: '' }, //formattedMessage },
      ]);

      setLoading(false); // Dừng trạng thái loading
    } catch (error) {
      console.error('Error calling chat API:', error);
      setLoading(false); // Dừng trạng thái loading nếu có lỗi
    }
  };

  // Xử lý khi nhấn Enter và Shift+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as FormEvent);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center p-4 text-2xl font-bold shadow-lg">
        AI Chat
      </header>

      {/* Khu vực tin nhắn */}
      <div className="flex-1 p-6 overflow-y-auto bg-white shadow-inner max-h-screen">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
          {/* Hiển thị loading nếu đang gửi yêu cầu tới API */}
          {loading && (
            <div className="flex justify-center items-center mt-4">
              <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12"></div>
            </div>
          )}
        </div>
      </div>

      {/* Hộp nhập liệu */}
      <form
        onSubmit={handleSendMessage}
        className="flex p-4 bg-gray-200 shadow-md max-w-2xl mx-auto w-full"
      >
        <textarea
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown} // Sự kiện Shift+Enter
          rows={3} // Để textarea có thể mở rộng
          disabled={loading}
        />

        <button
          type="submit"
          className="ml-4 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={loading} // Vô hiệu hóa khi đang loading
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
