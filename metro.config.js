// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure node_modules are properly excluded from type processing
config.resolver.sourceExts.push('cjs');

module.exports = config;

