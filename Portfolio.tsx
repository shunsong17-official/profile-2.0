import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowDown, Plus, Minus, Linkedin, Instagram, Sparkles, Send, X, Loader2, Copy, Lightbulb, PenTool } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Experience {
  role: string;
  company: string;
  location: string;
  period: string;
  details: string[];
}

interface Education {
  degree: string;
  school: string;
  year: string;
  desc: string;
}

interface ChatMessage {
  role: 'assistant' | 'user';
  text: string;
}

const Portfolio = () => {
  const [openAccordion, setOpenAccordion] = useState<number>(0); 
  const [scrolled, setScrolled] = useState(false);
  
  // --- AI Chat State ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: "Hi! I'm Yimin's AI assistant. Ask me anything about her experience, skills, or availability." }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- AI Magic Studio State ---
  const [activeMagicTool, setActiveMagicTool] = useState<'letter' | 'campaign'>('letter');
  
  // Cover Letter State
  const [companyName, setCompanyName] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);

  // PR Campaign State
  const [brandName, setBrandName] = useState('');
  const [generatedCampaign, setGeneratedCampaign] = useState('');
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);


  // Resume Data for Context
  const experiences: Experience[] = [
    {
      role: "Wait Staff",
      company: "Kingsford Peking Restaurant",
      location: "Sydney",
      period: "2025 - Present",
      details: [
        "Deliver high-quality customer service in a fast-paced dining environment.",
        "Manage reservations, accurate order taking, and payment processing via POS systems.",
        "Communicate effectively between customers and kitchen staff."
      ]
    },
    {
      role: "Marketing Intern",
      company: "Porsche",
      location: "Shanghai",
      period: "July 2025 - Aug 2025",
      details: [
        "Implemented marketing campaigns online and offline.",
        "Managed social media accounts (RedNote, Douyin, WeChat).",
        "Provided customer support via digital platforms and verified financial reports."
      ]
    },
    {
      role: "Media Intern",
      company: "Shanghai United Media Group",
      location: "Shanghai",
      period: "Oct 2024 - May 2025",
      details: [
        "Created and scheduled content for various platforms.",
        "Edited videos and produced social media content.",
        "Conducted interviews and gathered stories for publication."
      ]
    },
    {
      role: "On-site Guide",
      company: "NANZUKA ART INSTITUTE",
      location: "Shanghai",
      period: "Feb 2024 - May 2024",
      details: [
        "Conducted guided tours for visitors and customers.",
        "Provided explanations of facilities and exhibitions.",
        "Promoted recommended products to customers."
      ]
    }
  ];

  const education: Education[] = [
    {
      degree: "Master of Public Relations & Advertising",
      school: "UNSW",
      year: "Exp. 2027",
      desc: "First year Master of Media student."
    },
    {
      degree: "Bachelor of Journalism",
      school: "SHUPL",
      year: "Graduated",
      desc: "Focus on media studies and communication."
    }
  ];

  const skills = "English, Mandarin, Shanghainese, Adobe Suite, Tableau, Social Ops, RSA Certified";

  // Handle scroll for navbar style
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? -1 : index);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- Gemini API Handler ---
  const callGeminiAPI = async (prompt: string, systemInstruction: string = "") => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return "Error: Gemini API Key is missing. Please check your configuration.";
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-09-2025",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction: systemInstruction,
        }
      });

      return response.text || "Sorry, I couldn't process that.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm having trouble connecting right now. Please try again later.";
    }
  };

  // --- Chat Logic ---
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userText = currentMessage;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setCurrentMessage('');
    setIsChatLoading(true);

    const systemPrompt = `You are an AI assistant for Yimin Gu's portfolio website. 
    Act as Yimin's professional representative.
    Yimin's Experience: ${JSON.stringify(experiences)}
    Yimin's Education: ${JSON.stringify(education)}
    Yimin's Skills: ${skills}
    
    Rules:
    1. Keep answers concise, professional, and slightly enthusiastic (PR/Media style).
    2. If asked about contact info, provide: shunsong17@gmail.com.
    3. If asked about something not in the resume, say you don't have that info but suggest contacting Yimin directly.
    4. Speak in the first person plural (e.g., "We believe," "Yimin is") or third person ("Yimin has...").
    5. Current context: User is on the portfolio website.`;

    const aiResponse = await callGeminiAPI(userText, systemPrompt);

    setChatMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    setIsChatLoading(false);
  };

  // --- Cover Letter Logic ---
  const handleGenerateLetter = async () => {
    if (!companyName.trim()) return;
    setIsGeneratingLetter(true);
    setGeneratedLetter('');

    const prompt = `Write a short, punchy, and professional cover letter opening paragraph (3-4 sentences max) for Yimin Gu applying to a role at ${companyName}. 
    Highlight her bilingual skills (English/Mandarin), her internship at Porsche, and her Master's degree at UNSW. 
    Tone: Confident, modern, and suitable for a PR/Media role.`;

    const result = await callGeminiAPI(prompt);
    setGeneratedLetter(result);
    setIsGeneratingLetter(false);
  };

  // --- PR Campaign Logic ---
  const handleGenerateCampaign = async () => {
    if (!brandName.trim()) return;
    setIsGeneratingCampaign(true);
    setGeneratedCampaign('');

    const prompt = `Act as a creative Public Relations strategist.
    The user inputs a brand name: "${brandName}".
    Generate a mini PR campaign strategy for this brand.
    Output Format:
    1. A Catchy Campaign Slogan (English).
    2. Three distinct activation ideas (e.g., Social Media Challenge, Pop-up Event, Cross-brand Collaboration).
    Tone: Innovative, Gen-Z friendly, suitable for the Australian or Chinese market.
    Keep it brief but impactful.`;

    const result = await callGeminiAPI(prompt);
    setGeneratedCampaign(result);
    setIsGeneratingCampaign(false);
  };

  return (
    <div className="bg-white text-neutral-900 font-sans selection:bg-black selection:text-white relative">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${scrolled ? 'bg-white/90 backdrop-blur-sm border-b border-neutral-100 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-screen-xl mx-auto px-6 flex justify-between items-center">
          <a href="#" className={`text-sm font-bold tracking-widest uppercase transition-colors ${scrolled ? 'text-black' : 'text-white'}`}>Yimin Gu</a>
          <div className={`flex gap-6 text-xs font-medium uppercase tracking-widest transition-colors ${scrolled ? 'text-neutral-500' : 'text-neutral-400'}`}>
            {['Profile', 'Experience', 'Contact'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className={`transition-colors hover:opacity-70 ${scrolled ? 'hover:text-black' : 'hover:text-white'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* SECTION 1: The Quote (Cover Page) */}
      <section id="home" className="h-screen w-full bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <h1 className="text-[5vw] md:text-[6vw] font-medium text-white tracking-tighter text-center whitespace-nowrap transform scale-y-[0.7] origin-center">
          The World Is My Oyster
        </h1>
        <div className="absolute bottom-12 animate-bounce text-white/50">
           <button onClick={() => scrollToSection('profile')} aria-label="Scroll Down">
             <ArrowDown size={32} strokeWidth={1} />
           </button>
        </div>
      </section>

      {/* SECTION 2: Profile */}
      <section id="profile" className="min-h-screen flex items-center py-20 px-6 max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 w-full items-center">
          <div className="flex flex-col justify-center order-2 md:order-1">
            <p className="text-neutral-400 text-xs font-bold tracking-[0.2em] uppercase mb-8">Based in Sydney</p>
            <h2 className="text-7xl md:text-[8rem] font-bold tracking-tighter leading-[0.9] text-black uppercase mb-10">
              Yimin <br /> Gu
            </h2>
            <div className="max-w-md space-y-8">
               <div className="flex gap-6 items-center pt-4 pl-6">
                  <a href="https://www.instagram.com/shunsong_17?igsh=ZnBqNnd4MXNxZzVu&utm_source=qr" target="_blank" rel="noreferrer" className="text-neutral-900 hover:text-neutral-500 transition-colors"><Instagram size={24} strokeWidth={1.5} /></a>
                  <a href="http://linkedin.com/in/yimin-gu-b19047386" target="_blank" rel="noreferrer" className="text-neutral-900 hover:text-neutral-500 transition-colors"><Linkedin size={24} strokeWidth={1.5} /></a>
                  <a href="mailto:shunsong17@gmail.com" className="text-neutral-900 hover:text-neutral-500 transition-colors"><Mail size={24} strokeWidth={1.5} /></a>
               </div>
            </div>
          </div>
          <div className="order-1 md:order-2 h-[60vh] w-full relative bg-neutral-100 overflow-hidden rounded-sm">
             <img src="https://images.unsplash.com/photo-1629471963065-27a3c3070442?q=80&w=1887&auto=format&fit=crop" alt="Yimin Gu Portrait" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"/>
             <div className="absolute top-4 right-4 text-white mix-blend-difference text-xs font-mono uppercase tracking-widest hidden md:block">Portrait — 2026</div>
          </div>
        </div>
      </section>
      
      <hr className="border-neutral-100 max-w-screen-xl mx-auto" />

      {/* Quick Info Grid */}
      <section className="py-24 px-6 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div><h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Languages</h4><p className="text-sm leading-loose">English<br/>Mandarin<br/>Shanghainese</p></div>
            <div><h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Skills</h4><p className="text-sm leading-loose">Adobe Suite<br/>Tableau<br/>Social Ops</p></div>
            <div><h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Certification</h4><p className="text-sm leading-loose">RSA Certified</p></div>
            <div><h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Status</h4><p className="text-sm leading-loose text-green-600 font-medium">● Available</p></div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-24 px-6 bg-neutral-50">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-black pb-6">
            <h2 className="text-5xl md:text-7xl font-medium tracking-tighter">Experience</h2>
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-2 md:mb-1">Selected Works</p>
          </div>
          <div className="space-y-0">
            {experiences.map((exp, index) => (
              <div key={index} className="border-b border-neutral-200 group">
                <button onClick={() => toggleAccordion(index)} className="w-full py-10 flex flex-col md:flex-row justify-between items-start md:items-center text-left hover:bg-white transition-colors px-4 -mx-4 rounded-lg">
                  <div className="flex-1"><span className="text-xs text-neutral-400 font-mono mb-2 block">{exp.period}</span><h3 className="text-2xl md:text-3xl font-medium group-hover:translate-x-2 transition-transform duration-300">{exp.role}</h3></div>
                  <div className="flex-1 md:text-center mt-2 md:mt-0"><span className="text-lg text-neutral-600 font-medium">{exp.company}</span></div>
                  <div className="hidden md:flex flex-1 justify-end items-center gap-4"><span className="text-sm text-neutral-400">{exp.location}</span><span className="text-neutral-300">{openAccordion === index ? <Minus size={24} strokeWidth={1} /> : <Plus size={24} strokeWidth={1} />}</span></div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openAccordion === index ? 'max-h-96 opacity-100 pb-10' : 'max-h-0 opacity-0'}`}>
                   <div className="grid md:grid-cols-3 gap-8 px-2">
                      <div className="md:col-start-2 md:col-span-2 pl-4 border-l border-neutral-200">
                        <ul className="space-y-3">
                            {exp.details.map((detail, i) => (<li key={i} className="text-neutral-600 text-sm leading-relaxed">{detail}</li>))}
                        </ul>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education & Volunteering */}
      <section id="education" className="py-24 px-6 max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-2 gap-24">
            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-12 flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span> Education</h3>
                <div className="space-y-16">
                    {education.map((edu, i) => (
                        <div key={i} className="group">
                            <h4 className="text-3xl font-medium mb-2 group-hover:underline decoration-1 underline-offset-4">{edu.degree}</h4>
                            <div className="flex justify-between items-center text-sm mt-4 border-t border-neutral-200 pt-4"><span className="font-bold">{edu.school}</span><span className="text-neutral-500 font-mono">{edu.year}</span></div>
                            <p className="text-sm text-neutral-500 mt-2">{edu.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-12 flex items-center gap-2"><span className="w-2 h-2 bg-black rounded-full"></span> Volunteering</h3>
                 <div className="space-y-16">
                    <div><h4 className="text-3xl font-medium mb-2">Aus-CNY Gala</h4><div className="flex justify-between items-center text-sm mt-4 border-t border-neutral-200 pt-4"><span className="font-bold">Ovideo Media</span><span className="text-neutral-500 font-mono">2026</span></div><p className="text-sm text-neutral-500 mt-2">Filmed and edited short videos for social media; assisted on-site operations.</p></div>
                    <div><h4 className="text-3xl font-medium mb-2">Library Volunteer</h4><div className="flex justify-between items-center text-sm mt-4 border-t border-neutral-200 pt-4"><span className="font-bold">Shanghai Library</span><span className="text-neutral-500 font-mono">2022-24</span></div><p className="text-sm text-neutral-500 mt-2">200+ hours of service organizing materials and guiding visitors.</p></div>
                </div>
            </div>
        </div>
      </section>

      {/* AI MAGIC STUDIO: Cover Letter + PR Brainstorm */}
      <section className="bg-neutral-50 py-24 px-6 border-t border-neutral-200">
        <div className="max-w-screen-xl mx-auto">
            
            <div className="mb-12 text-center md:text-left">
                <h3 className="text-4xl font-medium tracking-tighter mb-4 flex items-center gap-3 justify-center md:justify-start">
                   <Sparkles className="text-yellow-500" /> AI Magic Studio
                </h3>
                <p className="text-neutral-600 max-w-xl">
                   Experience the power of LLMs. Generate a personalized cover letter or brainstorm a quick PR campaign strategy to see my professional skills in action.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Tool Selector */}
                <div className="flex md:flex-col gap-4 min-w-[200px]">
                    <button 
                        onClick={() => setActiveMagicTool('letter')}
                        className={`flex items-center gap-3 px-6 py-4 rounded-xl text-left transition-all ${activeMagicTool === 'letter' ? 'bg-black text-white shadow-lg' : 'bg-white text-neutral-500 hover:bg-neutral-100'}`}
                    >
                        <PenTool size={20} />
                        <div>
                            <span className="block text-sm font-bold uppercase tracking-widest">Writer</span>
                            <span className="text-xs opacity-70">Cover Letter</span>
                        </div>
                    </button>
                    <button 
                        onClick={() => setActiveMagicTool('campaign')}
                        className={`flex items-center gap-3 px-6 py-4 rounded-xl text-left transition-all ${activeMagicTool === 'campaign' ? 'bg-black text-white shadow-lg' : 'bg-white text-neutral-500 hover:bg-neutral-100'}`}
                    >
                        <Lightbulb size={20} />
                        <div>
                            <span className="block text-sm font-bold uppercase tracking-widest">Brainstorm</span>
                            <span className="text-xs opacity-70">PR Campaign</span>
                        </div>
                    </button>
                </div>

                {/* Tool Workspace */}
                <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 min-h-[300px]">
                    
                    {/* Cover Letter Tool */}
                    {activeMagicTool === 'letter' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h4 className="text-xl font-medium mb-6">Magic Cover Letter Generator</h4>
                            {!generatedLetter ? (
                                <div className="space-y-4 max-w-lg">
                                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Target Company</label>
                                    <div className="flex gap-4">
                                        <input 
                                            type="text" 
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="e.g. Vogue, Google..." 
                                            className="flex-1 border-b-2 border-neutral-200 focus:border-black outline-none py-2 text-xl font-medium bg-transparent"
                                            onKeyDown={(e) => e.key === 'Enter' && handleGenerateLetter()}
                                        />
                                        <button 
                                            onClick={handleGenerateLetter}
                                            disabled={isGeneratingLetter || !companyName}
                                            className="bg-black text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isGeneratingLetter ? <Loader2 className="animate-spin" size={16} /> : 'Generate'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-lg leading-relaxed font-light text-neutral-800 italic border-l-4 border-yellow-400 pl-4 py-1 bg-yellow-50/50 mb-6">
                                        "{generatedLetter}"
                                    </p>
                                    <div className="flex gap-4">
                                        <button onClick={() => setGeneratedLetter('')} className="text-xs underline hover:text-neutral-500">Try Another</button>
                                        <button onClick={() => {navigator.clipboard.writeText(generatedLetter)}} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-neutral-500">
                                            <Copy size={14} /> Copy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PR Campaign Tool */}
                    {activeMagicTool === 'campaign' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h4 className="text-xl font-medium mb-6">PR Strategy Brainstorm</h4>
                            {!generatedCampaign ? (
                                <div className="space-y-4 max-w-lg">
                                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Brand / Product</label>
                                    <div className="flex gap-4">
                                        <input 
                                            type="text" 
                                            value={brandName}
                                            onChange={(e) => setBrandName(e.target.value)}
                                            placeholder="e.g. Nike, Local Cafe..." 
                                            className="flex-1 border-b-2 border-neutral-200 focus:border-black outline-none py-2 text-xl font-medium bg-transparent"
                                            onKeyDown={(e) => e.key === 'Enter' && handleGenerateCampaign()}
                                        />
                                        <button 
                                            onClick={handleGenerateCampaign}
                                            disabled={isGeneratingCampaign || !brandName}
                                            className="bg-black text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isGeneratingCampaign ? <Loader2 className="animate-spin" size={16} /> : 'Brainstorm'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-line bg-neutral-50 p-6 rounded-xl border border-neutral-100 mb-6 font-mono text-sm leading-relaxed">
                                        {generatedCampaign}
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setGeneratedCampaign('')} className="text-xs underline hover:text-neutral-500">New Strategy</button>
                                        <button onClick={() => {navigator.clipboard.writeText(generatedCampaign)}} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-neutral-500">
                                            <Copy size={14} /> Copy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
      </section>

      {/* Mood Break - Photography */}
      <section className="w-full">
         <div className="w-full h-[60vh] bg-neutral-900 flex flex-col items-center justify-center text-neutral-500 relative overflow-hidden">
            <p className="uppercase tracking-[0.5em] font-light z-10 text-white animate-pulse">Photography Portfolio</p>
            <p className="text-xs mt-4 tracking-widest">Coming Soon</p>
         </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-white text-black py-24 px-6 border-t border-neutral-100">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
          <div>
            <h2 className="text-6xl md:text-8xl font-medium tracking-tighter mb-8">Let's Talk.</h2>
            <div className="flex flex-col gap-2">
               <a href="mailto:shunsong17@gmail.com" className="text-xl border-b border-black pb-1 self-start hover:text-neutral-600 transition-colors">shunsong17@gmail.com</a>
            </div>
          </div>
          <div className="text-right">
             <p className="text-neutral-400 text-xs uppercase tracking-widest mb-2">Location</p>
             <p className="text-lg font-medium">Rosebery, NSW 2018</p>
             <p className="text-neutral-400 text-xs uppercase tracking-widest mt-8">© {new Date().getFullYear()} Yimin Gu</p>
          </div>
        </div>
      </footer>

      {/* AI Floating Chatbot */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
             {/* Chat Header */}
             <div className="bg-black text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                   <span className="font-medium text-sm">Yimin AI Assistant</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="hover:opacity-70"><X size={18} /></button>
             </div>
             
             {/* Messages Area */}
             <div className="h-80 overflow-y-auto p-4 bg-neutral-50 space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                        ? 'bg-black text-white rounded-br-none' 
                        : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-none shadow-sm'
                     }`}>
                        {msg.text}
                     </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                     <div className="bg-white border border-neutral-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                        <Loader2 className="animate-spin text-neutral-400" size={16} />
                     </div>
                  </div>
                )}
                <div ref={chatEndRef} />
             </div>

             {/* Input Area */}
             <div className="p-3 bg-white border-t border-neutral-100 flex gap-2">
                <input 
                  type="text" 
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-neutral-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isChatLoading}
                  className="bg-black text-white p-2 rounded-full hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                  <Send size={16} />
                </button>
             </div>
          </div>
        )}

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="group flex items-center justify-center w-14 h-14 bg-black text-white rounded-full shadow-lg hover:scale-105 transition-all duration-300"
        >
          {isChatOpen ? <X size={24} /> : <Sparkles className="group-hover:animate-spin-slow" size={24} />}
        </button>
      </div>

    </div>
  );
};

export default Portfolio;
