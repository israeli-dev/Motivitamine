import express from 'express';
import { fileURLToPath } from 'node:url';
import { createApp } from '../../dist-server/server/app.js';

const app = createApp({
  perIpLimit: 100,
  generate: async ({ occupation, hobbies, previousQuote }) => {
    if (occupation === 'Unavailable example') throw new Error('Mock provider failure');
    return {
      quote: previousQuote ? `The patience you bring to ${hobbies} is the quiet strength behind your work as a ${occupation}.`
        : `What you learn from ${hobbies} lets you see your work as a ${occupation} in a kinder light.`,
      reflection: 'These interests reward the same curiosity and patience.',
      themeTag: 'Shared Patience',
      recommendedMood: 'zen',
    };
  },
});
app.use(express.static(fileURLToPath(new URL('../../dist', import.meta.url))));
app.listen(4173, '0.0.0.0');
