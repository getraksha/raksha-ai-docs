import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'category',
      label: '📜 Manifesto',
      collapsed: false,
      items: ['manifesto/operational-safety'],
    },
    {
      type: 'category',
      label: '🏗️ Architecture',
      collapsed: false,
      items: [
        'architecture/agp-overview',
        'architecture/agp-services',
        'architecture/cash',
        'architecture/cabr',
        'architecture/context-firewall',
      ],
    },
    {
      type: 'category',
      label: '💡 Concepts',
      collapsed: false,
      items: [
        'concepts/context-governance',
        'concepts/behavior-profiles',
        'concepts/cognitive-visibility',
        'concepts/glossary',
      ],
    },
    {
      type: 'category',
      label: '⚠️ Threat Models',
      collapsed: false,
      items: [
        'threat-models/mcp-bypass',
        'threat-models/browser-context-leakage',
        'threat-models/repo-secret-ingestion',
      ],
    },
    {
      type: 'category',
      label: '🔒 Research & Patents',
      collapsed: false,
      items: [
        'patents/patent-behavior-profiles',
        'patents/patent-context-governance',
      ],
    },
    {
      type: 'category',
      label: '📋 RFCs',
      collapsed: false,
      items: [
        'rfc/0001-behavior-profiles',
        'rfc/0002-context-governance',
        'rfc/0003-cash-runtime',
      ],
    },
  ],
};

export default sidebars;
