import assert from 'node:assert/strict';
import fs from 'node:fs';

const layout = fs.readFileSync('app/layout.tsx','utf8');
const tracker = fs.readFileSync('components/trutool-analytics.tsx','utf8');
const cookies = fs.readFileSync('app/cookies/page.tsx','utf8');
const privacy = fs.readFileSync('app/privacy/page.tsx','utf8');

assert.match(layout,/NEXT_PUBLIC_GA4_MEASUREMENT_ID/,'GA4 must require the correct public measurement ID');
assert.match(tracker,/^\s*if \(!\/\^G-\[A-Z0-9\]/m,'Invalid GA4 measurement IDs should disable scripts');
assert.match(tracker,/consent === 'accepted' &&/,'Only consented visitors may load GA4');
assert.match(tracker,/window\.localStorage\.setItem/,'Consent selection must persist');
assert.match(tracker,/Change analytics preferences/,'Users must be able to revoke consent');
assert.match(tracker,/allow_ad_personalization_signals:false/,'Ad personalization must be disabled');
assert.ok(!tracker.includes('send_page_view:false'),'Let GA4 enhanced measurement handle browser navigation; no manual duplicate events');
assert.match(cookies,/Optional website analytics/);
assert.match(privacy,/Google Analytics 4/);
console.log('PASS: GA4 is gated behind a measurement ID and explicit visitor consent; privacy controls and notices are present.');
