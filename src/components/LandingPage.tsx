
import React from 'react';
import { motion } from 'framer-motion';
import { 
  UploadCloud, 
  Database, 
  Layers, 
  Globe, 
  Zap, 
  Shield, 
  Sparkles,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
  Star,
  Users,
  Cpu,
  Smartphone,
  Download
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white text-dark overflow-hidden font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 rotate-3">
              <Database className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter leading-none font-display">
                Quest<span className="text-primary">AI</span>
              </span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Intelligence</span>
            </div>
          </motion.div>
          
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <a href="#features" className="hover:text-primary transition-all relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
            <a href="#how-it-works" className="hover:text-primary transition-all relative group">
              How it Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
            <a href="#pricing" className="hover:text-primary transition-all relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
          </div>

          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="px-8 py-3 bg-dark text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-2xl shadow-2xl shadow-dark/20 hover:bg-primary transition-all duration-500"
          >
            Enter Platform
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-8 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-accent-2/5 rounded-full blur-[100px] animate-pulse delay-1000" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-10"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Trusted by <span className="text-dark">15,000+</span> Educators
                </span>
              </motion.div>

              <motion.h1 
                variants={itemVariants}
                className="text-7xl md:text-8xl lg:text-[120px] font-black text-dark tracking-tighter leading-[0.82] font-display"
              >
                SMART <br />
                <span className="text-primary">EXTRACTION</span> <br />
                FOR <span className="relative inline-block">
                  PDFS
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute -bottom-2 left-0 h-4 bg-primary/10 -z-10" 
                  />
                </span>
              </motion.h1>

              <motion.p 
                variants={itemVariants}
                className="text-lg md:text-xl text-slate-500 max-w-xl font-medium leading-relaxed tracking-tight"
              >
                The enterprise-grade AI engine that turns static documents into dynamic, structured question banks in milliseconds.
              </motion.p>

              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center gap-4 pt-6"
              >
                <button 
                  onClick={onStart}
                  className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-[0_20px_50px_rgba(235,112,11,0.3)] hover:translate-y-[-4px] active:scale-95 transition-all duration-500 flex items-center justify-center gap-3"
                >
                  Start Extraction <ArrowRight size={20} />
                </button>
                <button className="w-full sm:w-auto px-10 py-5 bg-white text-dark border border-slate-200 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all duration-500 flex items-center justify-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <Play size={12} className="fill-current" />
                  </div>
                  Watch Demo
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 via-transparent to-accent-2/20 blur-[100px] rounded-full -z-10" />
              
              {/* Floating UI Elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 w-48 h-48 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 z-20"
              >
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-emerald-500 w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-2 bg-slate-100 rounded-full" />
                  <div className="w-2/3 h-2 bg-slate-100 rounded-full" />
                  <div className="w-full h-2 bg-slate-100 rounded-full" />
                </div>
                <div className="mt-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest">99.8% Accuracy</div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-10 w-56 h-40 bg-dark/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6 z-20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Zap className="text-white w-4 h-4" />
                  </div>
                  <div className="text-[10px] font-black text-white uppercase tracking-widest">Real-time Processing</div>
                </div>
                <div className="space-y-3">
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: ['0%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-full bg-primary" 
                    />
                  </div>
                  <div className="w-3/4 h-1.5 bg-slate-700 rounded-full" />
                </div>
              </motion.div>

              {/* Main Dashboard Preview */}
              <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden group">
                <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[4/5] relative">
                  <img 
                    src="https://picsum.photos/seed/dashboard/800/1000" 
                    alt="Dashboard Preview" 
                    className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
                  <div className="absolute bottom-10 left-10 right-10">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                      <Sparkles className="text-primary w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">AI-Generated Insights</h3>
                    <p className="text-white/60 text-xs font-medium leading-relaxed">Automatically categorize and tag your entire question bank with advanced machine learning.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Questions Extracted", value: "2.5M+", icon: <Database size={20} /> },
              { label: "Active Creators", value: "15k+", icon: <Users size={20} /> },
              { label: "Accuracy Rate", value: "99.8%", icon: <Shield size={20} /> },
              { label: "Time Saved", value: "85%", icon: <Clock size={20} /> }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-5xl font-black text-white tracking-tighter font-display">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mt-2">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Bento Grid Style */}
      <section id="features" className="py-32 px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div className="max-w-2xl space-y-4">
              <div className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Core Capabilities</div>
              <h2 className="text-5xl md:text-7xl font-black text-dark tracking-tighter leading-none font-display">
                ENGINEERED FOR <br />
                <span className="text-primary">PRECISION.</span>
              </h2>
            </div>
            <p className="text-slate-500 max-w-xs font-medium leading-relaxed pb-2">
              We've rebuilt the question management workflow from the ground up using state-of-the-art AI.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Large Feature Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-8 bg-white rounded-[3rem] border border-slate-200/60 p-10 md:p-16 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
              <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                  <Zap size={32} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-dark tracking-tight">Instant PDF Extraction</h3>
                  <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                    Our proprietary OCR engine doesn't just read text—it understands structure. Extract complex mathematical equations, diagrams, and multi-column layouts with perfect fidelity.
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">Math Support</div>
                  <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">Diagram OCR</div>
                  <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">Table Detection</div>
                </div>
              </div>
            </motion.div>

            {/* Side Feature Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-4 bg-dark rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl hover:shadow-primary/20 transition-all duration-500 group"
            >
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-accent-2 group-hover:rotate-12 transition-transform duration-500">
                <Sparkles size={32} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-white tracking-tight">AI Generation</h3>
                <p className="text-white/50 font-medium leading-relaxed">
                  Never run out of content. Generate infinite variations of your questions based on specific topics or difficulty levels.
                </p>
              </div>
            </motion.div>

            {/* Bottom Row */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-4 bg-white rounded-[3rem] border border-slate-200/60 p-10 shadow-sm hover:shadow-2xl transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 transition-transform">
                <Download size={28} />
              </div>
              <h3 className="text-2xl font-black text-dark mb-4">Smart Export</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Professional formatting for PDF, Word, and CSV. Custom templates for exams and worksheets.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-4 bg-white rounded-[3rem] border border-slate-200/60 p-10 shadow-sm hover:shadow-2xl transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-8 group-hover:scale-110 transition-transform">
                <Layers size={28} />
              </div>
              <h3 className="text-2xl font-black text-dark mb-4">Organization</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Bulk tagging, folder management, and advanced search filters to keep your bank organized.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-4 bg-primary rounded-[3rem] p-10 shadow-2xl shadow-primary/20 transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
                <Smartphone size={28} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Mobile First</h3>
              <p className="text-white/80 font-medium leading-relaxed">
                Access your entire question bank from any device. Perfectly optimized for mobile workflows.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Split Layout */}
      <section className="relative min-h-[600px] flex items-center">
        <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-white" />
          <div className="bg-dark" />
        </div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10 w-full">
          <div className="bg-white rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden grid lg:grid-cols-2">
            <div className="p-12 md:p-20 space-y-8">
              <div className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Get Started</div>
              <h2 className="text-5xl md:text-6xl font-black text-dark tracking-tighter leading-[0.9] font-display">
                READY TO <br />
                <span className="text-primary">EVOLVE?</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                Join thousands of educators and institutions transforming their content management with QuestAI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onStart}
                  className="px-10 py-5 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:translate-y-[-4px] transition-all duration-500"
                >
                  Start Now
                </button>
                <button className="px-10 py-5 bg-slate-50 text-dark rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all duration-500">
                  Contact Sales
                </button>
              </div>
            </div>
            <div className="bg-slate-50 relative hidden lg:block overflow-hidden">
              <img 
                src="https://picsum.photos/seed/cta/800/800" 
                alt="CTA Background" 
                className="w-full h-full object-cover opacity-20 grayscale"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center p-20">
                <div className="w-full aspect-square bg-white rounded-[3rem] shadow-2xl p-10 flex flex-col justify-between border border-slate-100">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Star size={24} fill="currentColor" />
                    </div>
                    <div className="text-2xl font-black text-dark tracking-tight">"The most powerful tool in my teaching arsenal."</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200" />
                    <div>
                      <div className="font-black text-dark text-sm">Dr. Sarah Chen</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">University of Oxford</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
                  <Database className="text-white w-5 h-5" />
                </div>
                <span className="text-2xl font-black tracking-tighter font-display">QuestAI</span>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed max-w-xs mb-8">
                The next generation of educational content management, powered by advanced artificial intelligence.
              </p>
              <div className="flex gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all cursor-pointer">
                    <Star size={16} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-dark">Platform</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><a href="#" className="hover:text-primary transition-all">Extraction</a></li>
                <li><a href="#" className="hover:text-primary transition-all">AI Generator</a></li>
                <li><a href="#" className="hover:text-primary transition-all">Question Bank</a></li>
                <li><a href="#" className="hover:text-primary transition-all">Export Engine</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-dark">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><a href="#" className="hover:text-primary transition-all">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-all">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-all">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-all">Contact</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-dark">Legal</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><a href="#" className="hover:text-primary transition-all">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-all">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-all">Cookie Policy</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-dark">Support</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><a href="#" className="hover:text-primary transition-all">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-all">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-all">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-slate-100 gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              &copy; 2025 QuestAI Intelligence Systems. Built for the future of education.
            </p>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">All Systems Operational</span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">v2.5.0-PRO</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

