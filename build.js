const StyleDictionary = require("style-dictionary").extend({
  source: ["config.json"],
  platforms: {
    scss: {
      transformGroup: "scss",
      buildPath: "dist/web/",
      files: [
        {
          destination: "_colors.scss",
          format: "scss/variables",
          filter: {
            type: "color"
          }
        },
        {
          destination: "_typography.scss",
          format: "scss/variables",
          filter: {
            type: "typography"
          }
        },
        {
          destination: "_grid.scss",
          format: "custom/breakpoints",
          filter: {
            type: "grid"
          }
        }
      ],
      actions: ["copy_assets"]
    },
    android: {
      transformGroup: "android",
      buildPath: "dist/android/",
      files: [
        {
          destination: "tokens.colors.xml",
          format: "android/colors"
        }
      ],
      actions: ["copy_assets"]
    },
    ios: {
      transformGroup: "ios",
      buildPath: `dist/ios/`,
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

StyleDictionary.registerFormat({
  name: "custom/breakpoints",
  formatter: (dictionary) => {
    let result = [];
    console.log(dictionary.properties)
    for (const key in dictionary.properties.breakpoints) {
      let value = dictionary.properties.breakpoints[key];
      layout = value.gutter.attributes.type;
      const [gutter, offset, columns, width] = [
        value.gutter,
        value.offset,
        value.columns,
        value.width
      ];
      result += `${layout}:(
        ${gutter.path[2]}:${gutter.value},
        ${offset.path[2]}:${offset.value},
        ${columns.path[2]}:${columns.value},
        ${width.path[2]}:${width.value}
      ),`;
    }

    return `$breakpoints: (
            ${result}
        )`;
  }
});

StyleDictionary.buildAllPlatforms();

console.log("done!");
