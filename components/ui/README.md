# UI Component Scaffold

This folder now supports a scalable structure while preserving existing screens.

## Directories

- `primitives/`: basic building blocks (`Button`, `Input`, `AppTopBar`, `Checkbox`, `Divider`)
- `layout/`: high-level screen composition helpers (`ScreenShell`, `SectionCard`, `StickyActionBar`)
- `feedback/`: loading/empty/error/auth-required states
- `commerce/`: rental and billing UI blocks (`StatusPill`, `PriceSummaryRow`)

## Usage

- Import from `components/ui` via `mobile/components/ui/index.ts`.
- Existing components and props are unchanged.
- No screen migrations were done in this phase.

## Shared Utilities

- Shared UI logic lives in `mobile/lib/ui` (`pricing`, `currency`, `billingStatus`, `text`).
- These utilities are setup-only in this phase and can be adopted incrementally screen by screen.
