# Client decisions — round 23: smooth scroll on the site (2026-10-02)

Answers given in the session on 2026-10-02 to 30 questions about «плавний скрол, щоб відчувався
преміально, але тільки для сайту, не для панелі». Codes S01–S30 follow the question numbers. They
override round 11 where they differ: round 11 #56 and docs/36 §36.12 forbade scroll-jacking and new
animation libraries; an inertial wheel scroll is now wanted, with Lenis as the one exception.

## What is smoothed

- **S01** The mouse wheel gets an inertial, smoothed scroll (Lenis-style), not only the jumps.
- **S02** Strength 4 of 5. **S20** The glide after the wheel stops is short.
- **S03** Library: Lenis (MIT, ~3 KB gzipped). The only new motion library.
- **S04** Phones and tablets keep their own scroll. **S05** Laptop touchpads keep their own scroll.
- **S06** Off entirely under «reduce motion». **S07** Off on weak devices and with Save-Data.
- **S08** The keyboard (Space, Page Up/Down, Home/End, arrows) glides too.
- **S26** Every page of the site. The admin panel never gets it.

## Jumps and navigation

- **S09** «Нагору» and in-page jumps take about 1 s.
- **S10** A new page starts at the top at once. **S11** Browser «Назад» returns to the old place at once.
- **S27** Loading more products in the catalogue never makes the page jump.
- **S28** Links to a place on the same page glide there, leaving room under the sticky header.

## Effects tied to scrolling

- **S12** The hero parallax stays as it is (≤ 120 px), only smoother. **S13** No parallax outside the hero.
- **S14** The production thread follows the smooth scroll as it is.
- **S15** The production page with pinned media is smoothed too.
- **S21** Section reveals stay as they are (560 ms rise).
- **S22** No reading-progress thread (unchanged from round 11 U11).
- **S23** Header unchanged: always visible, a thin shadow after 8 px.
- **S24** A scroll cue in the hero: a red wool thread that draws itself downward under the buttons; it
  fades once the page moves. Tapping it glides past the hero.
- **S25** Free scrolling, no section-by-section snapping.

## Interactions

- **S16** While a sheep or the hutsul's hat is held, the page does not scroll.
- **S17** Inside dialogs (cart, filters, menus, search) the scroll stays native.
- **S18** While a dialog is open the page under it stands still.
- **S19** Carousels stay as they are: follow the finger and snap.

## Checking

- **S29** The developer builds it; the client looks at it locally and says stronger or weaker.

S30 was left unanswered.
