import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'category',
      label: '🚀 Get Started',
      collapsed: false,
      items: [
        'get-started/overview',
        'get-started/install',
        'get-started/console',
        'get-started/first-agent',
      ],
    },
    {
      type: 'category',
      label: '🎬 Walkthrough',
      collapsed: false,
      items: [
        'walkthrough/example',
      ],
    },
    {
      type: 'category',
      label: '🛠️ Core Workflows',
      collapsed: false,
      items: [
        'core-workflows/govern-mcp-server',
        'core-workflows/behavior-profiles',
        'core-workflows/tool-visibility',
        'core-workflows/approval-workflow',
        'core-workflows/connecting-clients',
      ],
    },
    {
      type: 'category',
      label: '🔧 Operate & Troubleshoot',
      collapsed: false,
      items: [
        'operate/debugging',
        'operate/service-commands',
        'operate/config-and-ports',
        'operate/upgrading',
      ],
    },
    {
      type: 'category',
      label: '📖 Reference',
      collapsed: false,
      items: [
        'reference/cli',
        'reference/glossary',
      ],
    },
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
        'architecture/cafs',
        'architecture/cabr',
        'architecture/context-firewall',
      ],
    },
    {
      type: 'category',
      label: '💡 Concepts',
      collapsed: false,
      items: [
        'concepts/operational-safety',
        'concepts/context-governance',
        'concepts/behavior-profiles',
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
