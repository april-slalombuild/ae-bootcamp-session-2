# UI Guidelines

These guidelines define the visual language, interaction patterns, and accessibility standards for the TODO app. They are intended to keep the experience consistent, modern, and inclusive across the React frontend.

## 1. Design System Foundation

- **Framework**: Follow **Material Design 3 (M3)** as the foundational design system.
- **Component library**: Prefer Material Web / MUI v6 components that implement M3 tokens. Do not mix M2 and M3 components in the same view.
- **Design tokens**: All colors, typography, spacing, elevation, and motion values must be sourced from a central token file (e.g., `src/theme/tokens.ts`) — never hard-coded in components.
- **Theming**: Support both **light** and **dark** themes using M3 dynamic color roles (`primary`, `on-primary`, `surface`, `on-surface`, `surface-container`, etc.). The user's OS preference is the default; an in-app override is provided.

## 2. Material Components & Structure (M3)

Use M3 components for the following purposes:

| Use Case                        | Component                                       |
| ------------------------------- | ----------------------------------------------- |
| App header                      | `TopAppBar` (small, center-aligned title)       |
| Primary "Add task" action       | `FAB` (Floating Action Button), extended on desktop |
| Task list item                  | `ListItem` with leading checkbox and trailing icon button |
| Task detail / edit              | `Dialog` (modal) on mobile, `SideSheet` on desktop |
| Filters / sort                  | `SegmentedButton` and `FilterChip`              |
| Confirmation prompts            | `AlertDialog`                                   |
| Inline messages (success/error) | `Snackbar` (transient) and `Banner` (persistent) |
| Empty state                     | Centered illustration + supporting text + CTA   |

Structural rules:
- One `TopAppBar` per route.
- One primary action (FAB) per screen.
- Lists use 1-line, 2-line, or 3-line list items consistently within a single view — do not mix densities.

## 3. Color Palette (2026 Trends)

Use the M3 dynamic color system seeded by the brand color, with a 2026-forward, low-saturation palette.

- **Primary seed**: Calm, naturalistic green — `#4F7A5A` ("Sage Horizon"). All `primary*`, `secondary*`, `tertiary*` roles are generated from this seed.
- **Accent (tertiary)**: Warm clay — `#C97B5A` for highlights, badges, and "due today" indicators.
- **Neutral surfaces**: Warm off-whites and deep charcoals; avoid pure `#FFFFFF` and pure `#000000`.
- **Status colors**:
  - Success: `#3F8C5C`
  - Warning: `#C58A1F`
  - Error: M3 `error` role (do not override).
  - Overdue tasks: use `error` container with `on-error-container` text.
- **Contrast**: Every color pair (text on background, icon on surface) must meet WCAG 2.2 contrast minimums (see §6).

Do **not** use color alone to communicate state — always pair color with an icon, label, or pattern.

## 4. Typography

- **Type scale**: M3 type scale (`display`, `headline`, `title`, `body`, `label`).
- **Font family**: Use a single variable font for the entire app. Default: `Inter` (UI) with `JetBrains Mono` for any code/IDs.
- **Sizes**:
  - Page title: `headline-small` (24px)
  - Section title: `title-medium` (16px, weight 500)
  - Task title: `body-large` (16px)
  - Metadata (due date, priority): `label-medium` (12px)
- **Line height**: Minimum 1.5× for body text.
- **Truncation**: Task titles truncate at one line with ellipsis in list views; full title is shown in the detail view and as a tooltip/`aria-label`.

## 5. Button Styles & Interaction

Follow M3 button hierarchy. Each screen should have at most **one** filled (primary) button.

| Style       | When to use                                         |
| ----------- | --------------------------------------------------- |
| Filled      | Primary action (e.g., "Save", "Add task")           |
| Tonal       | Secondary, important action (e.g., "Mark complete") |
| Outlined    | Tertiary action (e.g., "Cancel" in dialogs)         |
| Text        | Low-emphasis action (e.g., "Clear completed")       |
| Icon button | Compact actions in list rows (e.g., edit, delete)   |
| FAB         | Single most important action on a screen            |

Interaction states (all required):
- **Hover**: 8% state-layer overlay using `on-surface` color.
- **Focus**: 2px focus ring using `secondary` color, offset 2px — never remove the ring.
- **Pressed**: 12% state-layer overlay.
- **Disabled**: 38% opacity on content, 12% opacity on container; cursor `not-allowed`.
- **Loading**: Replace label with a circular progress indicator; the button remains the same width.

Touch targets must be at least **48×48 px**.

## 6. Accessibility Requirements (WCAG 2.2 AA)

The app must meet **WCAG 2.2 Level AA** at minimum.

- **Contrast**: 4.5:1 for normal text, 3:1 for large text (≥18.66px bold or ≥24px regular) and UI components/graphics.
- **Keyboard**: Every action is reachable and operable via keyboard. Logical tab order; no keyboard traps.
- **Focus visibility (2.4.11)**: Focus indicator is at least 2px thick and has 3:1 contrast against adjacent colors.
- **Target size (2.5.8)**: Interactive targets are at least 24×24 CSS pixels (we adopt 48×48 as the standard).
- **Dragging movements (2.5.7)**: Any drag-and-drop reordering must have a non-drag alternative (e.g., "move up/down" buttons).
- **Consistent help (3.2.6)**: Help/feedback controls appear in the same relative location across pages.
- **Redundant entry (3.3.7)**: Do not require the user to re-enter information already provided in the same session.
- **Accessible authentication (3.3.8)**: Do not rely on cognitive function tests (no captchas without alternatives).
- **Semantics**: Use native HTML elements (`<button>`, `<input>`, `<label>`, `<nav>`, `<main>`) and ARIA only when no native equivalent exists.
- **Live regions**: Use `aria-live="polite"` for snackbars and validation feedback.
- **Motion**: Respect `prefers-reduced-motion`; disable non-essential animation when set.
- **Screen reader labels**: All icon-only buttons require `aria-label`.

## 7. Layout & Spacing

- **Grid**: 12-column responsive grid with a 4px base unit. Spacing tokens: `4, 8, 12, 16, 24, 32, 48, 64`.
- **Breakpoints**:
  - `compact`: < 600px (mobile)
  - `medium`: 600–839px (tablet)
  - `expanded`: 840–1199px (small desktop)
  - `large`: ≥ 1200px (desktop)
- **Page max width**: Content area capped at **840px** for the task list to preserve readable line lengths.
- **Padding**:
  - Page gutters: `16px` (compact), `24px` (medium+).
  - Card/dialog padding: `24px`.
  - List item vertical padding: `12px`; horizontal `16px`.
- **Spacing between elements**:
  - Related elements (label + input): `8px`
  - Sibling form fields: `16px`
  - Section groups: `32px`
- **Elevation**: Use M3 elevation levels 0–3 only. Reserve elevation 3 for dialogs and the FAB; the task list uses elevation 0 on `surface` with a subtle divider.

## 8. Iconography & Imagery

- **Icon set**: Material Symbols (Rounded), filled style for selected/active state, outlined for default.
- **Sizes**: 20px in dense list rows, 24px in standard buttons, 40px in empty states.
- **Illustrations**: Use simple, line-based illustrations for empty states; match the primary color palette and avoid purely decorative imagery without `aria-hidden`.

## 9. Motion

- **Durations**: M3 motion tokens — `short2` (100ms) for state changes, `medium2` (300ms) for screen transitions, `long2` (500ms) for entering large surfaces.
- **Easing**: Use M3 `emphasized` easing for transitions, `standard` for state changes.
- **Reduced motion**: When `prefers-reduced-motion: reduce` is set, replace transitions with instant changes and disable parallax/auto-play.

## 10. Content & Tone

- **Voice**: Friendly, concise, action-oriented ("Add a task", not "Click here to add a new task").
- **Sentence case** for all UI text (titles, buttons, labels), including dialog titles.
- **Dates**: Display in the user's locale; relative formats for recent dates ("Today", "Tomorrow", "In 3 days"), absolute formats otherwise.
- **Errors**: State what happened, why, and how to recover. Avoid blame ("Please enter a title" rather than "You forgot the title").

## 11. Dark Mode

- Use M3 dark theme color roles — never invert the light theme algorithmically.
- Surface elevation in dark mode is communicated by lighter surface tints, not shadows.
- Verify contrast for both themes before shipping any new component.
