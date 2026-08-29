import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search, Send, Bot, ArrowLeft, Check, CheckCheck } from 'lucide-react';
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
  
  const ws = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll to bottom when messages change without scrolling the whole page
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, activeMobilePanel]);

  // Fetch initial members
  const fetchMembers = async () => {
    try {
      const apiBase = `http://${window.location.hostname}:5000`;
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBase}/api/chat/users`, {
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
      const apiBase = `http://${window.location.hostname}:5000`;
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBase}/api/chat/messages/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
      
      // Mark as read
      await fetch(`${apiBase}/api/chat/messages/${userId}/read`, {
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
    // Determine WS URL based on current host
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.hostname}:5000/api/chat-ws`;
    
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
        <div className="panel-header">
          <h2><Bot size={24} /> AI Assistant</h2>
        </div>
        <div className="chat-messages">
          <div className="empty-chat-state">
            <Bot className="ai-icon-large" />
            <h3>Ask me anything</h3>
            <p>I can help you with travel tips, Jharkhand tourism info, or website navigation.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>(AI Integration Coming Soon)</p>
          </div>
        </div>
        <div className="chat-input-area">
          <form className="chat-input-wrapper" onSubmit={(e) => { e.preventDefault(); alert("AI Integration coming soon!"); setNewMessage(''); }}>
            <textarea 
              placeholder="Ask AI..."
              rows={1}
            />
            <button type="submit" className="send-btn" disabled>
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
            <div className="panel-header">
              <div className="member-avatar" style={{ width: '35px', height: '35px' }}>
                {selectedUser.username.charAt(0).toUpperCase()}
                <div className={`member-status ${onlineUsers.has(selectedUser.id) ? 'status-online' : 'status-offline'}`} style={{ width: '10px', height: '10px' }}></div>
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{selectedUser.username}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {onlineUsers.has(selectedUser.id) ? 'Online' : 'Offline'}
                </span>
              </div>
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
                    <div key={msg.id || index} className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
                      <div className="message-bubble">
                        {msg.message}
                      </div>
                      <div className="message-meta">
                        {time} {isSent && (msg.is_read ? <CheckCheck size={14} color="#4ade80" /> : <Check size={14} />)}
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
                <div className="member-avatar">
                  {member.username.charAt(0).toUpperCase()}
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
