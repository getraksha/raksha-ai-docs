import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Raksha AI',
  tagline: 'Operational Safety for Agentic AI',
  favicon: 'img/favicon.ico',

  url: 'https://docs.getraksha.com',
  baseUrl: '/',
  organizationName: 'getraksha',
  projectName: 'raksha-ai-docs',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: { defaultLocale: 'en', locales: ['en'] },

  markdown: { mermaid: true },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [[
    'classic',
    {
      docs: {
        sidebarPath: './sidebars.ts',
        editUrl: 'https://github.com/getraksha/raksha-ai-docs/tree/main/',
      },
      blog: false,
      theme: { customCss: './src/css/custom.css' },
    } satisfies Preset.Options,
  ]],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    mermaid: {
      theme: { light: 'default', dark: 'dark' },
      options: { fontFamily: 'monospace' },
    },
    image: 'img/raksha-social-card.png',
    navbar: {
      title: 'Raksha AI',
      logo: { alt: 'Raksha AI', src: 'img/raksha-logo-mark-64.png' },
      items: [
        { type: 'docSidebar', sidebarId: 'mainSidebar', position: 'left', label: 'Docs' },
        { href: 'https://getraksha.com/blog', label: 'Blog', position: 'left' },
        { href: 'https://github.com/getraksha/raksha-ai-docs', position: 'right', className: 'header-github-link', 'aria-label': 'GitHub' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        { title: 'Docs', items: [
          { label: 'Manifesto', to: '/docs/manifesto/operational-safety' },
          { label: 'Architecture', to: '/docs/architecture/agp-overview' },
          { label: 'Concepts', to: '/docs/concepts/context-governance' },
        ]},
        { title: 'Research', items: [
          { label: 'Threat Models', to: '/docs/threat-models/mcp-bypass' },
          { label: 'RFCs', to: '/docs/rfc/0001-behavior-profiles' },
          { label: 'Blog', href: 'https://getraksha.com/blog' },
        ]},
        { title: 'Community', items: [
          { label: 'GitHub', href: 'https://github.com/getraksha/raksha-ai-docs' },
          { label: 'getraksha.com', href: 'https://getraksha.com' },
        ]},
      ],
      copyright: `© ${new Date().getFullYear()} Raksha AI. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'go', 'python', 'typescript', 'json', 'yaml', 'protobuf'],
    },
    tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
  } satisfies Preset.ThemeConfig,
};

export default config;
