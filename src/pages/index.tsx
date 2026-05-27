import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

const features = [
  { icon: '🛡️', title: 'Agent Governance Plane', desc: 'Runtime enforcement between agents and every tool they can reach. Identity, behavior profiles, policy, approvals, and an immutable audit trail.', href: '/docs/architecture/agp-overview' },
  { icon: '🧠', title: 'Context Governance', desc: 'Policy-mediated control over what agents can acquire, retain, reason over, and operationalize — across shell, browser, MCP, and every capability surface.', href: '/docs/concepts/context-governance' },
  { icon: '🐚', title: 'CaSH', desc: 'Context-Aware Shell. Intercepts agent shell invocations at the execution layer — not the tool-name layer — so no bypass is possible.', href: '/docs/architecture/cash' },
  { icon: '🌐', title: 'CABR', desc: 'Context-Aware Browser Runtime. Governs what browser agents can acquire and know, defending against ambient authority and credential exposure.', href: '/docs/architecture/cabr' },
  { icon: '🪪', title: 'Behavior Profiles', desc: 'Identity-bound operating envelopes for agents. Approved tool access, data scopes, autonomy levels, and runtime context constraints — as code.', href: '/docs/concepts/behavior-profiles' },
  { icon: '🔥', title: 'Context Firewall', desc: "The last line of defense. A policy gate between acquired context and the model's reasoning — ensuring agents only acquire & know what they're allowed to.", href: '/docs/architecture/context-firewall' },
];

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main>
        {/* Hero */}
        <div className="hero">
          <div className="container">
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '1rem' }}>
              Patent Pending · Built by Raksha AI
            </p>
            <h1 className="hero__title">
              Operational Safety<br />for Agentic AI
            </h1>
            <p className="hero__subtitle">
              Govern what your agents can <strong>do</strong> and what they can <strong>acquire &amp; know</strong> —
              at runtime, at scale, with an immutable audit trail.
            </p>
            <div className="hero-buttons">
              <Link className="button button--primary button--lg" to="/docs/manifesto/operational-safety">Read the Manifesto</Link>
              <Link className="button button--secondary button--lg" to="/docs/architecture/agp-overview">Explore the Architecture</Link>
              <Link className="button button--secondary button--lg" href="https://github.com/getraksha/raksha-ai-docs">GitHub →</Link>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="container">
          <div className="features">
            {features.map((f) => (
              <Link key={f.title} to={f.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="feature-card">
                  <div className="feature-card__icon">{f.icon}</div>
                  <div className="feature-card__title">{f.title}</div>
                  <div className="feature-card__desc">{f.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Empirical banner */}
        <div style={{ background: 'linear-gradient(135deg, rgba(74,144,217,0.08) 0%, rgba(157,74,217,0.08) 100%)', borderTop: '1px solid var(--ifm-toc-border-color)', borderBottom: '1px solid var(--ifm-toc-border-color)', padding: '3rem 0', margin: '2rem 0' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: 720 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Empirical Result · May 2026</p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>One prompt. Three steps. Seven credential types exposed.</h2>
            <p style={{ opacity: 0.75, lineHeight: 1.7 }}>
              A production browser agent asked to <em>"summarize this page"</em> autonomously exposed AWS keys,
              a Stripe live key, a PostgreSQL password, three customer SSNs, a Kubernetes token, and a webhook
              secret — without prompt injection, without compromise. The browser handed the agent everything it had.
            </p>
            <Link className="button button--primary" to="/docs/threat-models/browser-context-leakage" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
              Read the Threat Model →
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
