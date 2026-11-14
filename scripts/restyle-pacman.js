#!/usr/bin/env node
/**
 * Restyles the generated Pac-Man contribution graph to this profile's
 * monochrome night palette. Runs in CI with no dependencies (Node stdlib).
 *
 * Usage: node scripts/restyle-pacman.js <svg-file>
 */
'use strict';
const fs = require('fs');

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/restyle-pacman.js <svg-file>');
  process.exit(1);
}
const isDark = file.includes('dark');
let svg = fs.readFileSync(file, 'utf8');

/* ------------------------------------------------------------------ */
/* 1. Ghost sprites: the generator embeds them as coloured PNG images. */
/*    Replace every sprite with a vector ghost that fits a 20x20 box.  */
/* ------------------------------------------------------------------ */
const ghostBody = (id, body, eye, glint) =>
  `<g id="${id}">` +
  `<path d="M2 20 V10 A8 8 0 0 1 18 10 V20 L15.5 17.6 L13 20 L10.5 17.6 L8 20 L5.5 17.6 L3 20 Z" fill="${body}"/>` +
  `<circle cx="7" cy="10" r="2.6" fill="${eye}"/>` +
  `<circle cx="13" cy="10" r="2.6" fill="${eye}"/>` +
  `<circle cx="7.7" cy="9.3" r="0.9" fill="${glint}"/>` +
  `<circle cx="13.7" cy="9.3" r="0.9" fill="${glint}"/>` +
  `</g>`;

svg = svg.replace(
  /<symbol id="(ghost-[a-z-]+)"[^>]*>\s*<image[^>]*data:image\/png;base64,[A-Za-z0-9+/=]+[^>]*>\s*<\/symbol>/g,
  (match, id) => {
    if (id.startsWith('ghost-eyes')) {
      return `<g id="${id}">` +
        `<circle cx="7" cy="10" r="2.6" fill="#F2F0EC"/>` +
        `<circle cx="13" cy="10" r="2.6" fill="#F2F0EC"/>` +
        `<circle cx="7.9" cy="9.6" r="1.1" fill="#080808"/>` +
        `<circle cx="13.9" cy="9.6" r="1.1" fill="#080808"/>` +
        `</g>`;
    }
    if (id.startsWith('ghost-scared')) {
      return ghostBody(id, '#282828', '#AFAFAF', '#D8D8D8');
    }
    return ghostBody(id, '#AFAFAF', '#080808', '#F2F0EC');
  }
);

/* ------------------------------------------------------------------ */
/* 2. Night background plate behind the whole scene.                   */
/* ------------------------------------------------------------------ */
svg = svg.replace(/<svg(\s[^>]*)?>/, (m, attrs) => `<svg${attrs || ''}><rect width="1166" height="184" fill="#080808"/>`);

/* ------------------------------------------------------------------ */
/* 3. Recolour to the profile's monochrome palette.                    */
/* ------------------------------------------------------------------ */
const map = [
  // empty calendar cells
  ['#ebedf0', '#151515'],
  ['#161b22', '#151515'],
  // contribution levels, darkest -> brightest
  ['#0e4429', '#F2F0EC'],
  ['#216e39', '#D8D8D8'],
  ['#006d32', '#D8D8D8'],
  ['#30a14e', '#AFAFAF'],
  ['#26a641', '#AFAFAF'],
  ['#9be9a8', '#282828'],
  ['#39d353', '#282828'],
  // text
  ['#57606a', '#AFAFAF'],
  ['#8b949e', '#AFAFAF'],
  // stray background from the dark variant
  ['#0d1117', '#080808'],
  // maze walls + light-variant background plate
  ['#000000', '#282828'],
  ['#ffffff', isDark ? '#282828' : '#080808'],
  // pac-man (fill + animation values)
  ['yellow', '#F2F0EC'],
];
for (const [from, to] of map) {
  svg = svg.split(from).join(to);
}
// the "powered" pac-man flash in the animation values; word-bounded so
// ids such as ghost-scared are untouched
svg = svg.replace(/\bred\b/g, '#AFAFAF');

fs.writeFileSync(file, svg);
console.log(`restyled ${file}`);
