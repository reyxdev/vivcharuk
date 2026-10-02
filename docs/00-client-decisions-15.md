# Client Decisions — Round 15 (pick up a sheep)

Received 2026-09-30. **Highest-authority document** for the points below. The behaviour spec is
[36-motion-interaction-system.md](36-motion-interaction-system.md) §36.3.6; a working demo is in
the hero of the canvas board «Головна · комп'ютер» (Play).

---

## S1 — Fewer sheep

> «Видали 4 овечки… їх забагато.»

The desktop hero flock is **12 sheep** (was 16; four from the back row, the most hidden ones).
Supersedes «15+» in [00-client-decisions-10.md](00-client-decisions-10.md) part 1 answer 4. Phones
keep about 8.

## S2 — Pick up, carry, drop

> «Коли наводишся на овечку і зажимаєш по ній, ти можеш перетягувати її по екрану від трави до
> меню навігації… щоб здавалось, ніби вона висить, а я її зачепив курсором, а коли в повітрі
> відпускаю, вона повільно летить і падає на землю, потім встає з колін… і далі так само слідує
> по траві, як решта овець, за курсором.»

26 questions; every answer is the recommended option (А) except 18 (Б) and 20 (not answered,
recommended option taken).

| # | Question | Decision |
|---|---|---|
| 1 | Starting a drag with a mouse | Press and move more than 4 px lifts the sheep; a plain click still bleats «Бе-е!» (round 11 U13) |
| 2 | Hover | Cursor becomes an open hand; the sheep looks toward the cursor and pricks its ears |
| 3 | Cursor while holding | A Hutsul **гирлига** (shepherd's crook) hooks the sheep by the wool; the system cursor is hidden |
| 4 | Pose in the air | Hangs from the hook by the wool on its back; legs dangle and swing like a pendulum with the movement |
| 5 | Face in the air | Surprised: round eyes, «o» mouth |
| 6 | Sound on pick-up | A short «Ме?» only if the hero sound is on (off by default) |
| 7 | Where it can go | The whole first screen, from the grass up to the navigation bar |
| 8 | Released over the navigation bar | Clings to its lower edge by the front legs, dangles for 2 s, then drops |
| 9 | Released while moving | Carries a little momentum, then floats down; never leaves the screen |
| 10 | Scroll or tab switch while holding | The sheep is let go and falls |
| 11 | Layering | Held: above everything, including the navigation bar. On the grass: below the hero buttons again |
| 12 | The fall | Slow, like down: sways left and right, the wool acts as a parachute; 1.6–2.2 s by height |
| 13 | Where it lands | On the grass under the release point, in its own row; never on text or buttons |
| 14 | Landing | A few grass blades and a tuft of wool fly out |
| 15 | Getting up | Drops to its knees, shakes its head, stands, shakes its wool like a wet dog (~1.3 s) |
| 16 | Afterwards | Walks back to its place in the flock and follows the cursor with the others |
| 17 | The rest of the flock | Lift their heads and watch the sheep in the air |
| 18 | Same sheep thrown 3 times | **Nothing special** (no dizzy stars) |
| 19 | The shepherd | Turns his head and watches; nods when the sheep is back on its feet |
| 20 | Phones and tablets | Press and hold 0.35 s (light vibration where supported), then drag; the page does not scroll meanwhile |
| 21 | Reduced motion | Off; the click-bleat stays |
| 22 | Discovery | Only the open-hand cursor: finding it is the delight. No hint |
| 23 | Analytics | One event «овечку підняли», only with analytics consent |
| 24 | Performance | Loaded after the hero; moves drawing parts only; first feature switched off by the degradation ladder |
| 25 | The shepherd | Cannot be dragged |
| 26 | Canvas | A working demo in the hero of the desktop homepage board |

---

## S3 — A living flock (31 questions, all recommended options except 8)

> «Кожна овечка має бути живою і пастись по-своєму… кожна має підбігати в найближче місце на
> траві до курсору… якщо скупчуються біля пастуха — він ніби втрачає рівновагу… вони не змінюють
> напрямок тіла за курсором — зроби, щоб розверталися плавно.» Also: a lifted sheep snapped behind
> its neighbour when it got back to its place.

| Area | Decision |
|---|---|
| Depth (the fix) | **Whoever stands lower on screen is in front**, re-sorted every frame; the lifted sheep joins that order on landing, so nothing snaps. Size grows smoothly toward the bottom. Sheep walk anywhere on the grass band between the hill and the bottom of the first screen |
| Activities | Graze (head down, tearing grass), chew standing, look around, lie down, shake the wool, scratch, take 2–3 steps, a rare bleat. 3–8 s each, each sheep on its own rhythm; at most two lying at once |
| Characters | Glutton (eats more), curious (first to the cursor), lazy (lies down, arrives last), timid (keeps to the edge), the rest ordinary |
| **Lamb** | **Yes: 1 lamb among the 12**, follows its mother and hops (answer 8 Б) |
| Sound | Only with hero sound on: a random bleat every 20–40 s |
| Idle 60 s | They lie down one by one and fall asleep, «z z» |
| Following | Every sheep runs to the **nearest point on the grass under the cursor** (cursor over the sky → the top edge of the grass), while the cursor is over the first screen |
| The heap | A tight pile at one point: each pushes toward the centre and cannot get through. Rear ones press, front ones give a little and push back; heads reach for the centre; now and then one backs out and tries another side. Partial overlap allowed, never merging (centres at least a third of a width apart) |
| Speed | By character, 120–220 px/s, a bouncy run |
| Settling | After 3 s over the heap some start grazing there; the rest keep pushing. Cursor leaves the first screen → they spread slowly and graze where they are |
| Lifted sheep | After getting up, runs to the heap under the cursor (or grazes nearby) — not to its old place |
| Turning | Smooth, 0.4 s: head first, then the body through a narrow front-view frame; only when the target is more than 40 px on the other side; heads track the cursor ±25° |
| Shepherd knocked over | 4+ sheep pressed against him for 0.5 s → he wobbles, waves his arms, leans on the staff; 2 s more → falls on his back, legs up; gets up, dusts off his кептар, straightens his кресаня; then waves the staff and the sheep scatter for a second. He stands still otherwise; sheep flow around him, never through |
| Phone | 8 sheep; run to the tap point; lifting by a 0.35 s hold |
| Weak device | Pushing switches off first, then activities; running and lifting stay |
| Reduced motion | Static grazing poses, no running |
| Canvas | The demo is rebuilt with all of the above |

---

## S4 — Carry the shepherd by his кресаня (23 questions)

> «Я наводжусь на кресаню, забираю її з його голови; якщо починаю рухати мишкою, він зразу
> пригає і ловиться руками за кресаню, і я тримаю кресаню і його, який за неї тримається в
> повітрі, і теж з інерцією.» Replaces an earlier idea (hat taken, shepherd chases it), whose
> questionnaire was withdrawn unanswered.

All recommended options except **4 Б** (cursor is a closed hand, not the crook) and **9 Б** (the
hat sits exactly under the cursor, no weight lag).

| # | Question | Decision |
|---|---|---|
| 1 | Start | Hover the кресаня → open hand; press and move more than 4 px → the hat lifts off, the shepherd instantly jumps and grabs it with both hands |
| 2 | Plain click on the hat | He holds it down with his hand and frowns |
| 3 | Reaction | Immediate, 0.15 s: «Ой!» and the jump |
| 4 | Cursor | **Closed hand** |
| 5 | His staff | Falls on the grass where he stood; he picks it up on the way back |
| 6 | Pose | Both hands on the brim, body hanging, legs kicking as if trying to climb |
| 7 | Face | Tousled hair, clenched teeth, determined look |
| 8 | Inertia | Heavier than a sheep: slower, wider swing; legs lag the body |
| 9 | Weight on the cursor | **The hat is exactly under the cursor** |
| 10 | Lines | «Віддай!» once, «Ой-ой!» on sharp moves; sound only if switched on |
| 11 | Range | The whole first screen, up to the navigation bar |
| 12 | Released in the air | Falls holding the hat like a parachute, faster than a sheep (1–1.4 s); lands in a crouch, puts the hat on, straightens it, shakes his fist at the cursor in jest |
| 13 | Thrown | Carries a little momentum, stays on screen |
| 14 | Released over the navigation bar | Hangs from its edge by one hand, hat in the other; dangles 2 s and jumps down |
| 15 | Landing | Crouch; grass and dust fly |
| 16 | Afterwards | Walks back to his place, straightening the hat, and picks up the staff |
| 17 | The flock | Looks up; the lamb and the curious sheep run under him; they make room when he lands |
| 18 | Knocked down by the flock | He can still be lifted — grabs the hat lying down and flies up |
| 19 | Limit | After 3 lifts in a row he holds the hat with his hand for 5 s and will not let go |
| 20 | Layering | In the air above everything; on the grass by the flock's depth rule |
| 21 | Phone | Hold the hat 0.35 s, then drag |
| 22 | Reduced motion | Off |
| 23 | Canvas | In the demo together with the new flock |

**Supersedes S3 «he stands still otherwise»** only for this sequence: he leaves his place while
carried and walks back after.
