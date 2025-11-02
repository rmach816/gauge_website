module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }],
      // Note: react-native-reanimated/plugin is automatically handled by babel-preset-expo in SDK 54
      // Do NOT add it manually here
    ],
  };
};

