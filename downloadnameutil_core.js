'use strict';

const path = require('node:path');
const { byteLength, splitStemExt, truncateToBytes } = require('./downloadnamesanitize_core');

const MAX_NAME_BYTES = 240;
const MAX_STEM_BYTES = 200;
const MAX_EXT_BYTES = 24;

function foldName(name) {
  return String(name).normalize('NFC').toLowerCase();
}

function nameBytes(name) {
  return byteLength(String(name));
}

function splitExtension(name) {
  const { stem, ext } = splitStemExt(name);
  if (!ext) return { stem: name, ext: '' };
  if (nameBytes(ext) > MAX_EXT_BYTES) return { stem: name, ext: '' };
  return { stem, ext };
}

function addTakenName(taken, entry) {
  if (typeof entry !== 'string' || entry.length === 0) return;
  taken.add(foldName(entry));
  if (entry.includes('/') || entry.includes('\\')) {
    taken.add(foldName(path.basename(entry)));
  }
}

function normalizeTaken(entries) {
  const taken = new Set();
  if (!entries) return taken;
  if (entries instanceof Set) {
    for (const entry of entries) addTakenName(taken, entry);
    return taken;
  }
  if (Array.isArray(entries)) {
    for (const entry of entries) addTakenName(taken, entry);
    return taken;
  }
  if (typeof entries === 'object') {
    for (const entry of Object.keys(entries)) addTakenName(taken, entry);
  }
  return taken;
}

function buildName(stem, ext, counter) {
  if (counter <= 1) return `${stem}${ext}`;
  return `${stem} (${counter - 1})${ext}`;
}

module.exports = { MAX_NAME_BYTES, MAX_STEM_BYTES, MAX_EXT_BYTES, foldName, nameBytes, splitExtension, truncateToBytes, addTakenName, normalizeTaken, buildName };
