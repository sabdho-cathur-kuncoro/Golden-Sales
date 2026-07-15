// SVGs are imported as components via react-native-svg-transformer (metro.config.js).
// Under jest, map them to a trivial stub component.
const React = require('react');
module.exports = React.forwardRef((props, ref) =>
  React.createElement('Svg', { ...props, ref })
);
module.exports.ReactComponent = module.exports;
module.exports.default = module.exports;
