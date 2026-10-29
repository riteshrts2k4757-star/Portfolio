import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, Brain, Check, CircuitBoard,
  Code2, Cpu, Database, Globe2, Layers, Mail, MapPin, MessageCircle,
  Monitor, Network, Radio, Server, ShieldCheck, Signal, Zap
} from 'lucide-react';
import './Home.css';

const roles = [
  'Full-Stack MERN Developer',
  'Hardware–Software Integration Developer',
  'IoT Systems Developer',
  'Machine Learning Developer',
  'Creative Problem Solver'
];

const capabilities = [
  {
    icon: Code2,
    number: '01',
    title: 'Full-stack web development',
    description: 'I build end-to-end web applications with thoughtful interfaces, secure APIs, and data models designed around real user workflows.',
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'REST APIs'],
    visual: 'web'
  },
  {
    icon: CircuitBoard,
    number: '02',
    title: 'Hardware meets software',
    description: 'I connect embedded devices, sensors, and wireless links to dashboards that make live system data easier to understand.',
    stack: ['ESP32', 'Arduino', 'nRF24', 'MQTT', 'Telemetry'],
    visual: 'hardware'
  },
  {
    icon: Brain,
    number: '03',
    title: 'Applied machine learning',
    description: 'I explore practical ML workflows—from preparing data to building models and presenting useful outputs in an application.',
    stack: ['Python', 'Scikit-learn', 'XGBoost', 'Pandas', 'Model APIs'],
    visual: 'ml'
  }
];

const projects = [
  {
    id: 'farmtrace',
    number: '01',
    name: 'FarmTrace',
    subtitle: 'IoT cold-chain telemetry & data integrity',
    status: 'Hardware + software system',
    description: 'An IoT logistics dashboard concept that connects ESP32 and ESP8266 sensor nodes to a gateway, telemetry services, and a web dashboard.',
    details: 'The documented system covers container temperature, humidity and gas sensing, driver-state monitoring, MQTT and WebSocket transport, and historical data through a Node.js API with MongoDB. Preview readings below are simulated—not live device data.',
    tags: ['ESP32', 'ESP8266', 'nRF24L01', 'MQTT', 'Node.js', 'MongoDB'],
    link: 'https://block-chain-xi-azure.vercel.app/login',
    linkLabel: 'Open FarmTrace',
    source: 'https://github.com/riteshrts2k4757-star/Block-Chain',
    sourceLabel: 'Source code',
    previewTabs: ['Overview', 'Telemetry', 'Integrity']
  },
  {
    id: 'bookyourtour',
    number: '02',
    name: 'BookYourTour',
    subtitle: 'Travel booking platform',
    status: 'Full-stack application',
    description: 'A full-stack travel platform for discovering destinations, booking packages, and managing trips through a dedicated admin experience.',
    details: 'The portfolio project includes user authentication, booking workflows, tour management, and separate admin and guide surfaces backed by REST APIs.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT', 'REST API'],
    link: '/tours',
    linkLabel: 'Explore the app',
    source: 'https://github.com/riteshrts2k4757-star/BookYourTour',
    sourceLabel: 'Source code',
    previewTabs: ['Discover', 'My trips', 'Manage']
  },
  {
    id: 'radar',
    number: '03',
    name: 'ML-Based Radar System',
    subtitle: 'Embedded sensing & object detection',
    status: 'Machine learning + embedded',
    description: 'An ESP32 radar project combining real-time object detection, tracking, visualization, and movement classification.',
    details: 'The repository describes a machine-learning-powered radar workflow that brings sensor observations and model outputs into a real-time visual interface.',
    tags: ['ESP32', 'Machine learning', 'Object detection', 'JavaScript'],
    link: 'https://github.com/riteshrts2k4757-star/Ml_Based_Radar_System',
    linkLabel: 'View project',
    previewTabs: ['Scan', 'Tracking', 'Classifier']
  },
  {
    id: 'banking',
    number: '04',
    name: 'Simple Banking Application',
    subtitle: 'Account & transaction workflow demo',
    status: 'Interactive web demo',
    description: 'A browser-based banking interface focused on account balance views, deposit and withdrawal actions, and transaction history.',
    details: 'This is a demonstration application, not a financial service. Its current portfolio description documents transaction handling and UI updates; no live banking integration or credit-estimation model is represented.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Transaction UI'],
    previewTabs: ['Overview', 'Activity', 'Transfer']
  },
  {
    id: 'water',
    number: '05',
    name: 'Smart Water Tank',
    subtitle: 'Connected monitoring & pump control',
    status: 'IoT prototype',
    description: 'An ESP32 water-level monitor that uses an ultrasonic sensor and relay logic to automate a tank motor.',
    details: 'The project is described in the existing portfolio as a real-time water-level system with automatic motor control based on the measured level.',
    tags: ['ESP32', 'Ultrasonic sensor', 'Relay', 'Web dashboard'],
    source: 'https://github.com/Shreekant-Bharti/BeyondInfinity',
    sourceLabel: 'Source code',
    previewTabs: ['Level', 'History', 'Controls']
  }
];

const skillGroups = [
  { name: 'Languages', icon: Code2, skills: ['JavaScript', 'Python', 'C++', 'C', 'Java', 'HTML5', 'CSS3'] },
  { name: 'Frontend', icon: Monitor, skills: ['React', 'Vite', 'Tailwind CSS', 'Responsive design', 'Interactive UI'] },
  { name: 'Backend & APIs', icon: Server, skills: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'WebSockets', 'JWT'] },
  { name: 'Data', icon: Database, skills: ['MongoDB', 'MySQL', 'Supabase', 'Data modeling', 'Transactions'] },
  { name: 'Machine learning', icon: Brain, skills: ['Scikit-learn', 'TensorFlow', 'XGBoost', 'YOLOv8', 'CNNs', 'NumPy', 'Pandas', 'Matplotlib', 'Prophet', 'Gemini API'] },
  { name: 'Hardware & IoT', icon: CircuitBoard, skills: ['ESP32', 'Arduino', 'Sensors', 'Telemetry', 'nRF24', 'MQTT', 'Hardware integration', 'Real-time monitoring'] },
  { name: 'Tools & delivery', icon: Layers, skills: ['Git', 'GitHub', 'Docker', 'AWS / Ubuntu', 'Postman', 'VS Code', 'pgAdmin4', 'Render', 'Vercel', 'Antigravity'] }
];

const architectureStages = [
  { name: 'Sensors', tech: 'DHT11 · MQ sensors · GPS', icon: Activity, explanation: 'Sensors turn physical conditions—such as temperature, humidity, gas, or motion—into measurements an embedded system can collect.' },
  { name: 'Microcontroller', tech: 'ESP32 · ESP8266 · Arduino', icon: Cpu, explanation: 'A microcontroller reads sensor values, applies device-side logic, and prepares data for reliable transmission.' },
  { name: 'Wireless link', tech: 'nRF24L01 · Wi-Fi', icon: Radio, explanation: 'Local radio and Wi-Fi links move measurements from sensor nodes to a gateway or network service.' },
  { name: 'Transport', tech: 'MQTT · WebSockets · APIs', icon: Network, explanation: 'Messaging and API layers deliver telemetry to the application, using MQTT for lightweight device communication and WebSockets for live updates.' },
  { name: 'Storage', tech: 'MongoDB · Supabase', icon: Database, explanation: 'A data store keeps historical readings and application records available for later review and analysis.' },
  { name: 'Intelligence', tech: 'Python · ML workflows', icon: Brain, explanation: 'Analytics and machine-learning workflows can inspect trends or classify patterns when supported by a trained model and validated data.' },
  { name: 'Interface', tech: 'React · dashboards', icon: Monitor, explanation: 'A responsive dashboard turns system events into readable status, history, and controls for people operating the system.' }
];

const highlights = [
  { icon: Radio, title: 'A device-to-dashboard path', text: 'FarmTrace documents sensor nodes, a wireless gateway, MQTT and WebSocket transport, and a web dashboard.' },
  { icon: Globe2, title: 'Full product workflows', text: 'The portfolio includes a tour-booking experience with booking, authentication, and admin and guide surfaces.' },
  { icon: Zap, title: 'Interfaces for real-time control', text: 'Projects range from a water-tank monitoring prototype to an RC Pathfinder game with a phone-as-controller flow.' }
];

function CapabilityVisual({ type }) {
  if (type === 'web') {
    return (
      <div className="capability-visual web-visual" aria-hidden="true">
        <div className="visual-browser">
          <div className="visual-browser-bar"><i /><i /><i /><span>app.local/dashboard</span></div>
          <div className="visual-browser-content">
            <div className="visual-sidebar"><b /><i /><i /><i /></div>
            <div className="visual-content-lines"><b /><span /><span /><div><i /><i /><i /></div></div>
          </div>
        </div>
        <span className="visual-chip"><Code2 size={15} /> UI</span>
        <span className="visual-chip visual-chip-bottom"><Database size={15} /> API + data</span>
      </div>
    );
  }

  if (type === 'hardware') {
    return (
      <div className="capability-visual hardware-visual" aria-hidden="true">
        <div className="hardware-node"><Cpu size={27} /><span>ESP32</span></div>
        <div className="hardware-waves"><i /><i /><i /></div>
        <div className="hardware-sensor"><Activity size={20} /><span>sensor</span></div>
        <div className="hardware-signal"><Signal size={19} /><b /><b /><b /></div>
      </div>
    );
  }

  return (
    <div className="capability-visual ml-visual" aria-hidden="true">
      <div className="ml-pipeline"><span><Database size={17} /></span><i /><span><Brain size={18} /></span><i /><span><Activity size={17} /></span></div>
      <div className="ml-chart"><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <span className="ml-label">data → model → output</span>
    </div>
  );
}

function ProjectPreview({ project }) {
  const [activeTab, setActiveTab] = useState(project.previewTabs[0]);
  const farmtrace = project.id === 'farmtrace';
  const tour = project.id === 'bookyourtour';
  const radar = project.id === 'radar';
  const banking = project.id === 'banking';
  const water = project.id === 'water';

  return (
    <div className={`project-device preview-${project.id}`}>
      <div className="device-topbar">
        <span className="device-lights"><i /><i /><i /></span>
        <span className="device-url">{farmtrace ? 'farmtrace / dashboard' : tour ? 'bookyourtour / discover' : radar ? 'radar / scan' : banking ? 'account / overview' : water ? 'water / monitor' : 'rc-control / cockpit'}</span>
        <span className="device-menu">•••</span>
      </div>
      <div className="preview-inner">
        <div className="preview-heading">
          <div>
            <span className="preview-eyebrow">{farmtrace ? 'COLD-CHAIN SYSTEM' : tour ? 'TRAVEL PLANNER' : radar ? 'SENSOR VISUALIZATION' : banking ? 'DEMO ACCOUNT' : water ? 'WATER SYSTEM' : 'CONTROL LINK'}</span>
            <h3>{farmtrace ? 'Fleet overview' : tour ? 'Find your next stay' : radar ? 'Radar scan preview' : banking ? 'Account overview' : water ? 'Tank status' : 'Pilot console'}</h3>
          </div>
          <span className="preview-status"><i /> {farmtrace ? 'DEMO' : tour ? 'EXPLORE' : radar ? 'PREVIEW' : banking ? 'SAMPLE' : water ? 'LOCAL' : 'DEMO UI'}</span>
        </div>
        <div className="preview-tabs" role="tablist" aria-label={`${project.name} preview`}>
          {project.previewTabs.map(tab => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {farmtrace && activeTab === 'Overview' ? (
          <>
            <div className="preview-stats">
              <div className="preview-stat"><span>Temperature</span><strong>4.2°</strong><small>SIMULATED</small></div>
              <div className="preview-stat"><span>Humidity</span><strong>67%</strong><small>SIMULATED</small></div>
              <div className="preview-stat"><span>Telemetry</span><strong>Demo</strong><small>NO LIVE DEVICE</small></div>
            </div>
            <div className="preview-bottom-row"><span><Signal size={12} /> MQTT · demonstration</span><span><Activity size={12} /> sample event log</span></div>
          </>
        ) : farmtrace && activeTab === 'Integrity' ? (
          <div className="preview-integrity">
            <ShieldCheck size={26} />
            <div><strong>Integrity record preview</strong><span>Digest of demo text · not live verification</span></div>
            <code>SHA-256 · 2a81c9ea5ec1229805c728d519b0e724c700d38eaa046238616a1533115eef8b</code>
          </div>
        ) : farmtrace && activeTab === 'Telemetry' ? (
          <div className="preview-event-list">
            <span><i /> Container sensor <b>Sample temperature event</b><small>SIMULATED DATA</small></span>
            <span><i /> Driver node <b>Sample gateway update</b><small>SIMULATED DATA</small></span>
          </div>
        ) : tour ? (
          <div className={`tour-preview tour-preview-${activeTab.toLowerCase().replaceAll(' ', '-')}`}>
            <div className="tour-destination"><span>{activeTab === 'Discover' ? 'HIMALAYAS · 5 DAYS' : activeTab === 'My trips' ? 'YOUR PLANNER' : 'ADMIN WORKSPACE'}</span><strong>{activeTab === 'Discover' ? <>Mountain<br />escape</> : activeTab === 'My trips' ? <>Upcoming<br />itinerary</> : <>Tour<br />listings</>}</strong><button type="button" aria-label={activeTab === 'Discover' ? 'Explore destinations' : activeTab === 'My trips' ? 'View trip itinerary' : 'Manage tour listings'} onClick={() => setActiveTab(current => current === 'Discover' ? 'My trips' : 'Discover')}>{activeTab === 'Discover' ? 'Explore stay' : activeTab === 'My trips' ? 'View itinerary' : 'Manage trips'} <ArrowUpRight size={13} /></button></div>
            <div className="tour-side"><span>{activeTab === 'Discover' ? 'POPULAR' : activeTab === 'My trips' ? 'BOOKING STATUS' : 'BOOKINGS'}</span><b>{activeTab === 'Discover' ? <>Coastal<br />weekend</> : activeTab === 'My trips' ? <>Trip<br />overview</> : <>Guest<br />requests</>}</b><i>{activeTab === 'Discover' ? 'Browse packages' : activeTab === 'My trips' ? 'Manage plans' : 'Review bookings'} <ArrowRight size={12} /></i></div>
          </div>
        ) : radar ? (
          <div className="radar-preview">
            <div className="radar-circle"><i /><i /><i /><span /></div>
            <div className="radar-readout"><span>DETECTED OBJECTS</span><strong>{activeTab === 'Classifier' ? 'Classifying' : activeTab === 'Tracking' ? 'Tracking' : 'Scanning'}</strong><i /><i /><i /></div>
          </div>
        ) : banking ? (
          <div className="bank-preview">
            <span>DEMO BALANCE · FICTIONAL <b>$4,280.00</b></span>
            <div className="bank-chart"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="bank-row"><span>Recent activity</span><b>{activeTab === 'Transfer' ? 'Transfer preview' : 'Account activity'}</b></div>
          </div>
        ) : water ? (
          <div className="water-preview">
            <div className="water-tank"><span><i /></span><b>LEVEL<br /><strong>DEMO</strong></b></div>
            <div className="water-readout"><span>ULTRASONIC SENSOR</span><strong>{activeTab === 'Controls' ? 'Motor control' : activeTab === 'History' ? 'Recent samples' : 'Level monitor'}</strong><small>Illustrative interface</small></div>
          </div>
        ) : (
          <div className="plane-preview">
            <div className="plane-compass"><span>↑</span><i /></div>
            <div className="plane-controls"><span>CONTROL LINK</span><strong>{activeTab === 'Signal' ? 'Wireless signal' : activeTab === 'Status' ? 'System status' : 'Manual control'}</strong><div><i /><i /><i /></div></div>
          </div>
        )}
        {farmtrace && <div className="preview-disclaimer">Illustrative sample · no live telemetry</div>}
      </div>
      <div className="device-stand"><span /></div>
    </div>
  );
}

function ProjectShowcase({ project, index }) {
  const [expanded, setExpanded] = useState(false);
  const description = (
    <div className="project-copy">
      <div className="project-index"><span>{project.number}</span><span>{project.status}</span></div>
      <p className="project-kicker">{project.subtitle}</p>
      <h3>{project.name}</h3>
      <p className="project-description">{project.description}</p>
      <div className="project-tags">
        {project.tags.map(tag => <span key={tag}>{tag}</span>)}
      </div>
      <div className="project-actions">
        {project.link && (
          project.link.startsWith('/') ? (
            <Link className="project-open-link" to={project.link}>{project.linkLabel}<ArrowUpRight size={16} /></Link>
          ) : (
            <a className="project-open-link" href={project.link} target="_blank" rel="noreferrer">{project.linkLabel}<ArrowUpRight size={16} /></a>
          )
        )}
        {project.source && (
          <a className="project-source-link" href={project.source} target="_blank" rel="noreferrer">{project.sourceLabel}<Code2 size={15} /></a>
        )}
        <button className="project-details-button" type="button" aria-expanded={expanded} onClick={() => setExpanded(current => !current)}>
          {expanded ? 'Hide details' : 'Project details'}
        </button>
      </div>
      {expanded && <p className="project-details">{project.details}</p>}
    </div>
  );

  return (
    <article className={`project-row${index % 2 === 1 ? ' project-row-reverse' : ''}`} id={`project-${project.id}`}>
      <ProjectPreview project={project} />
      {description}
    </article>
  );
}

function HeroRole() {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => setRoleIndex(index => (index + 1) % roles.length), 2800);
    return () => window.clearInterval(timer);
  }, []);

  return <p className="hero-role" key={roleIndex} aria-live="polite">{roles[roleIndex]}</p>;
}

function HomeContactForm() {
  const [contact, setContact] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio inquiry from ${contact.name}`);
    const body = encodeURIComponent(`Name: ${contact.name}\nEmail: ${contact.email}\n\n${contact.message}`);
    window.location.href = `mailto:riteshrana2k4@gmail.com?subject=${subject}&body=${body}`;
    setContactStatus('Your email app should open with a draft. The message has not been sent yet.');
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form-title"><span><MessageCircle size={19} /></span><div><h3>Start a conversation</h3><p>This opens an email draft in your email app.</p></div></div>
      <label htmlFor="contact-name">Your name</label>
      <input id="contact-name" name="name" autoComplete="name" required value={contact.name} onChange={event => setContact(current => ({ ...current, name: event.target.value }))} placeholder="Name" />
      <label htmlFor="contact-email">Email address</label>
      <input id="contact-email" name="email" type="email" autoComplete="email" required value={contact.email} onChange={event => setContact(current => ({ ...current, email: event.target.value }))} placeholder="you@example.com" />
      <label htmlFor="contact-message">Message</label>
      <textarea id="contact-message" name="message" rows="4" required value={contact.message} onChange={event => setContact(current => ({ ...current, message: event.target.value }))} placeholder="What are you building?" />
      <button className="button-primary contact-submit" type="submit">Create email draft <ArrowUpRight size={16} /></button>
      {contactStatus && <p className="contact-status" role="status">{contactStatus}</p>}
    </form>
  );
}

function Home() {
  const [activeSkillGroup, setActiveSkillGroup] = useState('All');
  const [activeStage, setActiveStage] = useState(0);
  const skillGroupsToShow = activeSkillGroup === 'All' ? skillGroups : skillGroups.filter(group => group.name === activeSkillGroup);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const sections = document.querySelectorAll('.home-section .home-container');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="portfolio-home">
      <section className="home-hero" id="home">
        <div className="hero-grid-pattern" aria-hidden="true" />
        <div className="home-container hero-layout">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> BUILDING ACROSS THE STACK</p>
            <h1><span className="hero-name-line">Ritesh Kumar</span><br /><span>Rana</span></h1>
            <HeroRole />
            <p className="hero-intro">I'm a full-stack developer and technology builder who connects web applications, hardware, and machine learning to create practical solutions for real-world problems.</p>
            <p className="hero-support">From interactive web experiences to connected IoT devices and intelligent ML systems, I build solutions across the complete technology stack.</p>
            <div className="hero-actions">
              <a className="button-primary" href="#projects">Explore my projects <ArrowDown size={16} /></a>
              <a className="button-secondary" href="#contact">Contact me <ArrowUpRight size={16} /></a>
              <a className="hero-github" href="https://github.com/riteshrts2k4757-star" target="_blank" rel="noreferrer" aria-label="Visit Ritesh's GitHub profile"><Code2 size={19} /></a>
            </div>
            <div className="hero-meta"><span><MapPin size={14} /> BIT Sindri, Dhanbad</span><span>B.Tech · Information Technology</span></div>
          </div>

          <div className="hero-art" aria-label="Illustration of connected software, hardware, and data systems">
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
            <div className="hero-terminal">
              <div className="terminal-bar"><span><i /><i /><i /></span><b>ritesh / systems</b><span>•••</span></div>
              <div className="terminal-code">
                <span><i>01</i><b>const</b> builder = {`{`}</span>
                <span><i>02</i>&nbsp; web: <em>"React + APIs"</em>,</span>
                <span><i>03</i>&nbsp; hardware: <em>"ESP32 + sensors"</em>,</span>
                <span><i>04</i>&nbsp; intelligence: <em>"ML + data"</em></span>
                <span><i>05</i>{`}`};</span>
                <span className="terminal-cursor">▍</span>
              </div>
              <div className="terminal-footer"><span><i /> illustrative system</span><span>build / connect / learn</span></div>
            </div>
            <div className="hero-float-card float-device"><Cpu size={17} /><span>ESP32 node</span><b><i /> concept</b></div>
            <div className="hero-float-card float-data"><Activity size={17} /><span>data flow</span><div><i /><i /><i /><i /><i /><i /></div></div>
            <div className="hero-visual-caption"><span>01 — 03</span><span>software · devices · intelligence</span></div>
          </div>
        </div>
        <a className="scroll-cue" href="#what-i-do"><span>SCROLL TO EXPLORE</span><ArrowDown size={15} /></a>
      </section>

      <section className="home-section what-section" id="what-i-do">
        <div className="home-container">
          <div className="section-heading">
            <p className="eyebrow">01 / WHAT I DO</p>
            <h2>One builder.<br /><span>Three connected disciplines.</span></h2>
            <p>I like working where software meets the physical world—and turning complex systems into tools people can use.</p>
          </div>
          <div className="capability-grid">
            {capabilities.map(item => {
              const Icon = item.icon;
              return (
                <article className={`capability-card capability-${item.visual}`} key={item.number}>
                  <div className="capability-card-top"><span className="capability-icon"><Icon size={20} /></span><span>{item.number}</span></div>
                  <CapabilityVisual type={item.visual} />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="capability-tags">{item.stack.map(tag => <span key={tag}>{tag}</span>)}</div>
                  <a href="#projects" className="capability-link">Explore related work <ArrowRight size={15} /></a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-section projects-section" id="projects">
        <div className="home-container">
          <div className="section-heading projects-heading">
            <div><p className="eyebrow">02 / SELECTED PROJECTS</p><h2>Built beyond<br /><span>the screen.</span></h2></div>
            <p>From connected devices to full-stack products, each project is a chance to learn by building. Preview controls are interactive; simulated data is clearly marked.</p>
          </div>
          <div className="project-showcases">
            {projects.map((project, index) => <ProjectShowcase key={project.id} project={project} index={index} />)}
          </div>
        </div>
      </section>

      <section className="home-section architecture-section" id="architecture">
        <div className="home-container architecture-layout">
          <div className="section-heading">
            <p className="eyebrow">03 / SYSTEMS THINKING</p>
            <h2>From hardware to<br /><span>intelligence to interface.</span></h2>
            <p>A connected system is only useful when every layer works together. Select a stage to see its role in the pipeline.</p>
          </div>
          <div className="architecture-panel">
            <div className="architecture-flow" aria-label="Interactive system architecture stages">
              {architectureStages.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <div className="architecture-stage-wrap" key={stage.name}>
                    <button className={`architecture-stage${activeStage === index ? ' selected' : ''}`} type="button" aria-pressed={activeStage === index} onClick={() => setActiveStage(index)}>
                      <span><Icon size={19} /></span><strong>{stage.name}</strong><small>{stage.tech}</small>
                    </button>
                    {index < architectureStages.length - 1 && <ArrowRight className="architecture-arrow" size={17} aria-hidden="true" />}
                  </div>
                );
              })}
            </div>
            <div className="architecture-explanation" aria-live="polite">
              <span className="architecture-selected-icon"><Check size={16} /></span>
              <div><strong>{architectureStages[activeStage].name} · {architectureStages[activeStage].tech}</strong><p>{architectureStages[activeStage].explanation}</p></div>
            </div>
            <p className="architecture-note">Illustrative architecture pattern · components vary by project.</p>
          </div>
        </div>
      </section>

      <section className="home-section skills-section" id="skills">
        <div className="home-container">
          <div className="section-heading skills-heading">
            <div><p className="eyebrow">04 / MY TECHNICAL TOOLKIT</p><h2>Tools for the<br /><span>whole system.</span></h2></div>
            <p>A practical mix of languages, frameworks, data tools, and hardware platforms I use while building and experimenting.</p>
          </div>
          <div className="skill-filter" role="tablist" aria-label="Filter skills by category">
            {['All', ...skillGroups.map(group => group.name)].map(group => (
              <button key={group} type="button" role="tab" aria-selected={activeSkillGroup === group} onClick={() => setActiveSkillGroup(group)}>{group}</button>
            ))}
          </div>
          <div className="skill-groups">
            {skillGroupsToShow.map(group => {
              const Icon = group.icon;
              return (
                <section className="skill-group" key={group.name}>
                  <h3><span><Icon size={17} /></span>{group.name}</h3>
                  <div className="skill-grid">{group.skills.map((skill, index) => <div className="skill-tile" key={skill}><span className="skill-symbol">{skill.slice(0, 2).toUpperCase()}</span><strong>{skill}</strong><i style={{ '--skill-order': index }} /></div>)}</div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-section about-section" id="about">
        <div className="home-container about-layout">
          <div className="section-heading">
            <p className="eyebrow">05 / A LITTLE ABOUT ME</p>
            <h2>Curious by nature.<br /><span>Engineering by practice.</span></h2>
            <p>I'm interested in full-stack engineering, IoT systems, and applied machine learning—especially when they come together to solve a practical problem.</p>
            <div className="about-interests"><span><Code2 size={15} /> Full-stack engineering</span><span><CircuitBoard size={15} /> Connected systems</span><span><Brain size={15} /> Applied ML</span></div>
          </div>
          <div className="education-card">
            <div className="education-card-top"><span><MapPin size={16} /> DHANBAD, INDIA</span><span>2024 — PRESENT</span></div>
            <div className="education-mark">BIT<span>.</span></div>
            <p className="education-label">EDUCATION</p>
            <h3>B.Tech in Information Technology</h3>
            <p className="education-school">BIT Sindri, Dhanbad</p>
            <div className="education-footer"><span>Current CGPA</span><strong>8.3</strong></div>
          </div>
        </div>
      </section>

      <section className="home-section highlights-section" id="highlights">
        <div className="home-container">
          <div className="section-heading">
            <p className="eyebrow">06 / ENGINEERING NOTES</p>
            <h2>Work that connects<br /><span>the pieces.</span></h2>
          </div>
          <div className="highlights-grid">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return <article className="highlight-item" key={item.title}><span className="highlight-number">0{index + 1}</span><span className="highlight-icon"><Icon size={19} /></span><h3>{item.title}</h3><p>{item.text}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section className="home-section contact-section" id="contact">
        <div className="home-container contact-layout">
          <div className="contact-copy">
            <p className="eyebrow">07 / GET IN TOUCH</p>
            <h2>Have an idea?<br /><span>Let's build something useful.</span></h2>
            <p>Open to conversations about software, hardware, machine learning, and interesting problems to solve.</p>
            <a className="contact-email" href="mailto:riteshrana2k4@gmail.com"><Mail size={18} /> riteshrana2k4@gmail.com <ArrowUpRight size={15} /></a>
            <a className="contact-github" href="https://github.com/riteshrts2k4757-star" target="_blank" rel="noreferrer"><Code2 size={17} /> github.com/riteshrts2k4757-star</a>
          </div>
          <HomeContactForm />
        </div>
      </section>
    </main>
  );
}

export default Home;
