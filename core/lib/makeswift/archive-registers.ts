/**
 * Import generic "archive" Makeswift component registers. These components
 * extract sections that are shared across multiple Shopify archive pages
 * (currently liivv-home-page.html and any sibling exports). Numbering picks
 * up where {@link ./diabetes-care-registers.ts} left off so the picker stays
 * in a single flat sequence under `Specialized page / NN / …`.
 */
import './components/archive-slideshow/register';
import './components/archive-collage-grid/register';
import './components/archive-image-comparison/register';
import './components/archive-reveal-testimonials/register';
