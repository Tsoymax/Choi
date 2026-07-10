# Choi

Choi is a modern local marketplace prototype built with Next.js, TypeScript, and Tailwind CSS.

The first version focuses on a polished home experience: discovery, search, categories, districts, product cards, and featured local sellers. It uses local JSON data, so it can run without a backend or database.

## Version

Current milestone: `v0.1`

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Local JSON data
- Local SVG and image assets
- GitHub Pages deployment

## What v0.1 Includes

- Responsive marketplace home page
- Choi logo and visual identity files
- Saved brand reference sheet in `public/images/brand-logo-sketches.png`
- Hero section with search
- Category filtering
- District filtering
- Product cards
- Featured seller blocks
- Footer navigation
- Test data in `data/`

## Project Structure

```text
Choi_v0.1/
|-- .github/
|   `-- workflows/
|       `-- pages.yml
|-- app/
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|   |-- CategoryGrid.tsx
|   |-- DistrictFilter.tsx
|   |-- FeaturedSellers.tsx
|   |-- Footer.tsx
|   |-- Header.tsx
|   |-- Hero.tsx
|   |-- MarketplaceExperience.tsx
|   |-- ProductCard.tsx
|   |-- ProductGrid.tsx
|   |-- SearchBar.tsx
|   `-- types.ts
|-- data/
|   |-- categories.json
|   |-- districts.json
|   `-- products.json
|-- public/
|   |-- logo.svg
|   |-- mascot.svg
|   `-- images/
|-- styles/
|   `-- globals.css
`-- package.json
```

## Run Locally

```bash
pnpm install
pnpm dev
```

Then open:

```text
http://localhost:3000
```

## Build

```bash
pnpm build
```

The static export is generated in:

```text
out/
```

## Check on GitHub Pages

1. Create a new GitHub repository.
2. Upload or push all files from `Choi_v0.1`.
3. Open the repository on GitHub.
4. Go to `Settings` -> `Pages`.
5. Under `Build and deployment`, choose `GitHub Actions`.
6. Go to the `Actions` tab and wait for `Deploy Choi to GitHub Pages` to finish.
7. Open the published Pages URL shown in the deploy summary.

The project already includes `.github/workflows/pages.yml`, so GitHub will build and publish the site automatically after a push to `main` or `master`.

## Roadmap

- `v0.1` - Home page, categories, district filter, product cards
- `v0.2` - Stronger search and sorting
- `v0.3` - Product detail page
- `v0.4` - User profile and seller page
- `v0.5` - Listing creation flow

## Product Direction

Choi should feel like a real marketplace from the first screen: calm, fast, trustworthy, and visually polished. The project should avoid rough placeholder UI and grow version by version into a complete marketplace experience.

## Brand Direction

The current logo system is based on the supplied Choi sketches: green leaf forms, a modern `C` mark, and a tea-inspired mascot that signals comfort, trust, and local closeness.
