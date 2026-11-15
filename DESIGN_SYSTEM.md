# Travel JOJO interface system

Keep the existing Golos Text, logo, photography and cream/terracotta/brown palette.
The “Joelma & Job — Nossa viagem” heading and Home summary content remain intact.

## Roles

- Cream page background; sand for self-contained groups such as destinations and totals.
- Terracotta for the next primary action. Selection also uses weight, border and `aria-pressed`.
- Brown summary and feedback surfaces. Secondary hero actions become outlined when their section is already open.
- Continuous daily agenda, separated by rules instead of nested cards.
- Plain metadata labels have no button-like borders. Only interactive elements get action geometry.

## Metrics

- Spacing: 4, 8, 12, 16, 24 and 32 px.
- Type: metadata 14, body/controls 16, item 18, section 20, page title 28 px; amounts 32 px and Arabic 29 px.
- Weights: 400 body, 600 controls/section titles, 700 page titles and selected choices.
- Control radius 12 px; grouped surface radius 24 px. Touch controls at least 48 px; feedback close/undo at least 44 px.
- Functional icons: 20 px, 1.7 stroke; navigation retains its existing optical size. No decorative icons on agenda rows, metadata or Save/Cancel.

## Interaction

Async editor submissions show a busy label and spinner and disable controls until completion.
Duplicate submissions and closing the editor during submission are blocked. Errors restore controls and remain available to read; validation focuses the invalid field.
Local writes remain immediate; no artificial loading delay is added.
Motion lasts 140 ms and only affects color/pressed/disclosure states. Reduced-motion preference disables transitions and animations; loading still has a text label.

## Validation

Browser checks cover both languages, three widths (320, 390, 430), standard/dark/Sun themes, enlarged text, reduced motion, keyboard focus, delayed sign-in/retry, offline synchronization, undo and brief feedback.

Physical-device validation remains necessary on iPhone and Android: open keyboard, long Dutch labels, one-handed use, outdoor Sun mode and reading zoom. This environment does not establish physical-device results.
