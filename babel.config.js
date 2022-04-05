module.exports = {
  presets: [
    [
      '@babel/preset-env'
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic'
      }
    ]
  ],

  plugins: [
    [
      '@babel/plugin-transform-runtime' // without cover the global name space or prototype function for pollify
      // {
      //   'modules': false,
      //   'corejs': 3,
      //   'proposals': true
      // }
    ],
    ['@babel/plugin-proposal-object-rest-spread'], // for object rest or destruction
    ['@babel/plugin-proposal-decorators', { legacy: true }], // for decorators
    ['@babel/plugin-transform-spread', { loose: true }], // for Array rest or destruction
    '@babel/plugin-syntax-dynamic-import', // for module lazy load
    ['@babel/plugin-proposal-class-properties', { loose: false }] // for mobx
  ],

  'assumptions': {
    'setPublicClassFields': false
  },

  env: {
    test: {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          }
        }]
      ]
    },
    development: {},
    mock: {}
  }
}
