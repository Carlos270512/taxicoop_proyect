import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, UserRound } from 'lucide-react';
import type { ChatMessage } from '../model/types';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`assistant-bubble ${isUser ? 'user' : 'bot'}`}>
      <div className="assistant-avatar">{isUser ? <UserRound size={14} /> : <Bot size={14} />}</div>
      <div className="assistant-bubble-body">
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="assistant-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="assistant-bubble bot">
      <div className="assistant-avatar">
        <Bot size={14} />
      </div>
      <div className="assistant-typing" aria-label="El asistente está escribiendo">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
