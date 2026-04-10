# Ordo — Legal Deadline Management System

## Visual Atmosphere

Professional, trustworthy, focused. Minimalist design for Quebec lawyers. The interface disappears; what matters are your cases and deadlines. No clutter, no distraction. Dark mode-first, light mode compatible.

## Color Palette

| Name | Hex | Use | Semantic |
|------|-----|-----|----------|
| Slate-900 | #0F172A | Primary text, headlines | Trust, authority |
| Slate-800 | #1E293B | Primary actions, active states | Focus |
| Indigo-600 | #4F46E5 | Secondary actions, links | Action, interaction |
| Emerald-500 | #10B981 | Success, deadline met | Positive |
| Amber-500 | #D97706 | Warning, approaching deadline | Caution |
| Red-600 | #DC2626 | Danger, overdue, urgent | Critical |
| Slate-400 | #94A3B8 | Secondary text, hints | Neutral |
| Slate-200 | #E2E8F0 | Borders, dividers | Structure |
| White | #FFFFFF | Backgrounds | Clean |
| Slate-900 @ 5% | #F8FAFC | Subtle backgrounds | Breathing room |

## Typography

**Font Stack**: Inter (sans-serif, default), Courier New (monospace for dates/codes)

| Element | Size | Weight | Line-Height | Use |
|---------|------|--------|-------------|-----|
| H1 | 24px | 600 | 1.2 | Page titles |
| H2 | 22px | 600 | 1.3 | Section headers |
| Body | 13px | 400 | 1.5 | Content text |
| Small | 12px | 400 | 1.4 | Secondary info |
| Micro | 11px | 400 | 1.3 | Labels, dates |

## Component Library

### Case Card
- **Container**: White bg, 1px border #E2E8F0, 8px radius, 12px padding
- **Title**: 13px #0F172A, 600 weight
- **Client**: 12px #94A3B8, 400 weight
- **Status Badge**: 10px, 8px padding, semantic color (urgent=#DC2626, monitor=#D97706, stable=#1E293B)
- **Hover**: Border → #4F46E5, shadow: 0 4px 12px rgba(0,0,0,0.08)

### Deadline Card
- **Date (big)**: 20px #0F172A monospace, bold
- **Label**: 12px #94A3B8
- **Days indicator**: Color-coded (red if past, amber if <3 days, slate if ok)
- **Delete**: Hover reveals trash icon, 12px #CBD5E1

### Button
- **Primary**: #4F46E5 bg, white text, 14px, 600px height, 8px radius, no border
- **Secondary**: #E2E8F0 bg, #1E293B text, same sizing
- **Disabled**: #F1F5F9 bg, #CBD5E1 text
- **Hover**: Brightness +10%

### Input Field
- **Border**: 1px #E2E8F0
- **Padding**: 10px
- **Radius**: 6px
- **Focus**: Border → #4F46E5, outline: none
- **Placeholder**: #CBD5E1

### Status Badge
- **Urgent**: Red bg (#DC2626), white text, 10px, bold, 4px padding
- **Monitor**: Amber bg (#D97706), white text
- **Stable**: Slate bg (#1E293B), white text

## Layout Grid

- **Mobile**: 100% width, single column
- **Tablet** (768+): 2-column grid, 16px gap, 24px padding
- **Desktop** (1280+): 3-column grid (cases) + left sidebar (navigation), 20px gap, 32px padding

## Spacing Scale

0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64

## Depth / Elevation

- **Base**: No shadow
- **Hover**: 0 4px 12px rgba(0,0,0,0.08)
- **Modal**: 0 20px 40px rgba(0,0,0,0.15) + 50% opacity backdrop
- **Dropdown**: 0 8px 16px rgba(0,0,0,0.1)

## Dark Mode

**Invert on dark**:
- #0F172A → #F8FAFC
- #1E293B → #E2E8F0
- #94A3B8 → #475569
- Reduce shadows by 50%
- Keep semantic colors (red, amber, green) unchanged

## Design Guardrails

1. **No unnecessary colors** - 3-color max per screen (primary, secondary, semantic)
2. **Whitespace over content** - Cards should breathe
3. **Text contrast** - Minimum 4.5:1 for accessibility
4. **Responsive first** - Design for mobile, enhance for desktop
5. **Legal clarity** - All dates/deadlines in Quebec French format (d MMM yyyy)

## Responsive Behavior

| Breakpoint | Container | Columns | Font Size | Padding |
|------------|-----------|---------|-----------|---------|
| Mobile (<768px) | 100vw | 1 | -0px | 16px |
| Tablet (768-1280px) | 100vw | 2 | 0px | 24px |
| Desktop (1280+px) | 1280px | 3 | 0px | 32px |

## Agent Prompt Guide

**For AI agents building UIs matching this design**:

```
You are building a UI for Ordo using this DESIGN.md.

Color rules:
- #0F172A for text, #4F46E5 for interactive elements
- #DC2626 (urgent), #D97706 (warning), #10B981 (success)

Component rules:
- Case cards: white bg, 1px #E2E8F0 border, 8px radius
- Deadline cards: large monospace date, color-coded status
- Status badges: semantic colors, 10px font
- Inputs: 1px #E2E8F0 border, focus → #4F46E5

Layout:
- Mobile: 1 column, 16px padding
- Desktop: 3 columns, 32px padding
- Gaps: 16-20px between cards

Typography:
- H1: Inter 24px/600, H2: 22px/600, Body: 13px/400

Accessibility:
- All text 4.5:1 contrast minimum
- No color-only indicators (always add text)
- Dates: French format only
```

---

**Design System**: Ordo v1.0  
**Last Updated**: 2026-04-10  
**Purpose**: AI-agent-readable design specification for consistent UI generation  
**Based on**: awesome-design-md (VoltAgent/awesome-design-md)
