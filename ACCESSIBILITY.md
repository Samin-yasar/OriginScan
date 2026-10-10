# Accessibility

Accessibility is a core priority for **OriginScan**. We want everyone — including people with disabilities and people using assistive technology — to be able to read, navigate, use, and contribute to this application.

OriginScan is built as an accessible, client-side product origin scanner with integrated accessibility features, including high-contrast mode, dark and light themes, typography adjustments, reading guides, audio and haptic feedback, and full keyboard navigation.

This document explains our accessibility commitment, how contributors can help us uphold it, and how to report accessibility issues.

## Priorities

- **Accessibility target:** We work toward [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22). This target guides our ongoing development as an aspirational goal rather than a claim of verified conformance.
- **Keyboard support** — every interactive element (camera toggles, file uploads, manual inputs, history items, modal dialogs, and accessibility controls) must be reachable and operable with a keyboard alone, with a visible focus indicator and a logical tab order. Modals contain focus traps and close with the `Escape` key.
- **Screen reader support** — content uses semantic HTML and a logical heading hierarchy so it can be navigated with VoiceOver, NVDA, JAWS, TalkBack, and similar tools. Status updates, scan results, and error notifications use ARIA live regions to announce changes dynamically.
- **Readable content & visual comfort** — we provide high-contrast color inversion, custom reading guides, scalable typography, descriptive link text, and meaningful alternative text for flags, icons, and product images.
- **Audio and haptic alternatives** — scan confirmation sounds and vibration alerts are optional and toggleable to accommodate sensory preferences.
- **Language declaration** — Bengali cultural elements and English content declare their language attributes so assistive technologies pronounce them correctly.

## Contributor expectations

If you are contributing content, design, or code to OriginScan, please follow these guardrails so we don't regress accessibility:

- **Testing**
  - For UI changes, test with an automated accessibility tool (such as [axe DevTools](https://www.deque.com/axe/devtools/) or Lighthouse).
  - Do at least one keyboard-only pass on any changes involving interactive UI elements:
    - Tab order is logical (no jumps, no unexpected skips, reaches all interactive controls).
    - Visible focus indicator is always present and has sufficient contrast.
    - All actions work by keyboard (`Tab`, `Shift+Tab`, `Enter`, `Space`, arrow keys where expected, `Escape` to close overlays).
    - No keyboard traps (can move into and out of modals, settings drawers, history panels).
  - Spot-check screen reader behavior for new components or significant content changes:
    - Controls have clear, accessible labels (programmatic name matching the button/input purpose).
    - Custom controls expose proper semantics and state (`aria-expanded`, `aria-label`, `aria-live`, etc.).
    - Dynamic updates are announced appropriately (scan errors, API lookup statuses, validation warnings).
- **Documentation and content**
  - Use a logical heading hierarchy (do not skip heading levels).
  - Use semantic list elements (`<ul>`, `<ol>`).
  - Use unique, descriptive link text (avoid generic phrases like "click here" or "read more").
  - Provide meaningful alternative text for all informational images; refer to the [W3C alt Decision Tree](https://www.w3.org/WAI/tutorials/images/decision-tree/).
  - Decorative icons or SVGs should include `aria-hidden="true"` so they do not clutter screen reader announcements.
  - Don't use color as the only way to convey meaning (such as valid vs. invalid checksums).
  - Ensure content reflows without loss of functionality when zoomed up to 200% or viewed on narrow mobile screens.
- **CI/CD & Code Reviews**
  - Resolve flagged accessibility issues prior to merge, or document why an exception exists in the pull request description.

## Reporting accessibility issues

If you run into an accessibility barrier in OriginScan, please let us know — we treat accessibility reports as expertise, not complaints.

1. **Open an issue** on GitHub at [OriginScan Issues](https://github.com/Samin-yasar/OriginScan/issues/new).
2. Include, when possible:
   - What you were trying to do and what barrier you encountered.
   - The page URL or section of the app.
   - Steps to reproduce the issue.
   - Your operating system, browser, and assistive technology (e.g., VoiceOver on macOS, NVDA on Windows, TalkBack on Android), including versions if known.
   - A screen recording or screenshot, if you feel comfortable sharing one.
   - Severity, using the [defined taxonomy](#severity) below.

### Severity

- **Critical:** Prevents you from completing a core task (for example, barcode entry or scanning is completely unusable via keyboard or screen reader).
- **Serious:** Significant difficulty in using a feature, but an alternative workaround exists.
- **Moderate:** Inconsistent behavior or confusing announcement that causes friction.
- **Minor:** Minor visual, contrast, or phrasing issue with minimal impact on usability.

### How we respond

- We will acknowledge the reporter's experience promptly, respectfully, and constructively — treating accessibility reports as valuable project expertise.
- We will not require reporters to disclose a diagnosis or personal medical information.
- We will explain next steps, known limitations, and relevant technical dependencies.
- Where possible, we will provide a workaround while a fix is in progress.
- We will provide status updates in the issue thread.
- We may invite the reporter to verify that a fix resolves the barrier before closing the issue.
- We will thank the reporter for helping improve OriginScan for everyone.

### Resolution expectations

After triage, issues are prioritized according to severity:

- **Critical:** Targeted resolution within 30 days.
- **Serious:** Targeted resolution within 60 days.
- **Moderate:** Targeted resolution within 90 days.
- **Minor:** Targeted resolution within 90 days.

These targets begin when the issue is triaged. If we cannot meet a target, we will communicate the reason, share any available workarounds, and provide a revised target date.

## Ownership and maintenance

Accessibility for OriginScan is maintained by [@Samin-yasar](https://github.com/Samin-yasar) and project contributors.

### Responsibilities

The accessibility maintainer is responsible for:
- Triaging incoming accessibility reports.
- Tracking accessibility improvements and known barriers.
- Reviewing pull requests for accessibility compliance.
- Keeping OriginScan's accessibility documentation current.

## Supported environments

OriginScan is a static, client-side web application designed to run locally and across modern browsers:

- **Desktop browsers:** Latest two versions of Chrome, Edge, Firefox, and Safari.
- **Mobile browsers:** Latest two versions of Mobile Safari (iOS) and Chrome (Android).
- **Assistive technology:** VoiceOver (macOS / iOS), NVDA (Windows), JAWS (Windows), TalkBack (Android).

Partial-support notes:
- The BarcodeDetector API is hardware- and browser-dependent; fallback software scanning (html5-qrcode) and manual input are provided on all platforms.
- Camera access requires explicit user permission and HTTPS / localhost context.

## Known limitations

- **Camera viewfinder accessibility:** While barcode detection results and error states are fully announced, the live video stream itself is purely visual; manual text entry and image file upload are provided as full accessible alternatives.
- **Third-party product images:** Product photos and descriptions fetched dynamically from Open Food Facts or Open Products Facts are community-sourced and may occasionally lack rich alt descriptions.

**Note:** If you encounter any barriers not listed here, please open an issue to let us know.

## Feedback

Accessibility is an ongoing practice, not a one-time fix. If you have suggestions for improving this document, our accessibility settings, or our development practices, please open an issue or submit a pull request. Thank you for helping make OriginScan usable by everyone.
