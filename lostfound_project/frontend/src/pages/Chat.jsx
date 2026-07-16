import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare } from 'lucide-react';

export default function Chat({ user }) {
  const [searchParams] = useSearchParams();
  const contactIdParam = searchParams.get('contactId');
  const itemIdParam = searchParams.get('itemId');

  const [partners, setPartners] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingPartners, setLoadingPartners] = useState(true);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activePartnerRef = useRef(null);

  useEffect(() => {
    activePartnerRef.current = activePartner;
  }, [activePartner]);

  const fetchPartners = async (selectId = null) => {
    setLoadingPartners(true);
    try {
      const res = await fetch(`/api/chat/partners/${user.id}`);
      if (!res.ok) throw new Error('Failed to load chat partners');
      let data = await res.json();

      const uniquePartners = [];
      const seen = new Set();
      for (const p of data) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          uniquePartners.push(p);
        }
      }

      setPartners(uniquePartners);

      if (selectId) {
        const found = uniquePartners.find(p => p.id === Number(selectId));
        if (found) {
          setActivePartner(found);
        } else {
          const userRes = await fetch(`/api/auth/users/${selectId}`);
          if (userRes.ok) {
            const contactUser = await userRes.json();
            setPartners(prev => [contactUser, ...prev]);
            setActivePartner(contactUser);
          }
        }
      } else if (uniquePartners.length > 0 && !activePartner) {
        setActivePartner(uniquePartners[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPartners(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${wsProtocol}//${window.location.host}/chat-ws?userId=${user.id}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to Chat WebSocket');
    };

    ws.onmessage = (event) => {
      const newMsg = JSON.parse(event.data);
      const partner = activePartnerRef.current;

      if (partner &&
          ((newMsg.sender.id === user.id && newMsg.receiver.id === partner.id) ||
           (newMsg.sender.id === partner.id && newMsg.receiver.id === user.id))) {
        setMessages(prev => [...prev, newMsg]);
      } else {
        fetchPartners(partner ? partner.id : null);
      }
    };

    ws.onclose = () => {
      console.log('Chat WebSocket disconnected');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [user]);

  useEffect(() => {
    if (contactIdParam) {
      fetchPartners(contactIdParam);
    } else {
      fetchPartners();
    }
  }, [contactIdParam]);

  useEffect(() => {
    if (!activePartner) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetch(`/api/chat/history/${user.id}/${activePartner.id}`);
        if (!res.ok) throw new Error('Failed to load chat history');
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [activePartner, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activePartner) return;

    const payload = {
      senderId: user.id,
      receiverId: activePartner.id,
      content: messageText,
      itemId: itemIdParam ? Number(itemIdParam) : null
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
      setMessageText('');
    } else {
      alert("Chat connection is offline. Attempting to reconnect...");
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${wsProtocol}//${window.location.host}/chat-ws?userId=${user.id}`);
      socketRef.current = ws;
    }
  };

  return (
    <div className="chat-container animate-fade-in">
      <div className="glass-card chat-sidebar">
        <div className="chat-sidebar-header">
          Conversations
        </div>
        <div className="chat-partners-list">
          {loadingPartners && partners.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Loading chats...</p>
          ) : partners.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px', fontSize: '14px' }}>
              <MessageSquare size={32} style={{ marginBottom: '12px', opacity: 0.4, display: 'inline-block' }} />
              <p>No active conversations yet.</p>
              <p style={{ fontSize: '12px', marginTop: '6px' }}>Approve a claim or contact an owner to start chatting.</p>
            </div>
          ) : (
            partners.map(partner => (
              <div
                key={partner.id}
                className={`chat-partner-item ${activePartner && activePartner.id === partner.id ? 'active' : ''}`}
                onClick={() => setActivePartner(partner)}
              >
                <div className="partner-avatar">
                  {partner.name.substring(0, 2)}
                </div>
                <div className="partner-info">
                  <div className="partner-name">{partner.name}</div>
                  <div className="partner-dept">{partner.department}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="glass-card chat-main">
        {activePartner ? (
          <>
            <div className="chat-main-header">
              <div className="partner-avatar" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                {activePartner.name.substring(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{activePartner.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{activePartner.studentNumber} • {activePartner.department}</div>
              </div>
            </div>

            <div className="chat-messages-area">
              {loadingHistory ? (
                <p style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>Loading chat history...</p>
              ) : messages.length === 0 ? (
                <div className="chat-empty-state">
                  <MessageSquare size={48} style={{ opacity: 0.3 }} />
                  <p>Send a message to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSentByMe = msg.sender.id === user.id;
                  const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  return (
                    <div
                      key={msg.id}
                      className={`chat-bubble-container ${isSentByMe ? 'sent' : 'received'}`}
                    >
                      <div className="chat-bubble">
                        {msg.content}
                      </div>
                      <span className="chat-time">{time}</span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="chat-message-input"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 18px' }}>
                <Send size={16} /> Send
              </button>
            </form>
          </>
        ) : (
          <div className="chat-empty-state">
            <MessageSquare size={64} style={{ opacity: 0.2 }} />
            <p style={{ fontSize: '16px' }}>Select a conversation from the sidebar to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}