/** @format */
module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxImportSource: "nativewind",
        },
      ],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],

          alias: {
            "@": "./",
            "tailwind.config": "./tailwind.config.js",
          },
        },
      ],
      ['module:react-native-dotenv', {
        moduleName: '@env', // 导入时的模块名
        path: '.env', // 默认环境变量文件
        allowUndefined: false, // 不允许未定义的变量
      }],
      "react-native-reanimated/plugin",
    ],
  };
};
