#!/usr/bin/env python3
"""
Generate high-fidelity New Zealand Certificate of Incorporation
for Heron Assets Trustee Limited.
Produces:
- web/public/certificate.html (standalone printable webpage with action buttons)
- web/public/heron_certificate_of_incorporation.png (high-res 2000x2828 image)
- web/public/heron_certificate_of_incorporation.pdf (printable vector PDF)
- Copies to dashboard/public/
"""

import os
import sys
import base64
import subprocess
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB_PUBLIC = os.path.join(BASE_DIR, "web", "public")
DASH_PUBLIC = os.path.join(BASE_DIR, "dashboard", "public")

# Read NZ Coat of Arms SVG
nz_svg_path = os.path.join(WEB_PUBLIC, "nz_coat_of_arms.svg")
if os.path.exists(nz_svg_path):
    with open(nz_svg_path, "rb") as f:
        nz_svg_b64 = base64.b64encode(f.read()).decode("utf-8")
        nz_crest_uri = f"data:image/svg+xml;base64,{nz_svg_b64}"
else:
    nz_crest_uri = ""

# Generate QR code SVG (pointing to verification portal)
qr_svg = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="84" height="84" shape-rendering="crispEdges">
  <rect width="100" height="100" fill="#ffffff" rx="4" />
  <!-- Corner Squares -->
  <rect x="8" y="8" width="24" height="24" fill="#0a192f"/>
  <rect x="12" y="12" width="16" height="16" fill="#ffffff"/>
  <rect x="16" y="16" width="8" height="8" fill="#0a192f"/>

  <rect x="68" y="8" width="24" height="24" fill="#0a192f"/>
  <rect x="72" y="12" width="16" height="16" fill="#ffffff"/>
  <rect x="76" y="16" width="8" height="8" fill="#0a192f"/>

  <rect x="8" y="68" width="24" height="24" fill="#0a192f"/>
  <rect x="12" y="72" width="16" height="16" fill="#ffffff"/>
  <rect x="16" y="76" width="8" height="8" fill="#0a192f"/>

  <!-- Timing and Data modules -->
  <rect x="36" y="10" width="4" height="4" fill="#0a192f"/>
  <rect x="44" y="10" width="4" height="4" fill="#0a192f"/>
  <rect x="52" y="10" width="4" height="4" fill="#0a192f"/>
  <rect x="60" y="10" width="4" height="4" fill="#0a192f"/>
  
  <rect x="36" y="18" width="4" height="4" fill="#0a192f"/>
  <rect x="48" y="18" width="4" height="4" fill="#0a192f"/>
  <rect x="56" y="18" width="4" height="4" fill="#0a192f"/>

  <rect x="10" y="36" width="4" height="4" fill="#0a192f"/>
  <rect x="18" y="36" width="4" height="4" fill="#0a192f"/>
  <rect x="26" y="36" width="4" height="4" fill="#0a192f"/>
  <rect x="34" y="36" width="4" height="4" fill="#0a192f"/>
  <rect x="42" y="36" width="4" height="4" fill="#0a192f"/>
  <rect x="50" y="36" width="4" height="4" fill="#0a192f"/>
  <rect x="58" y="36" width="4" height="4" fill="#0a192f"/>
  <rect x="66" y="36" width="4" height="4" fill="#0a192f"/>
  <rect x="74" y="36" width="4" height="4" fill="#0a192f"/>
  <rect x="82" y="36" width="4" height="4" fill="#0a192f"/>

  <rect x="36" y="44" width="4" height="4" fill="#0a192f"/>
  <rect x="44" y="44" width="4" height="4" fill="#0a192f"/>
  <rect x="52" y="44" width="4" height="4" fill="#0a192f"/>
  <rect x="60" y="44" width="4" height="4" fill="#0a192f"/>
  <rect x="68" y="44" width="4" height="4" fill="#0a192f"/>
  <rect x="76" y="44" width="4" height="4" fill="#0a192f"/>
  <rect x="84" y="44" width="4" height="4" fill="#0a192f"/>

  <rect x="36" y="52" width="4" height="4" fill="#0a192f"/>
  <rect x="44" y="52" width="4" height="4" fill="#0a192f"/>
  <rect x="56" y="52" width="4" height="4" fill="#0a192f"/>
  <rect x="64" y="52" width="4" height="4" fill="#0a192f"/>
  <rect x="72" y="52" width="4" height="4" fill="#0a192f"/>

  <rect x="10" y="60" width="4" height="4" fill="#0a192f"/>
  <rect x="22" y="60" width="4" height="4" fill="#0a192f"/>
  <rect x="34" y="60" width="4" height="4" fill="#0a192f"/>
  <rect x="42" y="60" width="4" height="4" fill="#0a192f"/>
  <rect x="50" y="60" width="4" height="4" fill="#0a192f"/>
  <rect x="58" y="60" width="4" height="4" fill="#0a192f"/>
  <rect x="70" y="60" width="4" height="4" fill="#0a192f"/>
  <rect x="82" y="60" width="4" height="4" fill="#0a192f"/>

  <rect x="36" y="68" width="4" height="4" fill="#0a192f"/>
  <rect x="44" y="68" width="4" height="4" fill="#0a192f"/>
  <rect x="52" y="68" width="4" height="4" fill="#0a192f"/>
  <rect x="64" y="68" width="4" height="4" fill="#0a192f"/>
  <rect x="72" y="68" width="4" height="4" fill="#0a192f"/>
  <rect x="80" y="68" width="4" height="4" fill="#0a192f"/>

  <rect x="36" y="76" width="4" height="4" fill="#0a192f"/>
  <rect x="48" y="76" width="4" height="4" fill="#0a192f"/>
  <rect x="56" y="76" width="4" height="4" fill="#0a192f"/>
  <rect x="68" y="76" width="4" height="4" fill="#0a192f"/>
  <rect x="84" y="76" width="4" height="4" fill="#0a192f"/>

  <rect x="36" y="84" width="4" height="4" fill="#0a192f"/>
  <rect x="44" y="84" width="4" height="4" fill="#0a192f"/>
  <rect x="60" y="84" width="4" height="4" fill="#0a192f"/>
  <rect x="68" y="84" width="4" height="4" fill="#0a192f"/>
  <rect x="76" y="84" width="4" height="4" fill="#0a192f"/>
  <rect x="84" y="84" width="4" height="4" fill="#0a192f"/>
</svg>
"""

# Realistic Registrar Signature SVG (in Navy blue ink)
signature_svg = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 80" width="220" height="60">
  <path d="M 20,48 Q 45,15 70,38 T 110,32 Q 135,18 150,42 T 185,34 Q 210,12 235,38 T 260,32" 
        fill="none" stroke="#0e2340" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 32,58 C 45,20 62,8 74,48 C 82,72 105,62 125,40" 
        fill="none" stroke="#0e2340" stroke-width="2.6" stroke-linecap="round" />
  <path d="M 120,46 C 145,25 168,18 178,48 C 185,68 198,52 220,36 C 240,22 255,28 268,44" 
        fill="none" stroke="#0e2340" stroke-width="2.0" stroke-linecap="round" />
  <path d="M 50,68 C 110,65 190,62 250,56" 
        fill="none" stroke="#0e2340" stroke-width="1.8" stroke-dasharray="1 1" opacity="0.6"/>
  <!-- Flourish underline -->
  <path d="M 25,62 Q 90,75 160,60 T 265,58" 
        fill="none" stroke="#0e2340" stroke-width="2.2" stroke-linecap="round" />
</svg>
"""

# Gold Embossed Medallion Seal SVG
gold_seal_svg = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 260" width="165" height="180">
  <defs>
    <!-- Gold Gradients -->
    <linearGradient id="goldPlate" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff3b0"/>
      <stop offset="25%" stop-color="#d4af37"/>
      <stop offset="50%" stop-color="#aa7c11"/>
      <stop offset="75%" stop-color="#e6ca65"/>
      <stop offset="100%" stop-color="#8a6305"/>
    </linearGradient>
    <radialGradient id="goldRadial" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff7c2"/>
      <stop offset="50%" stop-color="#d4af37"/>
      <stop offset="85%" stop-color="#9a6e08"/>
      <stop offset="100%" stop-color="#6e4f04"/>
    </radialGradient>
    <filter id="sealShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Ribbon Tails -->
  <g filter="url(#sealShadow)">
    <!-- Left Ribbon -->
    <path d="M 85,150 L 60,245 L 85,225 L 110,245 L 100,150 Z" fill="#9e1818" stroke="#6e0f0f" stroke-width="1"/>
    <!-- Right Ribbon -->
    <path d="M 140,150 L 130,245 L 155,225 L 180,245 L 155,150 Z" fill="#122a4a" stroke="#0a192f" stroke-width="1"/>
  </g>

  <!-- Serrated Starburst Medallion (Outer Ring) -->
  <g filter="url(#sealShadow)">
    <!-- 48-point starburst -->
    <polygon points="
      120,10 125,18 133,12 136,21 146,17 147,26 157,24 157,33 167,32 165,42 175,42 171,51 180,53 174,62 183,65 176,73 184,78 175,85 182,91 172,97 178,104 167,109 171,117 159,120 162,129 150,131 151,140 139,140 138,149 127,147 125,156 115,153 112,161 103,156 98,164 91,157 85,164 80,156 73,161 70,153 63,156 61,147 54,149 53,140 46,140 47,131 40,129 43,120 37,117 41,109 36,104 42,97 38,91 45,85 41,78 49,73 47,65 56,62 55,53 64,51 65,42 75,42 77,32 87,33 91,24 101,26 106,17 116,21 120,10"
      fill="url(#goldPlate)" stroke="#805d09" stroke-width="1"/>

    <!-- Concentric Inner Circles -->
    <circle cx="112" cy="88" r="68" fill="url(#goldRadial)" stroke="#fff" stroke-width="1.2" opacity="0.9"/>
    <circle cx="112" cy="88" r="65" fill="none" stroke="#704e04" stroke-width="1.5" stroke-dasharray="2 2"/>
    <circle cx="112" cy="88" r="54" fill="none" stroke="#ffe794" stroke-width="1"/>
    <circle cx="112" cy="88" r="50" fill="url(#goldRadial)" stroke="#704e04" stroke-width="1.5"/>

    <!-- Circular Text: SEAL OF THE REGISTRAR OF COMPANIES • NEW ZEALAND • -->
    <path id="textCircle" d="M 112,88 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0" fill="none"/>
    <text font-family="'Cinzel', 'Times New Roman', serif" font-size="7.6" font-weight="900" fill="#4d3502" letter-spacing="1.5">
      <textPath href="#textCircle" startOffset="50%" text-anchor="middle">
        ★ REGISTRAR OF COMPANIES ★ NEW ZEALAND
      </textPath>
    </text>

    <!-- Center Insignia: Crown & Fern Crest -->
    <g transform="translate(94, 66) scale(0.72)">
      <path d="M 4,28 L 10,12 L 20,22 L 25,6 L 30,22 L 40,12 L 46,28 Z" fill="#fff" opacity="0.9" stroke="#523902" stroke-width="1.2"/>
      <rect x="4" y="28" width="42" height="6" fill="#fff" rx="2" stroke="#523902" stroke-width="1"/>
      <circle cx="10" cy="11" r="2" fill="#d4af37"/>
      <circle cx="25" cy="5" r="2.5" fill="#d4af37"/>
      <circle cx="40" cy="11" r="2" fill="#d4af37"/>
    </g>

    <!-- Silver Fern Fronds -->
    <g transform="translate(86, 92) scale(0.65)" stroke="#4a3302" stroke-width="1.8" fill="none">
      <path d="M 40,32 Q 20,15 10,0"/>
      <path d="M 18,22 Q 28,18 36,24"/>
      <path d="M 14,14 Q 24,10 30,16"/>
      <path d="M 11,6 Q 19,3 24,8"/>

      <path d="M 40,32 Q 60,15 70,0"/>
      <path d="M 62,22 Q 52,18 44,24"/>
      <path d="M 66,14 Q 56,10 50,16"/>
      <path d="M 69,6 Q 61,3 56,8"/>
    </g>

    <text x="112" y="118" font-family="'Cinzel', serif" font-size="8.5" font-weight="bold" fill="#3b2901" text-anchor="middle" letter-spacing="2">
      OFFICIAL SEAL
    </text>
  </g>
</svg>
"""

def generate_html(is_render_only=False):
    cert_actions_html = "" if is_render_only else """
  <!-- Top Action Controls for Browser Viewers -->
  <div class="cert-actions">
    <button class="btn-action" onclick="window.print()">
      🖨️ Print / Save as PDF
    </button>
    <a class="btn-action" href="/heron_certificate_of_incorporation.png" download="heron_certificate_of_incorporation.png">
      ⬇️ Download High-Res Image
    </a>
    <a class="btn-action" href="/heron_certificate_of_incorporation.pdf" download="heron_certificate_of_incorporation.pdf">
      📄 Download PDF
    </a>
  </div>
"""

    body_bg = "#fbf9f4" if is_render_only else "#11141a"
    body_padding = "0" if is_render_only else "24px 0"
    box_shadow = "none" if is_render_only else "0 25px 60px rgba(0,0,0,0.65), 0 0 100px rgba(212,175,55,0.15)"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Certificate of Incorporation — Heron Assets Trustee Limited</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {{
      size: A4 portrait;
      margin: 0;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      background: {body_bg};
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: {body_padding};
      font-family: 'Cormorant Garamond', 'Times New Roman', serif;
      -webkit-font-smoothing: antialiased;
    }}

    .cert-actions {{
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      gap: 12px;
      z-index: 100;
    }}

    .btn-action {{
      background: #0a192f;
      color: #d4af37;
      border: 1px solid #d4af37;
      padding: 10px 18px;
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
      transition: all 0.2s ease;
    }}

    .btn-action:hover {{
      background: #d4af37;
      color: #0a192f;
      transform: translateY(-2px);
    }}

    @media print {{
      body {{
        background: transparent !important;
        padding: 0 !important;
      }}
      .cert-actions {{
        display: none !important;
      }}
      .certificate-container {{
        box-shadow: none !important;
        border: none !important;
        width: 100% !important;
        height: 100% !important;
        page-break-after: avoid !important;
      }}
    }}

    .certificate-container {{
      width: 1000px;
      height: 1414px;
      background: #fbf9f4;
      background-image: 
        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.85) 0%, rgba(246,241,230,0.85) 100%),
        repeating-linear-gradient(45deg, rgba(212,175,55,0.015) 0px, rgba(212,175,55,0.015) 2px, transparent 2px, transparent 10px);
      position: relative;
      padding: 38px;
      color: #111e30;
      box-shadow: {box_shadow};
      overflow: hidden;
      margin: 0 auto;
    }}

    /* Outer Security Frame */
    .outer-border {{
      border: 4px solid #0a192f;
      height: 100%;
      position: relative;
      padding: 6px;
      background: transparent;
    }}

    .secondary-border {{
      border: 1px solid #c5a059;
      height: 100%;
      position: relative;
      padding: 10px;
    }}

    /* Intricate Guilloché Pattern Strip */
    .guilloche-border {{
      border: 2px solid #0a192f;
      position: relative;
      height: 100%;
      padding: 24px 34px 20px;
      background: rgba(255, 255, 255, 0.45);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}

    /* Security Corner Ornaments */
    .corner {{
      position: absolute;
      width: 32px;
      height: 32px;
      border: 3px solid #c5a059;
      z-index: 10;
    }}
    .corner-tl {{ top: 4px; left: 4px; border-right: none; border-bottom: none; }}
    .corner-tr {{ top: 4px; right: 4px; border-left: none; border-bottom: none; }}
    .corner-bl {{ bottom: 4px; left: 4px; border-right: none; border-top: none; }}
    .corner-br {{ bottom: 4px; right: 4px; border-left: none; border-top: none; }}

    /* Subtle Watermark */
    .watermark {{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 580px;
      height: 580px;
      opacity: 0.045;
      pointer-events: none;
      z-index: 1;
      background-image: url('{nz_crest_uri}');
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
    }}

    .content {{
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      height: 100%;
    }}

    /* Header */
    .coat-of-arms {{
      width: 145px;
      height: 110px;
      margin-bottom: 8px;
      filter: drop-shadow(0 2px 5px rgba(0,0,0,0.12));
    }}

    .gov-agency {{
      font-family: 'Cinzel', serif;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 5px;
      color: #0a192f;
      text-transform: uppercase;
      margin-top: 4px;
    }}

    .gov-sub {{
      font-family: 'Montserrat', sans-serif;
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 3px;
      color: #7a6026;
      text-transform: uppercase;
      margin-top: 3px;
    }}

    .divider-gold {{
      width: 100%;
      max-width: 620px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #c5a059 25%, #d4af37 50%, #c5a059 75%, transparent);
      margin: 16px 0 14px;
      position: relative;
    }}

    .divider-gold::after {{
      content: '◆';
      position: absolute;
      top: -7px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      color: #c5a059;
      background: #fbf9f4;
      padding: 0 8px;
    }}

    /* Title */
    .cert-title {{
      font-family: 'Cinzel', serif;
      font-size: 38px;
      font-weight: 900;
      color: #0b1f3b;
      letter-spacing: 7px;
      text-transform: uppercase;
      line-height: 1.15;
      text-shadow: 1px 1px 0 rgba(255,255,255,0.8), 2px 2px 3px rgba(0,0,0,0.08);
      margin-bottom: 4px;
    }}

    .statute {{
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 17px;
      font-weight: 600;
      color: #555e6d;
      letter-spacing: 2px;
      margin-bottom: 22px;
    }}

    .cert-intro {{
      font-family: 'Cormorant Garamond', serif;
      font-size: 19px;
      font-style: italic;
      color: #3b4554;
      margin-bottom: 12px;
      letter-spacing: 1px;
    }}

    /* Main Entity Name */
    .company-name {{
      font-family: 'Cinzel', serif;
      font-size: 32px;
      font-weight: 900;
      color: #08162b;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      padding: 10px 24px;
      margin-bottom: 14px;
      border-top: 1px solid rgba(212,175,55,0.4);
      border-bottom: 1px solid rgba(212,175,55,0.4);
      background: linear-gradient(180deg, rgba(212,175,55,0.05) 0%, rgba(212,175,55,0.12) 100%);
      display: inline-block;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }}

    .cert-body-p {{
      font-family: 'Cormorant Garamond', serif;
      font-size: 19.5px;
      line-height: 1.55;
      color: #1e2837;
      max-width: 820px;
      margin-bottom: 22px;
      text-align: center;
    }}

    .cert-body-p strong {{
      font-weight: 700;
      color: #08162b;
    }}

    /* Official Credentials Grid */
    .credentials-card {{
      width: 100%;
      max-width: 830px;
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid #c5a059;
      border-radius: 4px;
      padding: 16px 20px;
      margin-bottom: 22px;
      box-shadow: inset 0 0 14px rgba(212,175,55,0.08), 0 2px 8px rgba(0,0,0,0.04);
    }}

    .credentials-grid {{
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      row-gap: 10px;
      column-gap: 28px;
      text-align: left;
    }}

    .cred-item {{
      display: flex;
      flex-direction: column;
    }}

    .cred-label {{
      font-family: 'Montserrat', sans-serif;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #6d531a;
      margin-bottom: 2px;
    }}

    .cred-value {{
      font-family: 'Montserrat', sans-serif;
      font-size: 13.5px;
      font-weight: 600;
      color: #0b1f3b;
      letter-spacing: 0.5px;
    }}

    .cred-full {{
      grid-column: 1 / -1;
      border-top: 1px dashed rgba(212,175,55,0.4);
      padding-top: 8px;
      margin-top: 2px;
    }}

    /* Statutory Attestation */
    .attestation {{
      font-family: 'Cormorant Garamond', serif;
      font-size: 17px;
      font-style: italic;
      color: #2b3545;
      max-width: 800px;
      margin-bottom: 28px;
      line-height: 1.45;
    }}

    /* Signatures, Seal & Verification */
    .auth-section {{
      width: 100%;
      max-width: 850px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: auto;
      padding-bottom: 10px;
    }}

    .auth-col-left {{
      text-align: left;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      width: 260px;
    }}

    .qr-container {{
      border: 1px solid #c5a059;
      padding: 3px;
      background: #ffffff;
      border-radius: 4px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }}

    .doc-meta {{
      font-family: 'Montserrat', sans-serif;
      font-size: 9px;
      color: #4b5563;
      line-height: 1.35;
    }}

    .doc-meta strong {{
      color: #0b1f3b;
      font-weight: 700;
    }}

    .auth-col-center {{
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-bottom: -15px;
    }}

    .auth-col-right {{
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      width: 270px;
    }}

    .sig-block {{
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }}

    .sig-line {{
      width: 220px;
      height: 1px;
      background: #0a192f;
      margin-top: -6px;
      margin-bottom: 6px;
    }}

    .sig-name {{
      font-family: 'Cinzel', serif;
      font-size: 13.5px;
      font-weight: 800;
      color: #0b1f3b;
      letter-spacing: 1px;
    }}

    .sig-title {{
      font-family: 'Montserrat', sans-serif;
      font-size: 10.5px;
      font-weight: 600;
      color: #635022;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }}

    .sig-location {{
      font-family: 'Cormorant Garamond', serif;
      font-size: 13.5px;
      font-style: italic;
      color: #4b5563;
      margin-top: 2px;
    }}

    /* Bottom Security Footer */
    .cert-footer {{
      width: 100%;
      border-top: 1px solid rgba(11,31,59,0.15);
      padding-top: 10px;
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'Montserrat', sans-serif;
      font-size: 8.5px;
      letter-spacing: 1px;
      color: #6b7280;
      text-transform: uppercase;
    }}

    .security-bar {{
      font-family: monospace;
      letter-spacing: 2px;
      font-size: 8px;
      color: #0a192f;
      font-weight: bold;
    }}
  </style>
</head>
<body>

  {cert_actions_html}

  <div class="certificate-container" id="certificate">
    <div class="outer-border">
      <div class="secondary-border">
        <div class="guilloche-border">
          
          <!-- Security Corners -->
          <div class="corner corner-tl"></div>
          <div class="corner corner-tr"></div>
          <div class="corner corner-bl"></div>
          <div class="corner corner-br"></div>

          <!-- Central Translucent Watermark -->
          <div class="watermark"></div>

          <!-- Main Content Flow -->
          <div class="content">

            <!-- National Crest -->
            <img class="coat-of-arms" src="{nz_crest_uri}" alt="Coat of Arms of New Zealand" />

            <div class="gov-agency">NEW ZEALAND COMPANIES OFFICE</div>
            <div class="gov-sub">Te Tari Taiwhenua • Ministry of Business, Innovation & Employment</div>

            <div class="divider-gold"></div>

            <h1 class="cert-title">Certificate of Incorporation</h1>
            <div class="statute">Pursuant to the Companies Act 1993</div>

            <div class="cert-intro">This is to certify that</div>

            <div class="company-name">HERON ASSETS TRUSTEE LIMITED</div>

            <p class="cert-body-p">
              was incorporated under the <strong>Companies Act 1993</strong> on the 
              <strong>18th day of October 2021</strong>, and is entered upon the Register of Companies of 
              <strong>New Zealand</strong> as a registered institutional entity.
            </p>

            <!-- Comprehensive Legal & Registration Metadata -->
            <div class="credentials-card">
              <div class="credentials-grid">
                <div class="cred-item">
                  <span class="cred-label">Company Number (NZCN)</span>
                  <span class="cred-value">8419283</span>
                </div>
                <div class="cred-item">
                  <span class="cred-label">New Zealand Business Number (NZBN)</span>
                  <span class="cred-value">9429051839201</span>
                </div>
                <div class="cred-item">
                  <span class="cred-label">Entity Classification</span>
                  <span class="cred-value">NZ Limited Company (Institutional Trustee)</span>
                </div>
                <div class="cred-item">
                  <span class="cred-label">Current Legal Status</span>
                  <span class="cred-value" style="color: #0f766e;">● Registered &amp; Good Standing</span>
                </div>
                <div class="cred-item">
                  <span class="cred-label">Incorporation Date</span>
                  <span class="cred-value">18 October 2021</span>
                </div>
                <div class="cred-item">
                  <span class="cred-label">Financial Service Providers (FSPR) Ref</span>
                  <span class="cred-value">FSP719402</span>
                </div>
                <div class="cred-item cred-full">
                  <span class="cred-label">Registered Office Address</span>
                  <span class="cred-value">Level 21, ANZ Centre, 23 Albert Street, Auckland Central, Auckland 1010, New Zealand</span>
                </div>
              </div>
            </div>

            <div class="attestation">
              I hereby certify that the company has fulfilled all statutory requirements of registration and is authorized 
              to execute institutional digital asset custody, fiduciary treasury management, and trust portfolio stewardship 
              under the regulatory statutes of New Zealand.
            </div>

            <!-- Authentic Execution: QR Code, Gold Embossed Seal, Registrar Signature -->
            <div class="auth-section">
              <!-- Left: Verification QR & Security Metadata -->
              <div class="auth-col-left">
                <div class="qr-container">
                  {qr_svg}
                </div>
                <div class="doc-meta">
                  <strong>DOCUMENT ID:</strong> NZ-CO-8419283-TR<br />
                  <strong>SECURE KEY:</strong> 9429-0518-3920-1NZ<br />
                  <strong>VERIFY:</strong> companies-register.companiesoffice.govt.nz
                </div>
              </div>

              <!-- Center: Official 3D Gold Foil Seal -->
              <div class="auth-col-center">
                {gold_seal_svg}
              </div>

              <!-- Right: Registrar Signature & Seal -->
              <div class="auth-col-right">
                <div class="sig-block">
                  {signature_svg}
                  <div class="sig-line"></div>
                  <div class="sig-name">M. J. Brosnahan</div>
                  <div class="sig-title">Registrar of Companies</div>
                  <div class="sig-location">Issued at Auckland, New Zealand</div>
                </div>
              </div>
            </div>

            <!-- Footer Barcode & Microtext -->
            <div class="cert-footer">
              <span>NEW ZEALAND COMPANIES REGISTER • OFFICIAL SEAL DOCUMENT</span>
              <span class="security-bar">||||| | |||| ||||| || |||||| |||| ||| |||||||</span>
              <span>COMPANIES ACT 1993 • SECURE JURISDICTION: NZ</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>

</body>
</html>
"""

# Write HTML file with interactive controls for users
web_html = os.path.join(WEB_PUBLIC, "certificate.html")
dash_html = os.path.join(DASH_PUBLIC, "certificate.html")
with open(web_html, "w", encoding="utf-8") as f:
    f.write(generate_html(is_render_only=False))
with open(dash_html, "w", encoding="utf-8") as f:
    f.write(generate_html(is_render_only=False))

# Write render-only HTML (for clean PDF & PNG export without buttons and margins)
render_html_path = os.path.join(WEB_PUBLIC, "certificate_render.html")
with open(render_html_path, "w", encoding="utf-8") as f:
    f.write(generate_html(is_render_only=True))

chrome_paths = [
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
]

chrome_bin = None
for p in chrome_paths:
    if os.path.exists(p):
        chrome_bin = p
        break

if chrome_bin:
    abs_render_html = os.path.abspath(render_html_path)
    file_url = f"file:///{abs_render_html}"

    web_png = os.path.join(WEB_PUBLIC, "heron_certificate_of_incorporation.png")
    web_pdf = os.path.join(WEB_PUBLIC, "heron_certificate_of_incorporation.pdf")
    dash_png = os.path.join(DASH_PUBLIC, "heron_certificate_of_incorporation.png")
    dash_pdf = os.path.join(DASH_PUBLIC, "heron_certificate_of_incorporation.pdf")

    # Render PNG screenshot (High resolution with retina scale factor)
    cmd_png = [
        chrome_bin,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1000,1414",
        "--device-scale-factor=2",
        f"--screenshot={web_png}",
        file_url
    ]
    subprocess.run(cmd_png, capture_output=True, text=True)

    # Render PDF (A4 format)
    cmd_pdf = [
        chrome_bin,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={web_pdf}",
        file_url
    ]
    subprocess.run(cmd_pdf, capture_output=True, text=True)

    # Copy generated files to dashboard/public
    if os.path.exists(web_png):
        shutil.copyfile(web_png, dash_png)
        print(f"Generated PNG: {web_png} ({os.path.getsize(web_png):,} bytes)")

    if os.path.exists(web_pdf):
        shutil.copyfile(web_pdf, dash_pdf)
        print(f"Generated PDF: {web_pdf} ({os.path.getsize(web_pdf):,} bytes)")

    # Clean up render-only temporary file
    if os.path.exists(render_html_path):
        os.remove(render_html_path)
