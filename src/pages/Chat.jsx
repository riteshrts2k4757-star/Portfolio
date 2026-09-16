import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search, Send, Bot, ArrowLeft, Check, CheckCheck, Trash2 } from 'lucide-react';
import { API_BASE_URL, WS_BASE_URL } from '../apiConfig';
import './Chat.css';

const Chat = () => {
  const { user } = useContext(AuthContext);
  
  // Mobile layout state: 'ai', 'chat', 'members'
  const [activeMobilePanel, setActiveMobilePanel] = useState('members');
  
  // Data State
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  // AI State
  const [aiMessages, setAiMessages] = useState([{ role: 'ai', content: 'Hi there! I am your AI assistant. You can ask me how to book a tour, how the chat works, or how to play the remote control game!' }]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiContainerRef = useRef(null);
  
  // Selection State
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  
  const ws = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll to bottom when messages change without scrolling the whole page
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, activeMobilePanel]);

  useEffect(() => {
    if (aiContainerRef.current) {
      aiContainerRef.current.scrollTop = aiContainerRef.current.scrollHeight;
    }
  }, [aiMessages, isAiLoading, activeMobilePanel]);

  // Fetch initial members
  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/chat/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  // Fetch conversation when user is selected
  const fetchConversation = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/chat/messages/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
      
      // Mark as read
      await fetch(`${API_BASE_URL}/api/chat/messages/${userId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update unread count locally
      setMembers(prev => prev.map(m => m.id === userId ? { ...m, unread_count: '0' } : m));
      
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
    }
  };

  // Initialize WebSocket & Data
  useEffect(() => {
    if (!user) return;
    
    fetchMembers();

    const token = localStorage.getItem('token');
    const wsUrl = `${WS_BASE_URL}/api/chat-ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      // Authenticate
      ws.current.send(JSON.stringify({ type: 'authenticate', token }));
    };

    ws.current.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      
      if (parsed.type === 'online_users') {
        setOnlineUsers(new Set(parsed.users));
      } 
      else if (parsed.type === 'presence') {
        setOnlineUsers(prev => {
          const next = new Set(prev);
          if (parsed.isOnline) next.add(parsed.userId);
          else next.delete(parsed.userId);
          return next;
        });
      }
      else if (parsed.type === 'new_message' || parsed.type === 'message_sent') {
        const msg = parsed.data;
        
        // If message is for the currently open conversation
        setSelectedUser(currentSelectedUser => {
          if (
            currentSelectedUser && 
            (msg.sender_id === currentSelectedUser.id || msg.receiver_id === currentSelectedUser.id)
          ) {
            setMessages(prev => {
              // Deduplicate: Don't add if a message with this ID already exists
              if (prev.some(m => m.id === msg.id)) {
                return prev;
              }
              return [...prev, msg];
            });
            
            // Mark as read immediately if it's an incoming message in the active chat
            if (msg.sender_id === currentSelectedUser.id) {
               const apiBase = `http://${window.location.hostname}:5000`;
               fetch(`${apiBase}/api/chat/messages/${currentSelectedUser.id}/read`, {
                 method: 'PATCH',
                 headers: { 'Authorization': `Bearer ${token}` }
               });
            }
          } else if (parsed.type === 'new_message') {
            // Update unread count and latest message for member list
            fetchMembers(); // Simple refresh for list to reorder
          }
          return currentSelectedUser;
        });
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [user]);

  const handleSelectUser = (member) => {
    setSelectedUser(member);
    setActiveMobilePanel('chat');
    setSelectedMessages(new Set());
    fetchConversation(member.id);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !ws.current) return;
    
    ws.current.send(JSON.stringify({
      type: 'send_message',
      receiverId: selectedUser.id,
      message: newMessage,
      messageType: 'text'
    }));
    
    setNewMessage('');
  };

  const handleDeleteMessages = async () => {
    if (selectedMessages.size === 0) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageIds: Array.from(selectedMessages) })
      });
      
      if (response.ok) {
        setMessages(prev => prev.filter(m => !selectedMessages.has(m.id)));
        setSelectedMessages(new Set());
      } else {
        alert("Failed to delete messages");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting messages");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiInput.trim() || isAiLoading) return;
    
    const userMsg = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAiLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: aiMessages, userMessage: userMsg })
      });
      const data = await response.json();
      setAiMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { role: 'ai', content: 'Oops! Unable to reach the AI at the moment.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="page-container glass-box" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Please login to access the chat</h2>
      </div>
    );
  }

  return (
    <div className="chat-page-container">
      
      {/* 1. AI CHAT PANEL */}
      <div className={`chat-panel ai-chat-panel glass-box ${activeMobilePanel === 'ai' ? 'active-mobile-panel' : ''}`}>
        <div className="mobile-nav">
          <button className="mobile-nav-btn" onClick={() => setActiveMobilePanel('members')}>
            <ArrowLeft size={18} /> Back to Members
          </button>
        </div>
        <div className="panel-header" style={{ justifyContent: 'space-between' }}>
          <h2><Bot size={24} /> AI Assistant</h2>
          <button 
            className="mobile-nav-btn" 
            onClick={() => setAiMessages([{ role: 'ai', content: 'Hi there! I am your AI assistant. You can ask me how to book a tour, how the chat works, or how to play the remote control game!' }])}
            style={{ color: 'var(--accent-1)', fontSize: '0.85rem' }}
          >
            Clear All
          </button>
        </div>
        <div className="chat-messages" ref={aiContainerRef}>
          {aiMessages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.role === 'user' ? 'sent' : 'received'}`}>
              <div className="message-bubble" style={msg.role === 'ai' ? { background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--text-main)' } : {}}>
                {msg.content}
              </div>
            </div>
          ))}
          {isAiLoading && (
            <div className="message-wrapper received">
              <div className="message-bubble" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--text-main)' }}>
                Thinking...
              </div>
            </div>
          )}
        </div>
        <div className="chat-input-area">
          <form className="chat-input-wrapper" onSubmit={handleAiSubmit}>
            <textarea 
              placeholder="Ask me anything in your language..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAiSubmit(e);
                }
              }}
              rows={1}
            />
            <button type="submit" className="send-btn" disabled={!aiInput.trim() || isAiLoading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* 2. CURRENT CONVERSATION PANEL */}
      <div className={`chat-panel glass-box ${activeMobilePanel === 'chat' ? 'active-mobile-panel' : ''}`}>
        <div className="mobile-nav">
          <button className="mobile-nav-btn" onClick={() => setActiveMobilePanel('members')}>
            <ArrowLeft size={18} /> Members
          </button>
        </div>
        
        {selectedUser ? (
          <>
            <div className="panel-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div 
                  className="member-avatar" 
                  style={{ 
                    width: '35px', 
                    height: '35px',
                    backgroundImage: selectedUser.profile_picture ? `url(${selectedUser.profile_picture})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: selectedUser.profile_picture ? 'transparent' : '#fff'
                  }}
                >
                  {!selectedUser.profile_picture && selectedUser.username.charAt(0).toUpperCase()}
                  <div className={`member-status ${onlineUsers.has(selectedUser.id) ? 'status-online' : 'status-offline'}`} style={{ width: '10px', height: '10px' }}></div>
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{selectedUser.username}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {onlineUsers.has(selectedUser.id) ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              
              {selectedMessages.size > 0 && (
                <button 
                  className="delete-selected-btn" 
                  onClick={handleDeleteMessages}
                  disabled={isDeleting}
                >
                  <Trash2 size={16} /> Delete ({selectedMessages.size})
                </button>
              )}
            </div>
            
            <div className="chat-messages" ref={messagesContainerRef}>
              {messages.length === 0 ? (
                <div className="empty-chat-state">
                  <p>Start a conversation with {selectedUser.username}</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isSent = msg.sender_id === user.id;
                  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div 
                      key={msg.id || index} 
                      className={`message-wrapper ${isSent ? 'sent' : 'received'}`} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        flexDirection: isSent ? 'row-reverse' : 'row'
                      }}
                    >
                      {msg.id && (
                        <div className="message-checkbox-container">
                          <input 
                            type="checkbox" 
                            checked={selectedMessages.has(msg.id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedMessages);
                              if (e.target.checked) newSet.add(msg.id);
                              else newSet.delete(msg.id);
                              setSelectedMessages(newSet);
                            }}
                            className="message-checkbox"
                          />
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isSent ? 'flex-end' : 'flex-start', maxWidth: 'calc(100% - 35px)' }}>
                        <div className="message-bubble">
                          {msg.message}
                        </div>
                        <div className="message-meta">
                          {time} {isSent && (msg.is_read ? <CheckCheck size={14} color="#4ade80" /> : <Check size={14} />)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="chat-input-area">
              <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
                <textarea 
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  rows={1}
                />
                <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="empty-chat-state" style={{ flex: 1 }}>
            <h2 style={{ opacity: 0.5 }}>💬</h2>
            <h3>Select a conversation</h3>
            <p>Choose a member from the list to start chatting.</p>
          </div>
        )}
      </div>

      {/* 3. MEMBERS PANEL */}
      <div className={`chat-panel glass-box ${activeMobilePanel === 'members' ? 'active-mobile-panel' : ''}`}>
        <div className="panel-header" style={{ justifyContent: 'space-between' }}>
          <h2>Members</h2>
          <button 
            className="mobile-nav-btn" 
            style={{ display: window.innerWidth <= 992 ? 'flex' : 'none' }}
            onClick={() => setActiveMobilePanel('ai')}
          >
            <Bot size={18} /> AI
          </button>
        </div>
        
        <div className="members-search">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="members-list">
          {filteredMembers.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>No members found.</p>
          ) : (
            filteredMembers.map(member => (
              <div 
                key={member.id} 
                className={`member-item ${selectedUser?.id === member.id ? 'active' : ''}`}
                onClick={() => handleSelectUser(member)}
              >
                <div 
                  className="member-avatar"
                  style={{
                    backgroundImage: member.profile_picture ? `url(${member.profile_picture})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: member.profile_picture ? 'transparent' : '#fff'
                  }}
                >
                  {!member.profile_picture && member.username.charAt(0).toUpperCase()}
                  <div className={`member-status ${onlineUsers.has(member.id) ? 'status-online' : 'status-offline'}`}></div>
                </div>
                <div className="member-info">
                  <h4 className="member-name">
                    {member.id === user.id ? `${member.username} (You)` : member.username}
                  </h4>
                  <p className="member-last-message">
                    {member.last_message || 'No messages yet'}
                  </p>
                </div>
                <div className="member-meta">
                  {member.last_message_time && (
                    <span className="member-time">
                      {new Date(member.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {parseInt(member.unread_count) > 0 && (
                    <span className="unread-badge">{member.unread_count}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Chat;
