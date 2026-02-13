module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            // specialized for reanimated if needed, often included in expo-router/babel or babel-preset-expo
            "react-native-reanimated/plugin",
        ],
    };
};
