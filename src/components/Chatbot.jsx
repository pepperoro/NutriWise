import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, HeartPulse } from 'lucide-react';
import '../chatbot.css';

export default function Chatbot({ currentPage, onNavigate, currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const defaultMessage = { role: 'ai', content: 'Halo! Saya asisten AI NutriWise. Ada yang bisa saya bantu terkait kesehatan, gaya hidup, atau fitur di website ini?' };
  const [messages, setMessages] = useState([defaultMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

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
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
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

        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message-wrapper ${msg.role === 'user' ? 'user' : 'ai'}`}>
              {msg.role === 'ai' && (
                <div className="chat-avatar-small">
                  <Bot size={14} color="#166534" />
                </div>
              )}
              <div className={`chat-bubble ${msg.role}`}>
                {msg.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i !== msg.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
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
          <div ref={messagesEndRef} />
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
