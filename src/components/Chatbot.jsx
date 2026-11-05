import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, HeartPulse } from 'lucide-react';
import '../chatbot.css';


function renderInlineFormatting(str) {
  if (!str) return null;
  const regex = /(\*{3}[^*]+?\*{3}|\*{2}[^*]+?\*{2}|\*[^*\s][^*]*?[^*\s]\*|\*[^*\s]\*|___[^_]+?___|__[^_]+?__|_[^_\s][^_]*?[^_\s]_|_[^_\s]_|`[^`]+`)/g;
  const parts = str.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;
    if ((part.startsWith('***') && part.endsWith('***') && part.length >= 6) ||
        (part.startsWith('___') && part.endsWith('___') && part.length >= 6)) {
      return <strong key={index} className="chat-bold-italic">{part.slice(3, -3)}</strong>;
    }
    if ((part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
        (part.startsWith('__') && part.endsWith('__') && part.length >= 4)) {
      return <strong key={index} className="chat-bold">{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
        (part.startsWith('_') && part.endsWith('_') && part.length >= 2)) {
      return <em key={index} className="chat-italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return <code key={index} className="chat-inline-code">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function FormattedChatMessage({ content }) {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="chat-formatted-body">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="chat-spacer" />;
        }

        const headerMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          return (
            <div key={idx} className={`chat-heading chat-h${level}`}>
              {renderInlineFormatting(headerMatch[2])}
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="chat-list-item">
              <span className="chat-list-num">{numMatch[1]}.</span>
              <span className="chat-list-text">{renderInlineFormatting(numMatch[2])}</span>
            </div>
          );
        }

        const bulletMatch = trimmed.match(/^[\*\-•]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="chat-list-item">
              <span className="chat-list-bullet">•</span>
              <span className="chat-list-text">{renderInlineFormatting(bulletMatch[1])}</span>
            </div>
          );
        }

        return (
          <div key={idx} className="chat-line">
            {renderInlineFormatting(line)}
          </div>
        );
      })}
    </div>
  );
}

export default function Chatbot({ currentPage, onNavigate, currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const defaultMessage = { role: 'ai', content: 'Halo! Saya asisten AI NutriWise. Ada yang bisa saya bantu terkait kesehatan, gaya hidup, atau fitur di website ini?' };
  const [messages, setMessages] = useState([defaultMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef(null);
  const latestMessageRef = useRef(null);
  const windowRef = useRef(null);

  // Auto-scroll inside chat container ONLY (does NOT scroll parent window or dashboard)
  useEffect(() => {
    if (!isOpen || !messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const lastMsg = messages[messages.length - 1];

    // If last message is AI response, scroll to the top/beginning of this response
    if (lastMsg?.role === 'ai' && latestMessageRef.current) {
      const timer = setTimeout(() => {
        if (!latestMessageRef.current || !container) return;
        const targetTop = latestMessageRef.current.offsetTop - container.offsetTop - 8;
        container.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // If user typed or loading, scroll to bottom of the chat container
      const timer = setTimeout(() => {
        if (!container) return;
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, isLoading]);

  // Prevent mouse wheel from scrolling the background page (dashboard/landing)
  useEffect(() => {
    const win = windowRef.current;
    if (!win || !isOpen) return;

    const handleWheel = (e) => {
      const container = messagesContainerRef.current;
      if (!container) {
        e.preventDefault();
        return;
      }

      const maxScroll = container.scrollHeight - container.clientHeight;
      if (maxScroll <= 0) {
        e.preventDefault();
        return;
      }

      const atTop = container.scrollTop <= 0 && e.deltaY < 0;
      const atBottom = container.scrollTop >= maxScroll - 1 && e.deltaY > 0;
      if (atTop || atBottom) {
        e.preventDefault();
      }
    };

    win.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      win.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen]);

  useEffect(() => {
    if (currentUser) {
      const savedChat = localStorage.getItem(`NutriWise_chat_${currentUser.id}`);
      if (savedChat) {
        try {
          setMessages(JSON.parse(savedChat));
        } catch (e) {
          console.error("Error parsing chat history:", e);
          setMessages([defaultMessage]);
        }
      } else {
        setMessages([defaultMessage]);
      }
    } else {
      setMessages([defaultMessage]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && messages.length > 0) {
      localStorage.setItem(`NutriWise_chat_${currentUser.id}`, JSON.stringify(messages));
    }
  }, [messages, currentUser]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          currentPage: currentPage,
          chatHistory: newMessages.slice(0, -1)
        })
      });

      const data = await response.json();
      if (data.error) {
        if (data.details) console.error('Chatbot API details:', data.details);
        setMessages([...newMessages, { role: 'ai', content: `Maaf, terjadi kesalahan: ${data.error}` }]);
      } else {
        let replyText = data.reply;
        
        // Parse navigation commands
        const navRegex = /\[NAVIGATE:([a-zA-Z0-9_-]+)\]/g;
        let match;
        let navTarget = null;
        
        while ((match = navRegex.exec(replyText)) !== null) {
          navTarget = match[1];
        }

        // Remove the command from the display text
        replyText = replyText.replace(/\[NAVIGATE:[a-zA-Z0-9_-]+\]/g, '').trim();

        if (navTarget && onNavigate) {
          onNavigate(navTarget);
          if (replyText === '') {
             replyText = `Membuka halaman ${navTarget}...`;
          }
        }

        setMessages([...newMessages, { role: 'ai', content: replyText }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'ai', content: 'Maaf, saya tidak dapat terhubung ke server saat ini. Pastikan backend server berjalan (npm run dev).' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button 
        className={`chatbot-toggle-btn ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chatbot Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`} ref={windowRef}>
        <div className="chatbot-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="chatbot-avatar">
              <HeartPulse size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontWeight: 700 }}>Asisten NutriWise</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>Online • Siap membantu</p>
            </div>
          </div>
          <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="chatbot-messages" ref={messagesContainerRef}>
          {messages.map((msg, idx) => {
            const isLatest = idx === messages.length - 1;
            return (
              <div 
                key={idx} 
                ref={isLatest ? latestMessageRef : null}
                className={`chat-message-wrapper ${msg.role === 'user' ? 'user' : 'ai'}`}
              >
                {msg.role === 'ai' && (
                  <div className="chat-avatar-small">
                    <Bot size={14} color="#166534" />
                  </div>
                )}
                <div className={`chat-bubble ${msg.role}`}>
                  <FormattedChatMessage content={msg.content} />
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="chat-message-wrapper ai">
              <div className="chat-avatar-small">
                <Bot size={14} color="#166534" />
              </div>
              <div className="chat-bubble ai loading-bubble">
                <Loader2 size={16} className="spin-anim" /> Mengetik...
              </div>
            </div>
          )}
        </div>

        <div className="chatbot-footer-info">
          Edukasi medis saja. Bukan pengganti diagnosis dokter.
          {!currentUser && (
            <div style={{ marginTop: '4px', color: '#f59e0b', fontSize: '0.7rem' }}>
              ⚠️ Anda belum login. Percakapan ini tidak akan disimpan.
            </div>
          )}
        </div>
        
        <form className="chatbot-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Tanyakan sesuatu tentang kesehatan..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={!input.trim() || isLoading}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
