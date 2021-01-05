const StyleDictionary = require("style-dictionary").extend({
  source: ["base.json"],
  platforms: {
    scss: {
      transformGroup: "scss",
      buildPath: "build/web/",
      files: [
        {
          destination: "_colors.scss",
          format: "my/custom",
          filter: {
            type: "Colors"
          }
        },
        {
          destination: "_typography.scss",
          format: "scss/variables",
          filter: {
            type: "Typography"
          }
        },
        {
          destination: "_grids.scss",
          format: "scss/variables",
          filter: {
            type: "Grids"
          }
        }
      ],
      actions: ["copy_assets"]
    },
    android: {
      transformGroup: "android",
      buildPath: "build/android/",
      files: [
        {
          destination: "tokens.colors.xml",
          format: "android/colors",
          filter: {
            type: "Colors"
          }
        }
      ],
      actions: ["copy_assets"]
    },
    ios: {
      transformGroup: "ios",
      buildPath: `build/ios/`,
      files: [
        {
          destination: "tokens.h",
          format: "ios/macros"
        }
      ],
      actions: ["copy_assets"]
    }
  }
});

StyleDictionary.registerFormat({
  name: "my/custom",
  formatter: (dictionary) => {
    let result = [];
    let type;
    for (const key in dictionary.properties.Colors) {
      let value = dictionary.properties.Colors[key];
      type = value.type;

      result += `$${value.name}:${value.value},`;
    }

    return `$${type}: (
            ${result}
        )`;
  }
});

StyleDictionary.buildAllPlatforms();

console.log("done!");
