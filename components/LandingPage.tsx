
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
  Cpu
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-1.5"
          >
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Database className="text-white w-3.5 h-3.5" />
            </div>
            <span className="text-lg font-black tracking-tighter">
              Quest<span className="text-primary">AI</span>
            </span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Success Stories</a>
          </div>

          <motion.button 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="px-4 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.15em] rounded-lg hover:bg-primary transition-all shadow-lg shadow-slate-900/10"
          >
            Launch App
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-8 px-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[80px] animate-pulse delay-1000" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-500">
                v2.0 Now Live with Gemini 2.0
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-[56px] font-black text-slate-900 leading-[0.95] tracking-tighter mb-3"
            >
              Extract <span className="text-primary">Questions</span> <br />
              With <span className="italic font-serif font-light text-slate-400">Precision</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-sm text-slate-500 font-medium max-w-lg mx-auto mb-6 leading-relaxed"
            >
              The enterprise-grade solution for educational content creators. 
              Convert complex PDFs into structured question banks in seconds.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button 
                onClick={onStart}
                className="group px-6 py-3 bg-primary text-white font-black uppercase tracking-[0.15em] text-[9px] rounded-lg hover:bg-slate-900 transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
              >
                Start Extracting <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-6 py-3 bg-white border-2 border-slate-100 text-slate-900 font-black uppercase tracking-[0.15em] text-[9px] rounded-lg hover:border-primary hover:text-primary transition-all flex items-center gap-2">
                <Play size={12} className="fill-current" /> Watch Demo
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

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
            <div className="max-w-lg">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">
                Engineered for <br />
                <span className="text-primary">Excellence.</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Our platform combines cutting-edge AI with intuitive design to give you 
                the most powerful question management tool ever built.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
                <Star size={14} />
              </div>
              <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
                <Star size={14} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <Cpu className="text-primary" size={16} />,
                title: "Gemini Vision Core",
                desc: "Powered by Google's latest multimodal models for unparalleled extraction accuracy."
              },
              {
                icon: <Layers className="text-indigo-500" size={16} />,
                title: "Smart Categorization",
                desc: "Automatically tags and organizes questions by subject, difficulty, and topic."
              },
              {
                icon: <Shield className="text-emerald-500" size={16} />,
                title: "Enterprise Security",
                desc: "Your data is encrypted and protected with industry-leading security protocols."
              },
              {
                icon: <Globe className="text-amber-500" size={16} />,
                title: "Multilingual Support",
                desc: "Extract questions in over 50 languages with perfect character recognition."
              },
              {
                icon: <Zap className="text-orange-500" size={16} />,
                title: "Instant Processing",
                desc: "Process hundreds of pages in minutes, not hours. Scale your content effortlessly."
              },
              {
                icon: <Users className="text-rose-500" size={16} />,
                title: "Team Collaboration",
                desc: "Share question banks and collaborate with your team in real-time."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group p-5 rounded-[20px] bg-white border border-slate-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1.5 tracking-tight">{feature.title}</h3>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900 rounded-[32px] p-8 md:p-12 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative z-10"
            >
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[0.9] mb-4">
                The Future of <br />
                <span className="text-primary italic">Education</span> is Here.
              </h2>
              <p className="text-xs text-white/50 font-medium max-w-lg mx-auto mb-8">
                Join 50,000+ educators who are already using QuestAI to build the next generation of learning tools.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button 
                  onClick={onStart}
                  className="px-6 py-3 bg-primary text-white font-black uppercase tracking-[0.15em] text-[9px] rounded-lg hover:bg-white hover:text-slate-900 transition-all shadow-lg shadow-primary/20"
                >
                  Get Started Now
                </button>
                <button className="px-6 py-3 bg-transparent border-2 border-white/10 text-white font-black uppercase tracking-[0.15em] text-[9px] rounded-lg hover:bg-white/5 transition-all">
                  Contact Sales
                </button>
              </div>
            </motion.div>
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

