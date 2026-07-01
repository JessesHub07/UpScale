import ScrollReveal from '@/components/ScrollReveal'

export const dynamic = 'force-static'

const CALENDLY = 'https://calendly.com/YOUR_LINK_HERE'

export default function HomePage() {
  return (
    <div style={{ background: '#0a0a0f', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 40px', borderBottom: '0.5px solid #1e1e2e',
        position: 'sticky', top: 0, background: '#0a0a0fee', backdropFilter: 'blur(8px)', zIndex: 10
      }}>
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>
          Axl<span style={{ color: '#22c55e' }}>IQ</span>
        </span>
        <div style={{ display: 'flex', gap: 28, fontSize: 14, color: '#6b7280' }}>
          <a href="#services" style={{ color: '#6b7280', textDecoration: 'none' }}>Services</a>
          <a href="#products" style={{ color: '#6b7280', textDecoration: 'none' }}>Our products</a>
          <a href="#work" style={{ color: '#6b7280', textDecoration: 'none' }}>Work</a>
          <a href="#process" style={{ color: '#6b7280', textDecoration: 'none' }}>How it works</a>
        </div>
        <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{
          background: '#22c55e', color: '#0a0a0f', border: 'none', padding: '9px 20px',
          borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none'
        }}>Book a call</a>
      </nav>

      {/* Hero */}
      <section style={{ padding: '100px 40px 80px', textAlign: 'center', borderBottom: '0.5px solid #1e1e2e' }}>
        <ScrollReveal>
          <h1 style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.5, margin: '0 0 20px' }}>
            Automation that<br /><span style={{ color: '#22c55e' }}>pays for itself.</span>
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <p style={{ fontSize: 17, color: '#6b7280', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Axliq builds AI systems that handle the work costing you customers. We scope it, build it, and run it for you.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={160}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{
              background: '#22c55e', color: '#0a0a0f', padding: '12px 24px',
              borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none'
            }}>Book a discovery call</a>
            <a href="#work" style={{
              background: 'transparent', color: '#f8fafc', border: '0.5px solid #1e1e2e',
              padding: '12px 24px', borderRadius: 8, fontSize: 15, textDecoration: 'none'
            }}>See our work</a>
          </div>
        </ScrollReveal>
      </section>

      {/* Services */}
      <section id="services" style={{ padding: '72px 40px', borderBottom: '0.5px solid #1e1e2e' }}>
        <ScrollReveal>
          <p style={{ fontSize: 11, letterSpacing: 2, color: '#22c55e', textTransform: 'uppercase', margin: '0 0 12px' }}>What we build</p>
          <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.8, margin: '0 0 10px' }}>End-to-end AI automation</h2>
          <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 44px', lineHeight: 1.7, maxWidth: 520 }}>
            Every system is configured, deployed, and managed by Axliq. You use it. We run it.
          </p>
        </ScrollReveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 16 }}>
          {[
            { icon: '⚡', title: 'Lead conversion', desc: 'Respond instantly, qualify through conversation, score and route leads to your sales team automatically.' },
            { icon: '⇄', title: 'Workflow automation', desc: 'Eliminate repetitive internal tasks across your existing tools, data entry, reporting, approvals.' },
            { icon: '◈', title: 'Custom AI agents', desc: 'Agents built on your business logic, products, and processes, scoped entirely to your use case.' },
          ].map((c, i) => (
            <ScrollReveal key={c.title} delay={i * 80}>
              <div style={{ background: '#111118', border: '0.5px solid #1e1e2e', borderRadius: 12, padding: 24, height: '100%' }}>
                <div style={{ width: 36, height: 36, background: '#22c55e18', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 18 }}>{c.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px' }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="products" style={{ padding: '72px 40px', borderBottom: '0.5px solid #1e1e2e' }}>
        <ScrollReveal>
          <p style={{ fontSize: 11, letterSpacing: 2, color: '#22c55e', textTransform: 'uppercase', margin: '0 0 12px' }}>Our products</p>
          <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.8, margin: '0 0 10px' }}>Built in-house. Available to clients.</h2>
          <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 36px', lineHeight: 1.7, maxWidth: 520 }}>
            We build our own AI products to solve real problems. Clients get the system, we handle the rest.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <div style={{ background: '#111118', border: '0.5px solid #22c55e33', borderRadius: 12, padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <span style={{ display: 'inline-block', background: '#22c55e18', color: '#22c55e', fontSize: 11, padding: '3px 10px', borderRadius: 4, marginBottom: 14 }}>Flagship product</span>
              <h3 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 10px' }}>UPSCALE</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, margin: '0 0 20px' }}>
                An AI-powered lead conversion engine that sits between your marketing and your sales team.
                It responds the moment a lead reaches out, qualifies them through natural conversation,
                scores their intent, and routes the warm ones to a human.
              </p>
              <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{
                background: '#22c55e', color: '#0a0a0f', padding: '8px 16px',
                borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none'
              }}>Get UPSCALE for your business</a>
            </div>
            <div style={{ background: '#0a0a0f', border: '0.5px solid #1e1e2e', borderRadius: 8, overflow: 'hidden' }}>
              {[
                { n: '01', title: 'Lead reaches out', sub: 'Any channel, any time' },
                { n: '02', title: 'AI qualifies', sub: 'Natural conversation, scored in real time' },
                { n: '03', title: 'Lead scored', sub: 'Budget, timeline, intent captured' },
                { n: '04', title: 'Rep notified', sub: 'Hot leads get immediate alerts' },
              ].map((s, i) => (
                <div key={s.n} style={{ padding: '18px 20px', borderBottom: i < 3 ? '0.5px solid #1e1e2e' : 'none' }}>
                  <p style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, letterSpacing: 1, margin: '0 0 4px' }}>{s.n}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{s.title}</p>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Work / Scenario */}
      <section id="work" style={{ padding: '72px 40px', borderBottom: '0.5px solid #1e1e2e' }}>
        <ScrollReveal>
          <p style={{ fontSize: 11, letterSpacing: 2, color: '#22c55e', textTransform: 'uppercase', margin: '0 0 12px' }}>In practice</p>
          <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.8, margin: '0 0 10px' }}>A scenario</h2>
          <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 28px', lineHeight: 1.7 }}>A business runs ads. Leads come in. Most go cold before anyone follows up.</p>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <div style={{ background: '#111118', border: '0.5px solid #1e1e2e', borderRadius: 12, padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 14px' }}>Solar energy company, West Africa</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, margin: 0 }}>
                Leads come in via WhatsApp after seeing an ad. Before UPSCALE, follow-up happened hours later, if at all.
                With UPSCALE, the AI responds within seconds, asks the right questions, scores the lead, and alerts the
                sales rep with a full summary. The rep shows up to a warm conversation, not a cold one.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { val: '<3s', lab: 'First response time' },
                { val: '24/7', lab: 'Coverage, no extra headcount' },
                { val: '100%', lab: 'Leads captured and scored' },
                { val: '0', lab: 'Leads lost to slow follow-up' },
              ].map(m => (
                <div key={m.lab} style={{ background: '#0a0a0f', border: '0.5px solid #1e1e2e', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{m.val}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{m.lab}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Process */}
      <section id="process" style={{ padding: '72px 40px', borderBottom: '0.5px solid #1e1e2e' }}>
        <ScrollReveal>
          <p style={{ fontSize: 11, letterSpacing: 2, color: '#22c55e', textTransform: 'uppercase', margin: '0 0 12px' }}>How it works</p>
          <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.8, margin: '0 0 10px' }}>From first call to live system</h2>
          <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 40px', lineHeight: 1.7, maxWidth: 520 }}>
            Every engagement follows the same process. No surprises, no scope creep.
          </p>
        </ScrollReveal>
        <div style={{ background: '#111118', border: '0.5px solid #1e1e2e', borderRadius: 12, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          {[
            { n: '1', title: 'Discovery call', desc: 'We learn your business, your channels, and what the system needs to do. 30 minutes.' },
            { n: '2', title: 'Scoping and proposal', desc: 'We send a clear breakdown of what we\'re building, the timeline, and what\'s involved.' },
            { n: '3', title: 'Build', desc: 'We configure and deploy the system. Most standard builds go live in one to two weeks.' },
            { n: '4', title: 'Ongoing management', desc: 'We monitor, tune, and improve the system on retainer. You stay focused on the business.' },
          ].map((s, i) => (
            <ScrollReveal key={s.n} delay={i * 80}>
              <div style={{ padding: '28px 24px', borderRight: i < 3 ? '0.5px solid #1e1e2e' : 'none', height: '100%' }}>
                <div style={{ width: 28, height: 28, background: '#22c55e18', border: '0.5px solid #22c55e44', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#22c55e', marginBottom: 14 }}>{s.n}</div>
                <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>{s.title}</h4>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '72px 40px', borderBottom: '0.5px solid #1e1e2e' }}>
        <ScrollReveal>
          <p style={{ fontSize: 11, letterSpacing: 2, color: '#22c55e', textTransform: 'uppercase', margin: '0 0 12px' }}>FAQ</p>
          <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.8, margin: '0 0 40px' }}>Common questions</h2>
        </ScrollReveal>
        <div style={{ maxWidth: 640 }}>
          {[
            { q: 'Is UPSCALE just a chatbot?', a: 'No. A chatbot answers questions. UPSCALE has a goal: qualify the lead, collect the right signals, score their intent, and hand them off to a human at the right moment. It knows when to step back.' },
            { q: 'Do you only build lead conversion systems?', a: 'UPSCALE is our flagship product, but Axliq builds any kind of automation. Internal workflow tools, document processing, reporting pipelines, customer support agents. Book a call and describe the problem.' },
            { q: 'How long does it take to go live?', a: 'A standard UPSCALE deployment takes one to two weeks from scoping call to live system. More complex custom builds are scoped individually.' },
            { q: 'What channels does UPSCALE work on?', a: 'WhatsApp Business, web forms, and other messaging channels. We confirm channel availability during your scoping call based on your market and setup.' },
          ].map((item, i) => (
            <ScrollReveal key={item.q} delay={i * 60}>
              <div style={{ borderTop: '0.5px solid #1e1e2e', padding: '20px 0' }}>
                <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px' }}>{item.q}</p>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.7 }}>{item.a}</p>
              </div>
            </ScrollReveal>
          ))}
          <div style={{ borderTop: '0.5px solid #1e1e2e' }} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 40px', textAlign: 'center' }}>
        <ScrollReveal>
          <h2 style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1, margin: '0 0 14px' }}>Let's scope your build.</h2>
          <p style={{ color: '#6b7280', fontSize: 15, margin: '0 auto 32px', maxWidth: 420, lineHeight: 1.7 }}>
            Book a 30-minute discovery call. We'll figure out the right system for your business and give you a clear picture of what's involved.
          </p>
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{
            background: '#22c55e', color: '#0a0a0f', padding: '13px 28px',
            borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none'
          }}>Book a discovery call</a>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer style={{ padding: '28px 40px', borderTop: '0.5px solid #1e1e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.5 }}>Axl<span style={{ color: '#22c55e' }}>IQ</span></span>
        <p style={{ fontSize: 12, color: '#4b5563', margin: 0 }}>© 2026 Axliq. All rights reserved.</p>
      </footer>

    </div>
  )
}
