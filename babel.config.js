module.exports = {
  targets: {
    node: `12.0.0`,
  },
  presets: [
    [`@babel/preset-env`, {modules: `commonjs`}],
    `@babel/preset-typescript`,
    `@babel/preset-react`,
  ],
  ignore: [
    `**/*.d.ts`,
    `packages/yarnpkg-libzip/sources/libzip.js`,
  ],
};
