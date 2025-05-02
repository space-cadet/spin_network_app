import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Spin Network Library',
  tagline: 'A TypeScript library for quantum spin networks',
  favicon: 'img/favicon.ico',

  // Set these to match your deployment setup
  url: 'https://your-website.com',
  baseUrl: '/',

  organizationName: 'your-github-org',
  projectName: 'spin_network_app',

  onBrokenLinks: 'warn', // Change from 'throw' to 'warn'
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: [
          '../lib/index.ts',
          '../lib/core/index.ts',
          '../lib/models/index.ts',
          '../lib/analysis/index.ts',
          '../lib/io/index.ts',
          '../lib/templates/index.ts',
          '../lib/utils/index.ts'
        ],
        tsconfig: '../tsconfig.lib.json',
        out: 'api',
        sidebar: {
          position: 2,
          fullNames: true,
          categoryLabel: 'API Documentation'
        },
        watch: process.env.TYPEDOC_WATCH,
        categorizeByGroup: true,
        cleanOutputDir: true,
        readme: 'none',
        plugin: ['typedoc-plugin-rename-defaults'],
        navigationLinks: {
          "GitHub": "https://github.com/yourusername/spin_network_app"
        }
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          remarkPlugins: [require('remark-math')],
          rehypePlugins: [require('rehype-mathjax')],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Spin Network Library',
      logo: {
        alt: 'Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/docs/api',
          label: 'API',
          position: 'left'
        },
        {
          href: 'https://github.com/yourusername/spin_network_app',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Documentation',
              to: '/docs/intro',
            },
            {
              label: 'API Reference',
              to: '/docs/api',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/yourusername/spin_network_app',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Your Name. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
