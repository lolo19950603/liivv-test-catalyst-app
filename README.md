<a href="https://catalyst.dev" target="_blank" rel="noopener norerrer">
  <img src="https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_banner.png" alt="Catalyst for Composable Commerce Image Banner" title="Catalyst">
</a>

<br />
<br />

<div align="center">

[![MIT License](https://img.shields.io/github/license/bigcommerce/catalyst)](LICENSE.md)
[![Lighthouse Report](https://github.com/bigcommerce/catalyst/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/bigcommerce/catalyst/actions/workflows/lighthouse.yml) [![Lint, Typecheck, gql.tada](https://github.com/bigcommerce/catalyst/actions/workflows/basic.yml/badge.svg)](https://github.com/bigcommerce/catalyst/actions/workflows/basic.yml)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/bigcommerce/catalyst)

</div>

> **Note:** This is the `integrations/makeswift` branch of Catalyst, which includes an integration with Makeswift for visual editing. This is the version of Catalyst deployed by default by the One-Click Catalyst functionality in the BigCommerce control panel. If you wish to use a version of Catalyst without a pre-integrated visual editor, consider the code on the `canary` branch or refer to the [tags](https://github.com/bigcommerce/catalyst/tags) for the version that's best for you.

**Catalyst** is the composable, fully customizable headless commerce framework for
[BigCommerce](https://www.bigcommerce.com/). Catalyst is built with [Next.js](https://nextjs.org/), uses
our [React](https://react.dev/) storefront components, and is backed by the
[GraphQL Storefront API](https://developer.bigcommerce.com/docs/storefront/graphql).

By choosing Catalyst, you'll have a fully-functional storefront within a few seconds, and spend zero time on wiring
up APIs or building SEO, Accessibility, and Performance-optimized ecommerce components you've probably written many
times before. You can instead go straight to work building your brand and making this your own.

## Demo

- [Catalyst Demo](https://catalyst-demo.site)

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

<p align="center">
 <a href="https://www.catalyst.dev">🚀 catalyst.dev</a> •
 <a href="https://developer.bigcommerce.com/community">🤗 BigCommerce Developer Community</a> •
 <a href="https://github.com/bigcommerce/catalyst/discussions">💬 GitHub Discussions</a> •
 <a href="/docs">💡 Docs in this repo</a>
</p>

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

## Deploy via One-Click Catalyst App

The easiest way to deploy your Catalyst Storefront is to use the [One-Click Catalyst App](https://login.bigcommerce.com/deep-links/app/53284) available in the BigCommerce App Marketplace.

Check out the [Catalyst.dev One-Click Catalyst Documentation](https://www.catalyst.dev/docs/getting-started) for more details.

## Local setup (this repo)

This is the **Liivv** storefront, forked from BigCommerce Catalyst + Makeswift. Application code lives in `core/`. Docs, brand, and architecture notes live in `docs/`.

**Requirements:** Node.js 24 and Corepack-enabled `pnpm`.

```bash
corepack enable pnpm
pnpm install
cp .env.example .env.local   # repo root only — not core/
pnpm dev
```

Environment variables have a single home:

| File | Purpose |
| --- | --- |
| `.env.example` | Template (committed) |
| `.env.local` | Your secrets (gitignored). Put this at the **repo root**. |
| `core/.env.test.example` | Playwright overrides → copy to `core/.env.test` |

Do not add a second `core/.env.local`. `pnpm dev` / `pnpm build` load the root file.

Architecture:

- [Overview](docs/Liivv-Architecture.md) — how the shop and health data split ([PDF](docs/Liivv-Architecture.pdf))
- [Deep dive](docs/Liivv-Architecture-Deep-Dive.md) — data flows, auth, secrets, security checklist S1–S8 ([PDF](docs/Liivv-Architecture-Deep-Dive.pdf))

## Resources

- [Catalyst Documentation](https://catalyst.dev/docs/)
- [GraphQL Storefront API Playground](https://developer.bigcommerce.com/graphql-storefront/playground)
- [GraphQL Storefront API Explorer](https://developer.bigcommerce.com/graphql-storefront/explorer)
- [BigCommerce DevDocs](https://developer.bigcommerce.com/docs/build)
