import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Send,
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { data } = usePortfolio();
  const { contact } = data;

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Inquiry form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formService, setFormService] = useState('Wedding Film Editing');
  const [formMessage, setFormMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(contact.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Project Inquiry: ${formService} — from ${formName}`);
    const body = encodeURIComponent(
      `Hello Shahid,\n\nName: ${formName}\nEmail: ${formEmail}\nService Needed: ${formService}\n\nProject Details:\n${formMessage}\n\nSent via Portfolio Website`
    );
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 4000);
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 bg-[#060608] text-white border-t border-white/[0.05]">
      {/* Background ambient lighting */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs tracking-[0.25em] font-semibold uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>START A PROJECT</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase mb-4">
            {contact.headline || "LET'S CREATE SOMETHING CINEMATIC."}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-light max-w-xl mx-auto leading-relaxed">
            {contact.subheading ||
              'Whether it’s a high-end wedding film, viral social series, podcast post-production, or a directorial project — let’s connect.'}
          </p>
        </div>

        {/* 2-Column Grid: Direct Contact Cards + Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 items-start">
          {/* Left Column: Direct Contact Info & Socials */}
          <div className="lg:col-span-5 space-y-6">
            {/* Email Card */}
            <div className="p-6 rounded-2xl bg-zinc-950/90 border border-white/[0.08] hover:border-amber-500/40 transition-all duration-300 shadow-xl group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">Direct Email</div>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm sm:text-base font-bold text-white hover:text-amber-300 transition-colors break-all"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>

                <button
                  onClick={handleCopyEmail}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy Email"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Response within 24 hours</span>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 uppercase"
                >
                  <span>Send Email</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Phone Card */}
            <div className="p-6 rounded-2xl bg-zinc-950/90 border border-white/[0.08] hover:border-amber-500/40 transition-all duration-300 shadow-xl group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">Direct Phone / WhatsApp</div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-sm sm:text-base font-bold text-white hover:text-amber-300 transition-colors font-mono"
                    >
                      {contact.phoneDisplay || `+91 ${contact.phone}`}
                    </a>
                  </div>
                </div>

                <button
                  onClick={handleCopyPhone}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy Phone"
                >
                  {copiedPhone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Available for calls &amp; WhatsApp</span>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 uppercase"
                >
                  <span>Call Now</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Location & Instagram Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location */}
              <div className="p-5 rounded-2xl bg-zinc-950/70 border border-white/[0.08] flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">Base Studio</div>
                  <div className="text-xs font-bold text-white mt-0.5">{contact.location}</div>
                </div>
              </div>

              {/* Instagram Card */}
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-gradient-to-br from-pink-950/30 to-purple-950/30 border border-pink-500/20 hover:border-pink-500/50 flex items-start gap-3 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-pink-300 uppercase">Instagram</div>
                  <div className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors mt-0.5 flex items-center gap-1">
                    <span>Stone GD</span>
                    <ExternalLink className="w-3 h-3 text-pink-400" />
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Direct Quick Inquiry Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-zinc-950/90 border border-white/[0.08] shadow-2xl relative">
            <h3 className="font-display text-xl font-bold text-white uppercase mb-1">
              Send a Direct Project Brief
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Fill in your details below and your email client will prepare the inquiry directly to Shahid.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Rahul Sharma / Studio X"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs placeholder:text-zinc-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs placeholder:text-zinc-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                  Project Type / Service Needed
                </label>
                <select
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs transition-colors"
                >
                  <option value="Wedding Film Editing">Wedding Film Editing &amp; Teaser</option>
                  <option value="Commercial Video Editing">Commercial &amp; Brand Video Editing</option>
                  <option value="Social Media Reels Batch">Social Media / Reels Content Batch</option>
                  <option value="Podcast Multi-Cam Post-Production">Podcast Multi-Cam Post-Production</option>
                  <option value="On-Location Video / Photo Shoot">On-Location Video / Photo Shoot</option>
                  <option value="Video Direction & Concept Treatment">Video Direction &amp; Concept Treatment</option>
                  <option value="Color Grading & Sound Design Only">Color Grading &amp; Sound Design Only</option>
                  <option value="Music Video Production">Music Video Production</option>
                  <option value="Other Creative Inquiry">Other Creative Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                  Project Scope, Timeline &amp; References *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Tell me about the footage volume, deadline, style references, or specific deliverables..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs placeholder:text-zinc-600 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-xl shadow-amber-500/20 hover:scale-[1.01] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>SEND PROJECT BRIEF VIA EMAIL</span>
              </button>

              {sentSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Email client opened! Feel free to send your inquiry.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
