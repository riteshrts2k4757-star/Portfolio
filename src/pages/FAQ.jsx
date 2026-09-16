import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
  {
    category: "General",
    questions: [
      { q: "What is this website about?", a: "This is a full-stack portfolio showcasing modern web development features including real-time chat, multiplayer games, and a complete tour booking system." },
      { q: "How do I get started?", a: "Simply sign up for a free account to access all features. Once logged in, you can book tours, join chat rooms, or play games." }
    ]
  },
  {
    category: "Tours & Bookings",
    questions: [
      { q: "How do I book a tour?", a: "Navigate to the Tours page, browse the available destinations, click on a tour to view details, and hit the 'Book Now' button to proceed through the checkout flow." },
      { q: "Is the payment system real?", a: "No, this is a simulated environment. The UPI and Credit Card gateways are for demonstration purposes and no real transactions will occur." },
      { q: "How can I become a Tour Guide?", a: "Tour Guide accounts are manually provisioned by the admin. You can contact us using the Contact form to request a guide account." }
    ]
  },
  {
    category: "Games & Chat",
    questions: [
      { q: "How does the real-time chat work?", a: "The chat utilizes Supabase Realtime subscriptions. When you send a message, it is instantly broadcast to all other connected users in that channel." },
      { q: "Can I play the game on mobile?", a: "Yes, the multiplayer game is fully responsive and can be played using on-screen touch controls on mobile devices." }
    ]
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (idx) => {
    if (openIndex === idx) setOpenIndex(null);
    else setOpenIndex(idx);
  };

  return (
    <div className="page-container" style={{ alignItems: 'center' }}>
      <div className="header-container" style={{ padding: '3rem 5%', textAlign: 'center', justifyContent: 'center', marginBottom: '3rem', borderRadius: '20px', width: '100%', maxWidth: '1000px' }}>
        <div className="header-text" style={{ alignItems: 'center' }}>
          <h1>Need Help?</h1>
          <h2>Frequently Asked Questions</h2>
        </div>
      </div>

      <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', gap: '3rem', textAlign: 'left' }}>
        {faqData.map((section, sIdx) => (
          <div key={sIdx}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent-2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '30px', height: '2px', background: 'var(--accent-2)', display: 'inline-block' }}></span>
              {section.category}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {section.questions.map((item, qIdx) => {
                const uniqueIdx = `${sIdx}-${qIdx}`;
                const isOpen = openIndex === uniqueIdx;
                return (
                  <div key={qIdx} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)', border: `1px solid ${isOpen ? 'var(--accent-1)' : 'rgba(0,0,0,0.06)'}`, borderRadius: '12px', overflow: 'hidden', transition: 'all 0.3s' }}>
                    <button 
                      onClick={() => toggleAccordion(uniqueIdx)}
                      style={{ width: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '1.05rem', color: 'var(--text-main)' }}
                    >
                      {item.q}
                      {isOpen ? <ChevronUp size={20} color="var(--accent-2)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                    </button>
                    
                    {isOpen && (
                      <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem', animation: 'fadeIn 0.3s ease-out' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
