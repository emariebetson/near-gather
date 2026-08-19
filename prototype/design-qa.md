# NearGather Prototype Design QA

## Evidence

- Source visual truth: `/Users/elizabethbetson/Documents/near-gather/prototype/qa/option-3-wedding-assurance-reference.jpg`
- Implementation screenshot: `/Users/elizabethbetson/Documents/near-gather/prototype/qa/rsvp-canvas-initial-iphone.jpg`
- Post-contribution implementation screenshot: `/Users/elizabethbetson/Documents/near-gather/prototype/qa/rsvp-canvas-reveal-iphone.jpg`
- Responsive implementation screenshot: `/Users/elizabethbetson/Documents/near-gather/prototype/qa/rsvp-canvas-reveal-pixel.jpg`
- Local implementation: `http://127.0.0.1:4197/`
- Browser viewport: `1600 × 1400` CSS px.
- iPhone source and implementation captures: `393 × 852` pixels, matching the measured `393 × 852` CSS-pixel phone screen at device pixel ratio 1. No density resampling was needed.
- Pixel implementation capture: `427 × 952` pixels, matching the measured `427 × 952` CSS-pixel phone screen at device pixel ratio 1.
- State: the initial single-screen canvas before collection, followed by the same canvas after the memory submission reveals guest details. The source assurance capture remains the Option 3 visual-system reference; the canvas intentionally extends that hierarchy into a progressive scroll surface.
- Full-view comparison: the Option 3 source and the initial canvas were opened together in one comparison input; the post-memory iPhone and Pixel captures were then reviewed at matching 1:1 phone-screen scale.
- Focused-region comparison: the complete `393 × 852` and `427 × 952` phone screens were compared at native scale, with special attention to the sticky toolbar, estimate/progress row, age assurance, “Your memory is your yes” composer, guest-details reveal, and keyboard dismissal.

## Findings

- No actionable P0, P1, or P2 visual differences remain.
- The birthday screen intentionally adds guardian-authority assurance and the adult-on-behalf-of-child disclosure. These additions preserve the Option 3 typography, spacing scale, card treatment, palette, and interaction hierarchy while making the child-honoree policy visible before collection.
- The single-screen canvas intentionally replaces route-level progress dots with a compact progress rail and section numbers. The change improves continuity while preserving the same Option 3 visual language.

### Required fidelity surfaces

- Fonts and typography: the serif display heading, sans-serif body/UI text, optical weights, line height, uppercase event label, and wrapping match the existing Option 3 assurance pattern. The longer birthday disclosure remains readable without truncation.
- Spacing and layout rhythm: both iPhone and Pixel retain the same toolbar alignment, page gutters, vertical rhythm, control heights, radii, and CTA placement. The added child-focused controls fit without overlap or clipped required actions.
- Colors and visual tokens: background, ink, muted text, lavender status/disclosure surfaces, borders, and disabled states use the shared prototype tokens with adequate contrast.
- Image quality and asset fidelity: this assurance state contains no new raster illustration or substituted image asset. Runtime-provided device chrome and Radix-supported interface icons remain sharp at 1:1.
- Copy and content: birthday language is event-specific, neutral, adult-managed, and clearly separates the adult contributor from the child honoree. No wedding or baby-shower prompt leaks into the birthday state.
- Accessibility and interaction: semantic checkboxes, labels, disabled-state progression, keyboard behavior, touch targets, visible under-18 exit, and scroll restoration were covered by the acceptance suite. The browser console produced no warnings or errors.

## Comparison history

1. **P1 — inherited route scroll offset**
   - Earlier evidence: forcing the phone screen to `scrollTop = 173` before routing to assurance left the new screen at `173`, clipping the heading and pulling the closed keyboard area toward the viewport.
   - Fix: added a post-render, `state.screen`-keyed scroll reset for the app-owned `[data-phone-screen]` container.
   - Post-fix evidence: route transitions measure `scrollTop = 0`; the keyboard remains closed and below the visible phone viewport. The regression test passes on the full suite.

2. **P2 — toolbar/status-bar overlap**
   - Earlier evidence: the assurance `.topline` began above the overlaid status-bar bottom on iPhone.
   - Fix: added the shared 64px safe-top padding to toolbar-bearing organizer, assurance, contribution, SMS, and guestbook screens.
   - Post-fix evidence: iPhone and Pixel captures show clear separation; measured toolbar top is below status-bar bottom. The dedicated layout regression and full suite pass.

3. **Post-fix visual comparison**
   - The normalized wedding source and birthday implementation were re-captured at `393 × 852` and compared together.
   - The Pixel state was separately captured at `427 × 952` to confirm responsive spacing and content fit.
   - No new P0, P1, or P2 issue was found.

4. **P2 — keyboard remained open during progressive reveal**
   - Earlier evidence: after typing the memory, guest details scrolled into view while the simulated keyboard still occupied the lower phone viewport.
   - Fix: the canvas hides the runtime keyboard at the memory-to-logistics transition, with a regression assertion on `data-visible="false"`.
   - Post-fix evidence: the iPhone reveal capture shows the guest-details section unobstructed; the acceptance test passes.

## Open Questions

- None for the implemented P0 prototype scope.

## Implementation Checklist

- [x] Match the selected Option 3 assurance hierarchy and tokens.
- [x] Keep the birthday-specific authority/disclosure content before collection.
- [x] Verify 1:1 iPhone and Pixel layouts.
- [x] Verify scroll restoration, keyboard state, and safe-area clearance.
- [x] Verify browser console warnings and errors are empty.

## Follow-up Polish

- No P3 visual polish is required before prototype review.

final result: passed
