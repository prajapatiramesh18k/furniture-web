'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';

function messageText(msg: UIMessage): string {
  if (Array.isArray(msg.parts) && msg.parts.length > 0) {
    const texts: string[] = [];
    for (const part of msg.parts) {
      if (part.type === 'text' && typeof (part as { text?: string }).text === 'string') {
        texts.push((part as { text: string }).text);
      } else if (part.type === 'reasoning' && typeof (part as { text?: string }).text === 'string') {
        // Skip reasoning/thinking parts — only show final text.
      }
    }
    if (texts.length > 0) return texts.join('');
  }
  // Fallback for messages shaped as { content: string } (older SDK / cached).
  const legacy = (msg as unknown as { content?: unknown }).content;
  if (typeof legacy === 'string') return legacy;
  if (Array.isArray(legacy)) {
    return legacy
      .map((c) => (typeof c === 'string' ? c : (c as { text?: string })?.text ?? ''))
      .join('');
  }
  return '';
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat' }), []);

  const { messages, sendMessage, status, error, regenerate, clearError } = useChat({
    transport,
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading, error]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    clearError?.();
    sendMessage({ text: trimmed });
  };

  const handleFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('chat-input') as HTMLInputElement;
    send(input.value);
    input.value = '';
  };

  return (
    <>
      {!isOpen && (
        <button
          className="chatbot-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {isOpen ? (
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
                <span className="chatbot-status">
                  {isLoading ? 'Typing...' : error ? 'Reconnecting...' : 'Online'}
                </span>
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
                      type="button"
                      className="chatbot-suggestion"
                      disabled={isLoading}
                      onClick={() => send(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg: UIMessage) => {
              const text = messageText(msg);
              if (!text && msg.role === 'assistant') return null;
              return (
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
                    <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
                  </div>
                </div>
              );
            })}

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

            {error && !isLoading && (
              <div className="chatbot-message assistant">
                <div className="chatbot-bubble">
                  <span>Sorry, I could not reply. Please try again or call +91-9321812823.</span>
                  <div style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="chatbot-suggestion"
                      onClick={() => {
                        clearError?.();
                        regenerate?.();
                      }}
                    >
                      Retry
                    </button>
                  </div>
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
              autoComplete="off"
            />
            <button type="submit" disabled={isLoading} aria-label="Send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
