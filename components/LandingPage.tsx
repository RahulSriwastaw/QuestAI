
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
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Database className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tighter">
              Quest<span className="text-primary">AI</span>
            </span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Success Stories</a>
          </div>

          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="px-7 py-3 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary transition-all shadow-xl shadow-slate-900/10"
          >
            Launch App
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-44 pb-32 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full mb-8">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                v2.0 Now Live with Gemini 2.0
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-7xl md:text-[120px] font-black text-slate-900 leading-[0.85] tracking-tighter mb-10"
            >
              Extract <span className="text-primary">Questions</span> <br />
              With <span className="italic font-serif font-light text-slate-400">Precision</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              The enterprise-grade solution for educational content creators. 
              Convert complex PDFs into structured question banks in seconds.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-5"
            >
              <button 
                onClick={onStart}
                className="group px-12 py-6 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-slate-900 transition-all shadow-2xl shadow-primary/30 flex items-center gap-4"
              >
                Start Extracting <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 bg-white border-2 border-slate-100 text-slate-900 font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:border-primary hover:text-primary transition-all flex items-center gap-3">
                <Play size={18} className="fill-current" /> Watch Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-24 relative max-w-5xl mx-auto"
          >
            <div className="absolute -inset-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl rounded-[60px] -z-10" />
            <div className="bg-slate-900 rounded-[40px] p-4 shadow-2xl border border-white/10">
              <div className="bg-white rounded-[28px] overflow-hidden aspect-[16/10] relative group">
                <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center animate-bounce">
                      <UploadCloud className="text-primary w-10 h-10" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-slate-900 mb-2">Interactive Dashboard</h3>
                      <p className="text-slate-400 font-medium">Experience the future of content management</p>
                    </div>
                  </div>
                </div>
                {/* Decorative UI elements */}
                <div className="absolute top-8 left-8 w-48 h-32 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg mb-3" />
                  <div className="w-full h-2 bg-slate-100 rounded-full mb-2" />
                  <div className="w-2/3 h-2 bg-slate-100 rounded-full" />
                </div>
                <div className="absolute bottom-8 right-8 w-64 h-40 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full" />
                    <div className="flex-1">
                      <div className="w-full h-2 bg-slate-100 rounded-full mb-2" />
                      <div className="w-1/2 h-2 bg-slate-100 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-2 bg-slate-50 rounded-full" />
                    <div className="w-full h-2 bg-slate-50 rounded-full" />
                    <div className="w-full h-2 bg-slate-50 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Questions Extracted", value: "2.5M+" },
              { label: "Active Creators", value: "15k+" },
              { label: "Accuracy Rate", value: "99.8%" },
              { label: "Time Saved", value: "85%" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-8">
                Engineered for <br />
                <span className="text-primary">Excellence.</span>
              </h2>
              <p className="text-xl text-slate-500 font-medium">
                Our platform combines cutting-edge AI with intuitive design to give you 
                the most powerful question management tool ever built.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
                <Star size={20} />
              </div>
              <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
                <Star size={20} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Cpu className="text-primary" />,
                title: "Gemini Vision Core",
                desc: "Powered by Google's latest multimodal models for unparalleled extraction accuracy."
              },
              {
                icon: <Layers className="text-indigo-500" />,
                title: "Smart Categorization",
                desc: "Automatically tags and organizes questions by subject, difficulty, and topic."
              },
              {
                icon: <Shield className="text-emerald-500" size={28} />,
                title: "Enterprise Security",
                desc: "Your data is encrypted and protected with industry-leading security protocols."
              },
              {
                icon: <Globe className="text-amber-500" size={28} />,
                title: "Multilingual Support",
                desc: "Extract questions in over 50 languages with perfect character recognition."
              },
              {
                icon: <Zap className="text-orange-500" size={28} />,
                title: "Instant Processing",
                desc: "Process hundreds of pages in minutes, not hours. Scale your content effortlessly."
              },
              {
                icon: <Users className="text-rose-500" size={28} />,
                title: "Team Collaboration",
                desc: "Share question banks and collaborate with your team in real-time."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -12 }}
                className="group p-10 rounded-[40px] bg-white border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-[60px] p-12 md:p-24 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-10">
                The Future of <br />
                <span className="text-primary italic">Education</span> is Here.
              </h2>
              <p className="text-xl text-white/50 font-medium max-w-2xl mx-auto mb-14">
                Join 50,000+ educators who are already using QuestAI to build the next generation of learning tools.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button 
                  onClick={onStart}
                  className="px-12 py-6 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-white hover:text-slate-900 transition-all shadow-2xl shadow-primary/20"
                >
                  Get Started Now
                </button>
                <button className="px-12 py-6 bg-transparent border-2 border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-white/5 transition-all">
                  Contact Sales
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-20">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Database className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-black tracking-tighter">QuestAI</span>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed">
                Empowering educators with AI-driven content extraction and management tools.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Product</h4>
                <ul className="space-y-4 text-sm font-bold text-slate-400">
                  <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Company</h4>
                <ul className="space-y-4 text-sm font-bold text-slate-400">
                  <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Legal</h4>
                <ul className="space-y-4 text-sm font-bold text-slate-400">
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-slate-50 gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
              &copy; 2025 QuestAI Enterprise. All rights reserved.
            </p>
            <div className="flex gap-6">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all cursor-pointer">
                <Star size={14} />
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all cursor-pointer">
                <Star size={14} />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

