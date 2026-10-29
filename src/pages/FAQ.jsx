import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './FAQ.css';

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
    <main className="faq-page">
      <header className="faq-heading">
        <div className="faq-heading-content">
          <p className="faq-kicker">SUPPORT · ANSWERS</p>
          <h1>Need Help?</h1>
          <p>Frequently Asked Questions</p>
        </div>
      </header>

      <div className="faq-content">
        {faqData.map((section, sIdx) => (
          <section className="faq-category" key={section.category}>
            <h2 className="faq-category-title">
              <span aria-hidden="true" />
              {section.category}
            </h2>
            
            <div className="faq-list">
              {section.questions.map((item, qIdx) => {
                const uniqueIdx = `${sIdx}-${qIdx}`;
                const isOpen = openIndex === uniqueIdx;
                const answerId = `faq-answer-${sIdx}-${qIdx}`;
                return (
                  <article className={`faq-item${isOpen ? ' is-open' : ''}`} key={item.q}>
                    <button 
                      className="faq-question"
                      type="button"
                      onClick={() => toggleAccordion(uniqueIdx)}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                    >
                      <span>{item.q}</span>
                      {isOpen ? <ChevronUp size={20} aria-hidden="true" /> : <ChevronDown size={20} aria-hidden="true" />}
                    </button>
                    
                    <div className="faq-answer" id={answerId} hidden={!isOpen}>
                      <div className="faq-answer-content">
                        {item.a}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};

export default FAQ;
