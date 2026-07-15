// Required for babel-jest (jest-expo). Metro used Expo's default preset before
// this file existed; babel-preset-expo still reads the reactCompiler experiment
// from app.config.js. If the React Compiler transform is dropped in Metro
// builds, pass it explicitly: ['babel-preset-expo', { 'react-compiler': true }].
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
