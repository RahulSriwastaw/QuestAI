
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
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Database className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-black tracking-tight">
              Quest<span className="text-primary">AI</span>
            </span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
          </div>

          <motion.button 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 hover:bg-dark transition-all"
          >
            Get Started
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-40">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-2/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                AI-Powered Question Engine
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-6xl font-black text-dark tracking-tighter leading-[0.9] md:leading-[0.85]"
            >
              Transform Your <span className="text-primary">PDFs</span> into <span className="relative inline-block">
                Smart
                <svg className="absolute -bottom-1 left-0 w-full h-2 text-primary/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span> Questions
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-sm md:text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed"
            >
              The most advanced AI platform for educators and students to extract, generate, and manage question banks from any document in seconds.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
            >
              <button 
                onClick={onStart}
                className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-xl font-black shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Start Creating Free <ArrowRight size={18} />
              </button>
              <button className="w-full sm:w-auto px-8 py-3 bg-white text-dark border border-slate-200 rounded-xl font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Play size={14} className="fill-current" /> Watch Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 relative max-w-3xl mx-auto"
          >
            <div className="absolute -inset-4 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-xl rounded-[32px] -z-10" />
            <div className="bg-slate-900 rounded-[24px] p-2 shadow-xl border border-white/10">
              <div className="bg-white rounded-[16px] overflow-hidden aspect-[16/9] relative group">
                <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <motion.div 
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"
                    >
                      <UploadCloud className="text-primary w-6 h-6" />
                    </motion.div>
                    <div className="text-center">
                      <h3 className="text-lg font-black text-slate-900 mb-1">Interactive Dashboard</h3>
                      <p className="text-[10px] text-slate-400 font-medium">Experience the future of content management</p>
                    </div>
                  </div>
                </div>
                {/* Decorative UI elements */}
                <div className="absolute top-4 left-4 w-32 h-20 bg-white rounded-lg shadow-md border border-slate-100 p-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="w-5 h-5 bg-emerald-100 rounded mb-1.5" />
                  <div className="w-full h-1 bg-slate-100 rounded-full mb-1" />
                  <div className="w-2/3 h-1 bg-slate-100 rounded-full" />
                </div>
                <div className="absolute bottom-4 right-4 w-40 h-20 bg-white rounded-lg shadow-md border border-slate-100 p-3 -translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full" />
                    <div className="flex-1">
                      <div className="w-full h-1 bg-slate-100 rounded-full mb-1" />
                      <div className="w-1/2 h-1 bg-slate-100 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-1 bg-slate-50 rounded-full" />
                    <div className="w-full h-1 bg-slate-50 rounded-full" />
                    <div className="w-full h-1 bg-slate-50 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Questions Extracted", value: "2.5M+" },
              { label: "Active Creators", value: "15k+" },
              { label: "Accuracy Rate", value: "99.8%" },
              { label: "Time Saved", value: "85%" }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl font-black text-slate-900 mb-1 tracking-tighter">{stat.value}</div>
                <div className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-3xl font-black text-dark tracking-tight">Powerful Features</h2>
            <p className="text-slate-500 text-sm font-medium">Everything you need to build the perfect question bank.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="text-primary" />,
                title: 'Instant Extraction',
                desc: 'Upload any PDF and watch our AI extract questions, options, and answers with 99% accuracy.'
              },
              {
                icon: <Sparkles className="text-accent-2" />,
                title: 'AI Generation',
                desc: 'Generate new questions based on your content. Customize difficulty, topics, and question types.'
              },
              {
                icon: <Layers className="text-accent-3" />,
                title: 'Smart Organization',
                desc: 'Organize questions into sets, apply bulk tags, and manage your bank with powerful filters.'
              },
              {
                icon: <Download className="text-emerald-500" />,
                title: 'Multi-Format Export',
                desc: 'Export your question sets to PDF, Word, or CSV formats with professional formatting.'
              },
              {
                icon: <Shield className="text-blue-500" />,
                title: 'Secure Storage',
                desc: 'Your documents and questions are stored securely. Access them anytime, from any device.'
              },
              {
                icon: <Smartphone className="text-purple-500" />,
                title: 'Mobile Ready',
                desc: 'Access your question bank on the go. Perfectly optimized for mobile and tablet devices.'
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4 group transition-all"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-black text-dark">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto bg-primary rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-primary/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Ready to build your bank?</h2>
            <p className="text-white/80 text-sm md:text-lg max-w-xl mx-auto font-medium">Join thousands of educators who are saving hours every week with QuestAI.</p>
            <button 
              onClick={onStart}
              className="px-10 py-4 bg-white text-primary rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
                  <Database className="text-white w-2.5 h-2.5" />
                </div>
                <span className="text-base font-black tracking-tighter">QuestAI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Empowering educators with AI-driven content extraction and management tools.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-900">Product</h4>
                <ul className="space-y-1.5 text-[10px] font-bold text-slate-400">
                  <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-900">Company</h4>
                <ul className="space-y-1.5 text-[10px] font-bold text-slate-400">
                  <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-900">Legal</h4>
                <ul className="space-y-1.5 text-[10px] font-bold text-slate-400">
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-slate-50 gap-3">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">
              &copy; 2025 QuestAI Enterprise. All rights reserved.
            </p>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all cursor-pointer">
                <Star size={8} />
              </div>
              <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all cursor-pointer">
                <Star size={8} />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

