module.exports = {
  presets: [
    ['@babel/preset-env', { useBuiltIns: 'entry', corejs: 3, targets: { ie: 9 } }]
  ]
}
