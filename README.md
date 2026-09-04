# Heron Assets Trustees — Design 2 V1

A from-scratch alternative art direction for Heron Assets Trustees.

## Direction
Editorial institutional finance: asymmetric compositions, large serif display typography, monochrome photography, restrained gold, data-oriented market UI, and cinematic graphics. It intentionally avoids the common AI-generated crypto landing-page pattern of repeated rounded cards and oversized gradients.

## Runtime
No npm / Node / build step required. React 18 and Three.js load via CDN. Upload the folder to normal shared hosting.

## Pages
- index.html — Home
- strategies.html — Investment strategies
- company.html — Company / leadership
- contact.html — Contact
- admin.html — Inactive future operations workspace

## Market data
The homepage requests public 24h ticker data from Binance's public REST endpoint. Network failure is handled without breaking the page.

## Production notes
Replace role-based portrait placeholders, company contact details, legal pages, and any copy that requires verified corporate facts before using the site as a live representation of the business. The contact form is frontend-only and does not transmit information.
