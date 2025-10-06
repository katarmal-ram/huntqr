# QR Risk Hunt - Design Guidelines

## Design Approach

**Hybrid Gamification + Productivity System**
Drawing inspiration from Kahoot's playful energy, Linear's clean interface, and Duolingo's engagement mechanics. The design balances educational professionalism with game excitement, creating tension around risk-taking decisions while maintaining clarity for real-time classroom gameplay.

---

## Core Design Elements

### A. Color Palette

**Dark Mode Primary (Main Interface)**
- Background Base: 222 15% 8%
- Surface Elevated: 222 15% 12%
- Risk Warning Red: 0 75% 55%
- Success Green: 142 70% 45%
- Jackpot Gold: 45 90% 55%
- Primary Accent: 260 75% 60% (deep purple for energy/focus)
- Neutral Text: 0 0% 95%
- Muted Text: 0 0% 60%

**Light Mode (Admin Dashboard)**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Borders: 220 15% 88%
- Text: 222 15% 15%

**Team Colors (Vibrant for distinction)**
- Team 1: 210 85% 55% (Electric Blue)
- Team 2: 150 70% 50% (Emerald)
- Team 3: 30 90% 55% (Bright Orange)
- Team 4: 280 75% 60% (Purple)
- Team 5: 340 80% 55% (Rose)

### B. Typography

**Font Stack**
- Primary: 'Inter', system-ui, sans-serif (Google Fonts)
- Monospace: 'JetBrains Mono' (for codes, scores, timers)

**Scale**
- Hero Display: text-6xl font-black (admin session headers)
- Game Score: text-8xl font-black (score reveals)
- Headings: text-3xl font-bold
- Body: text-base font-medium
- Caption: text-sm font-normal
- Codes: text-2xl font-mono tracking-wider

### C. Layout System

**Spacing Primitives**: Consistent use of 2, 4, 8, 12, 16 units
- Tight: p-2, gap-2 (buttons, badges)
- Standard: p-4, gap-4 (cards, forms)
- Comfortable: p-8, gap-8 (sections)
- Generous: p-12, py-16 (page containers)

**Grid Strategy**
- Admin Dashboard: 2-column split (controls + preview)
- Leaderboard: Single column with cards (mobile-first)
- Analytics: 2-4 column metrics grid
- Team Selection: 2-3 column grid of team cards

### D. Component Library

**Navigation**
- Admin: Fixed top bar with session status, timer, and quick actions
- Player: Minimal header with team badge and live timer
- Consistent z-index hierarchy (nav: 50, modals: 60, toast: 70)

**Core UI Elements**
- **Buttons**: Rounded-lg with clear hierarchy
  - Primary: Solid bg with team/brand color
  - Warning: Red with pulsing animation for risks
  - Outline on images: Backdrop-blur-md with border
  - Icon: Heroicons library (CDN)

- **Cards**: Rounded-xl with subtle shadow-lg
  - Team cards: Border-2 in team color
  - Leaderboard: Animated position changes
  - Code entry: Prominent with glow effect on focus

- **Modals**: Centered overlay with backdrop-blur-sm
  - Risk confirmation: Red border, dramatic copy
  - Score reveal: Full-screen takeover with animation
  - Max-w-md to max-w-2xl based on content

**Real-time Indicators**
- Live pulse dot for active sessions
- Animated score transitions (count-up effect)
- Timer with color change (green → yellow → red)
- Team position arrows (↑↓) on leaderboard

**Forms & Inputs**
- Dark mode: bg-neutral-800 with border-neutral-700
- Focus: ring-2 ring-primary with scale transform
- Code input: Extra-large, centered, monospace
- QR scanner: Full-width camera preview with guides

**Data Display**
- Leaderboard: Gradient backgrounds for top 3
- Score history: Line chart with area fill
- Analytics: Large metric cards with trend indicators
- Scan log: Timeline view with success/fail colors

### E. Animations

**Strategic Use Only**
- Score reveal: Scale + fade-in (duration-500)
- Position changes: Smooth reordering (duration-700)
- Risk modal: Subtle shake on appear
- Timer countdown: Pulse when < 2 minutes
- Jackpot hit: Confetti + gold flash (brief celebration)

---

## Page-Specific Guidelines

### Admin Dashboard
- Split view: Controls (left 40%) + Live preview (right 60%)
- Session status card with prominent start/stop controls
- Code management: Upload CSV or manual entry table
- Real-time leaderboard mirror of player view
- Analytics toggle: Switch between live and replay modes

### Player Interface
**Hero/Entry Screen**
- Full-screen team selection cards (2-3 columns on desktop)
- Educational disclaimer banner at top
- Session info: Timer, admin name, code count
- Join button: Large, team-colored, prominent

**Game Screen**
- Persistent header: Team badge, current score, timer
- Code entry: Center-stage, 60% viewport height
- Quick scan button (QR camera) as floating action
- Minimal distractions during active play

**Confirmation Modal**
- Warning icon + risk message
- Two-button choice: Bold "Take Risk" vs subtle "Cancel"
- Semi-transparent backdrop to show score context

**Score Reveal**
- Full-viewport takeover (100vh)
- Massive score display with +/- prefix
- Quick dismiss to return to game
- Victory/defeat micro-interaction based on value

### Analytics/Replay View
- Timeline scrubber showing all scans chronologically
- Multi-line chart: Team risk curves over time
- Metrics grid: 4-column (avg points, volatility, jackpots, scans)
- Export button: Prominent top-right

---

## Images

**Educational Hero Image**
- Placement: Admin landing/dashboard background (subtle, 20% opacity overlay)
- Description: Abstract risk visualization - dice, arrows, graph trending up/down, or students collaborating in modern classroom
- Style: Geometric, professional, muted colors to not distract

**QR Code Visuals**
- Placement: Player code entry screen (decorative)
- Description: Stylized QR code patterns as background elements
- Style: Outlined, ghost effect, team-colored

No large hero images - interface prioritizes functional game elements over marketing visuals.

---

## Critical Implementation Notes

- All real-time updates use smooth transitions (no jarring changes)
- Viewport management: Natural heights, no forced 100vh except score reveals
- Responsive breakpoints: Mobile-first, stack admin controls vertically on small screens
- Accessibility: High contrast for scores, keyboard navigation for all actions
- Performance: Debounce real-time updates to 200ms, optimize leaderboard re-renders