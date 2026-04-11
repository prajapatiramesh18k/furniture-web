'use client';
import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage, isTextUIPart } from 'ai';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('chat-input') as HTMLInputElement;
    const text = input.value.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    input.value = '';
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div>
                <h4>Ananya Assistant</h4>
                <span className="chatbot-status">Online</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                <div className="chatbot-welcome-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h3>Hi there!</h3>
                <p>Welcome to Ananya House of Furniture. Ask me about our furniture products, prices, or services!</p>
                <div className="chatbot-suggestions">
                  {[
                    'What sofas do you have?',
                    'Delivery charges?',
                    'Custom furniture design?',
                  ].map((q) => (
                    <button
                      key={q}
                      className="chatbot-suggestion"
                      onClick={() => sendMessage({ text: q })}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg: UIMessage) => (
              <div
                key={msg.id}
                className={`chatbot-message ${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="chatbot-msg-avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                )}
                <div className="chatbot-bubble">
                  {msg.parts
                    .filter(isTextUIPart)
                    .map((part, i) => (
                      <span key={i}>{part.text}</span>
                    ))}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-message assistant">
                <div className="chatbot-msg-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div className="chatbot-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={handleFormSubmit}>
            <input
              type="text"
              name="chat-input"
              placeholder="Ask about furniture..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}

      <style jsx>{`
        .chatbot-fab {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 5.6rem;
          height: 5.6rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #a27341, #c49a6c);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 20px rgba(162, 115, 65, 0.4);
          z-index: 9999;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .chatbot-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(162, 115, 65, 0.5);
        }
        .chatbot-window {
          position: fixed;
          bottom: 9rem;
          right: 2rem;
          width: 38rem;
          max-width: calc(100vw - 3.2rem);
          height: 54rem;
          max-height: calc(100vh - 12rem);
          background: #fff;
          border-radius: 1.6rem;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9998;
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(1.2rem); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chatbot-header {
          background: linear-gradient(135deg, #a27341, #c49a6c);
          padding: 1.4rem 1.6rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .chatbot-header-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .chatbot-avatar {
          width: 3.6rem;
          height: 3.6rem;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .chatbot-header h4 {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          line-height: 1.2;
        }
        .chatbot-status {
          color: rgba(255,255,255,0.85);
          font-size: 1.1rem;
        }
        .chatbot-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.4rem;
          display: flex;
          align-items: center;
          opacity: 0.85;
          transition: opacity 0.2s;
        }
        .chatbot-close:hover { opacity: 1; }
        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.6rem;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .chatbot-welcome {
          text-align: center;
          padding: 2rem 1rem;
          color: #666;
        }
        .chatbot-welcome-icon {
          width: 6rem;
          height: 6rem;
          border-radius: 50%;
          background: #f5ede3;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.2rem;
          color: #a27341;
        }
        .chatbot-welcome h3 {
          font-size: 1.7rem;
          color: #333;
          margin: 0 0 0.8rem;
        }
        .chatbot-welcome p {
          font-size: 1.3rem;
          line-height: 1.5;
          margin: 0 0 1.6rem;
        }
        .chatbot-suggestions {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          text-align: left;
        }
        .chatbot-suggestion {
          background: #f5ede3;
          border: 1px solid #e8d5c0;
          border-radius: 0.8rem;
          padding: 0.9rem 1.2rem;
          font-size: 1.3rem;
          color: #7a5a35;
          cursor: pointer;
          transition: background 0.2s;
          text-align: left;
        }
        .chatbot-suggestion:hover { background: #ede0cf; }
        .chatbot-message {
          display: flex;
          gap: 0.8rem;
          align-items: flex-end;
        }
        .chatbot-message.user {
          flex-direction: row-reverse;
        }
        .chatbot-msg-avatar {
          width: 2.8rem;
          height: 2.8rem;
          border-radius: 50%;
          background: #a27341;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .chatbot-bubble {
          max-width: 75%;
          padding: 1rem 1.3rem;
          border-radius: 1.4rem;
          font-size: 1.35rem;
          line-height: 1.5;
          word-break: break-word;
        }
        .chatbot-message.user .chatbot-bubble {
          background: #a27341;
          color: white;
          border-bottom-right-radius: 0.4rem;
        }
        .chatbot-message.assistant .chatbot-bubble {
          background: #f0ede8;
          color: #333;
          border-bottom-left-radius: 0.4rem;
        }
        .chatbot-bubble.typing {
          display: flex;
          gap: 0.4rem;
          align-items: center;
          padding: 1rem 1.4rem;
        }
        .chatbot-bubble.typing span {
          width: 0.7rem;
          height: 0.7rem;
          border-radius: 50%;
          background: #a27341;
          animation: bounce 1.2s infinite;
          opacity: 0.4;
        }
        .chatbot-bubble.typing span:nth-child(2) { animation-delay: 0.15s; }
        .chatbot-bubble.typing span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-0.5rem); opacity: 1; }
        }
        .chatbot-input-area {
          display: flex;
          gap: 0.8rem;
          padding: 1.2rem 1.4rem;
          border-top: 1px solid #eee;
          flex-shrink: 0;
        }
        .chatbot-input-area input {
          flex: 1;
          padding: 1rem 1.4rem;
          border: 1px solid #e0d5c8;
          border-radius: 2.4rem;
          font-size: 1.35rem;
          outline: none;
          background: #f9f5f1;
          color: #333;
          transition: border-color 0.2s;
        }
        .chatbot-input-area input:focus {
          border-color: #a27341;
          background: #fff;
        }
        .chatbot-input-area button {
          width: 4.4rem;
          height: 4.4rem;
          border-radius: 50%;
          background: #a27341;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s, opacity 0.2s;
        }
        .chatbot-input-area button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .chatbot-input-area button:not(:disabled):hover {
          background: #8a5f35;
        }
        @media (max-width: 480px) {
          .chatbot-window {
            bottom: 8rem;
            right: 1.2rem;
            width: calc(100vw - 2.4rem);
            height: calc(100vh - 10rem);
          }
          .chatbot-fab {
            right: 1.6rem;
            bottom: 1.8rem;
          }
        }
      `}</style>
    </>
  );
}
