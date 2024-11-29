module.exports = function override(config, env) {
    // Add extensions to Webpack's resolver
    config.resolve.extensions = [...config.resolve.extensions, '.js', '.jsx', '.ts', '.tsx'];

    return config;
};
