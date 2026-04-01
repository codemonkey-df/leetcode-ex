import React from 'react';
import { Exercise } from '../types';
import { useSession } from '../hooks/useSession';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface HintChatProps {
  exercise: Exercise;
  onSendMessage: (message: string) => Promise<string>;
  isSending: boolean;
}

export const HintChat: React.FC<HintChatProps> = ({ 
  exercise, 
  onSendMessage, 
  isSending 
}) => {
  const { exerciseVersion } = useSession();
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `I'm your hint assistant for the ${exercise.title} problem.\n\nI can help you understand the ${exercise.pattern} pattern, suggest next steps, or clarify concepts — but I'll never give you the full solution.\n\nTry pasting your code and asking for specific guidance! 🚀`,
      timestamp: Date.now(),
    },
  ]);

  // Reset messages when exercise version changes
  React.useEffect(() => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I'm your hint assistant for the ${exercise.title} problem.\n\nI can help you understand the ${exercise.pattern} pattern, suggest next steps, or clarify concepts — but I'll never give you the full solution.\n\nTry pasting your code and asking for specific guidance! 🚀`,
        timestamp: Date.now(),
      },
    ]);
  }, [exerciseVersion]);
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [activeChip, setActiveChip] = React.useState<string>('Pattern clue');
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    // Ensure chat container has proper height
    if (chatContainerRef.current) {
      chatContainerRef.current.style.height = '100%';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const response = await onSendMessage(input);
    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleQuickQuestion = async (question: string) => {
    if (isSending) return;

    setActiveChip(question);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);

    const response = await onSendMessage(question);
    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      },
    ]);
  };

  const renderAgentAvatar = () => (
    <div className="agent-avatar flex items-center justify-center text-[14px] w-[32px] h-[32px] rounded-full bg-gradient-to-br from-[#a371f7] to-[#58a6ff] flex-shrink-0 shadow-[0_0_0_2px_rgba(163,113,247,0.3)]">
      💡
    </div>
  );

  const renderMsgAvatar = (role: 'user' | 'assistant') => (
    <div className={`msg-avatar flex items-center justify-center text-[11px] w-[26px] h-[26px] rounded-full flex-shrink-0
      ${role === 'user' 
        ? 'bg-[#1c2333] border border-[#30363d] text-[#58a6ff]' 
        : 'bg-gradient-to-br from-[#a371f7] to-[#58a6ff]'
      }`}
    >
      {role === 'user' ? 'You' : '💡'}
    </div>
  );

  return (
    <div className="chat-col flex flex-col h-full overflow-hidden">
      {/* Agent Bar */}
      <div className="chat-agent-bar flex items-center gap-3.5 px-3.5 py-2.5 border-b border-[#30363d] flex-shrink-0">
        {renderAgentAvatar()}
        <div className="flex-1 min-w-0">
          <div className="agent-name text-[13px] font-medium text-[#e6edf3]">Hint Assistant</div>
          <div className="agent-role text-[11px] text-[#8b949e]">{exercise.pattern} pattern specialist</div>
        </div>
        <div className="online-dot w-[8px] h-[8px] rounded-full bg-[#3fb950] box-shadow-[0_0_6px_#3fb950] flex-shrink-0"></div>
      </div>

      {/* Messages - flex-1 for proper height */}
      <div className="chat-messages flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`msg flex gap-2 items-start ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {renderMsgAvatar(message.role)}
            <div
              className={`msg-bubble bg-[#1c2333] border border-[#30363d] rounded-[0_10px_10px_10px] px-3 py-2.5 text-[12.5px] leading-[1.6] text-[#c9d1d9] max-w-full
                ${message.role === 'user' 
                  ? 'bg-[rgba(88,166,255,0.12)] border-color-[rgba(88,166,255,0.25)] rounded-[10px_0_10px_10px] text-[#e6edf3]' 
                  : ''
                }`}
            >
              <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="msg flex gap-2 items-start">
            {renderMsgAvatar('assistant')}
            <div className="msg-bubble bg-[#1c2333] border border-[#30363d] rounded-[0_10px_10px_10px] px-3 py-2.5">
              <span className="flex items-center gap-1 text-[#8b949e] text-[12.5px]">
                Thinking<span className="animate-pulse">•</span>
                <span className="animate-pulse animation-delay-100">•</span>
                <span className="animate-pulse animation-delay-200">•</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Hint Chips */}
      <div className="hint-chips flex gap-1.5 flex-wrap px-3 py-2 border-t border-[#30363d] flex-shrink-0">
        <span 
          className="chip bg-[#1c2333] border border-[#30363d] rounded-full px-2.5 py-1 text-[11.5px] text-[#8b949e] cursor-pointer transition-all whitespace-nowrap"
          onClick={() => handleQuickQuestion('Overall approach')}
        >
          🧭 Overall approach
        </span>
        <span 
          className="chip bg-[#1c2333] border border-[#30363d] rounded-full px-2.5 py-1 text-[11.5px] text-[#8b949e] cursor-pointer transition-all whitespace-nowrap"
          onClick={() => handleQuickQuestion('Data structure')}
        >
          📦 Data structure
        </span>
        <span 
          className={`chip rounded-full px-2.5 py-1 text-[11.5px] cursor-pointer transition-all whitespace-nowrap
            ${activeChip === 'Pattern clue' 
              ? 'border-[#a371f7] text-[#a371f7] bg-[rgba(163,113,247,0.1)]' 
              : 'bg-[#1c2333] border border-[#30363d] text-[#8b949e] hover:border-[#58a6ff] hover:text-[#58a6ff] hover:bg-[rgba(88,166,255,0.08)]'
            }`}
          onClick={() => handleQuickQuestion('Pattern clue')}
        >
          🧩 Pattern clue
        </span>
      </div>

      {/* Input */}
      <div className="chat-input-row flex items-center gap-2 px-3 py-2.5 border-t border-[#30363d] flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 min-w-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for a hint or share your code..."
            disabled={isSending}
            className="chat-input flex-1 bg-[#1c2333] border border-[#30363d] rounded-[8px] px-3 py-2 text-[12.5px] text-[#e6edf3] font-sans outline-none transition-colors
              placeholder-[#8b949e] focus:border-[#58a6ff] min-w-0"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="send-btn bg-[#a371f7] text-white border-none rounded-[8px] px-3.5 py-2 text-[12px] font-semibold cursor-pointer font-sans transition-opacity whitespace-nowrap
              hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 flex-shrink-0"
          >
            Send
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[13px] h-[13px] flex-shrink-0">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};
