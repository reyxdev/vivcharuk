// Round 24 G027: the hero art (art/hero.svg, ~620 KB) is no longer written into the HTML. It is split into
// five layers (art/split-hero.mjs), each a hashed, long-cached file. The page paints them as pictures;
// the live layers (hut, front; the firs on narrow screens) are then fetched again from the cache and
// placed inline, because the flock engine reads and moves their shapes.
import back from './art/hero-back.svg?url';
import hut from './art/hero-hut.svg?url';
import grass from './art/hero-grass.svg?url';
import firs from './art/hero-firs.svg?url';
import front from './art/hero-front.svg?url';

export const heroLayers = { back, hut, grass, firs, front };
