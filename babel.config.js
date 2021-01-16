// the filename must be babel.config.js to jest automatically pick this config file
// @see https://github.com/facebook/jest/issues/8365#issuecomment-713272521

module.exports = api => {
    const isServer = api.caller(caller => !!caller && caller.isServer);

    return {
        presets: ['next/babel'],
        plugins: [
            'babel-plugin-macros',
            ['babel-plugin-styled-components', { ssr: false }],
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: false }],
            // In contrast to MobX 4/5, "loose" must be false!   ^
            [
                'babel-plugin-import',
                {
                    libraryName: '@material-ui/core',
                    // Use "'libraryDirectory': ''," if your bundler does not support ES modules
                    libraryDirectory: '',
                    camel2DashComponentName: false,
                },
                'core',
            ],
            [
                'babel-plugin-import',
                {
                    libraryName: '@material-ui/icons',
                    // Use "'libraryDirectory': ''," if your bundler does not support ES modules
                    libraryDirectory: '',
                    camel2DashComponentName: false,
                },
                'icons',
            ],
            [
                'babel-plugin-import',
                {
                    libraryName: '@material-ui/styles',
                    // Use "'libraryDirectory': ''," if your bundler does not support ES modules
                    libraryDirectory: '',
                    camel2DashComponentName: false,
                },
                'styles',
            ],
        ],
    };
};
