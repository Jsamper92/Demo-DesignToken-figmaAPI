const [fetch, fs, utils, environment] = [
  require("node-fetch"),
  require("fs"),
  require("./utils"),
  require("./environment")
];

utils.printMessage("Iniciando creación archivo json de los design token");

const jsonStyleDictionary = {
  Colors: {},
  Typography: {},
  Grids: {}
};

(async () => {
  let fileFigma = await fetch(
    "https://api.figma.com/v1/files/" + environment.dev.figmaId,
    {
      method: "GET",
      headers: {
        "X-Figma-Token": environment.dev.apiKey
      }
    }
  );

  let figmaTreeStructure = await fileFigma.json();

  const stylesArtboard = (filter) =>
    figmaTreeStructure.document.children.map((item) => {
      let styles = {};
      item.children.filter((item) => {
        if (item.name === filter) {
          styles = item;
        }
      });
      return styles;
    });

  (() => {
    fs.rm("assets", { recursive: true, force: true }, () => true);
    const init = stylesArtboard("Icons");
    init[0].children.map(async (icons,i) => {
      let svg = await fetch(
        `https://api.figma.com/v1/images/${environment.dev.figmaId}/?ids=${icons.children[0].id}&format=svg`,
        {
          method: "GET",
          headers: {
            "X-Figma-Token": environment.dev.apiKey
          }
        }
      )
      await svg
        .json()
        .then(async (elem) => {
          let icon = await fetch(Object.values(elem.images)).then((elem) =>
            elem.text()
          );
          utils.createFile("assets", `${icons.name}.svg`, icon);
        })
        .catch((e) => console.error("Ha ocurrido el siguiente error", e))
        .finally(() =>
          console.log(
            `Importado svg ${icons.name} en la ruta ${__dirname}/assets/${icons.name}`
          )
        );
    });
  })();

  const getColors = () => {
    const init = stylesArtboard("Colors");
    let colors = {};
    init[0].children.map((item) => {
      item.children.map((elem) => {
        const rbaObj = (item) => elem.fills[0].color[item] * 255;
        if (elem.type === "RECTANGLE") {
          color = {
            [elem.name]: {
              value: `rgba(${rbaObj("r")}, ${rbaObj("g")}, ${rbaObj("b")}, ${
                elem.fills[0].color["a"]
              })`,
              type: "Colors"
            }
          };
          Object.assign(colors, color);
        }
      });
    });
    return colors;
  };
  const getGrid = () => {
    const init = stylesArtboard("Grid");
    let grid = {};
    grid = {
      gutter: {
        value: init[0].layoutGrids[0].gutterSize,
        type: "Grids"
      },
      offset: {
        value: init[0].layoutGrids[0].offset,
        type: "Grids"
      },
      columns: {
        value: init[0].layoutGrids[0].count,
        type: "Grids"
      },
      width: {
        value: init[0].absoluteBoundingBox.width,
        type: "Grids"
      }
    };
    return grid;
  };
  const getFonts = () => {
    const init = stylesArtboard("Typography");
    const textStyles = () => {
      let text = [];
      for (const key in figmaTreeStructure.styles) {
        value = figmaTreeStructure.styles[key];
        if (value.styleType === "TEXT") {
          item = {
            type: value.styleType,
            name: value.name
          };
          text.push(item);
        }
      }
      return text;
    };
    const fontsId = textStyles();
    let fontStyles = {};
    init[0].children.map((text) => {
      fontsId.map((item) => {
        if (text.name === item.name) {
          font = {
            [text.name]: {
              family: {
                value: text.style.fontFamily,
                type: "Typography"
              },
              size: {
                value: `${text.style.fontSize}px`,
                type: "Typography"
              },
              weight: {
                value: text.style.fontWeight,
                type: "Typography"
              }
            }
          };
          Object.assign(fontStyles, font);
        }
      });
    });
    return fontStyles;
  };

  Object.assign(jsonStyleDictionary.Colors, getColors());
  Object.assign(jsonStyleDictionary.Grids, getGrid());
  Object.assign(jsonStyleDictionary.Typography, getFonts());

  utils.createFile(
    __dirname,
    "base.json",
    JSON.stringify(jsonStyleDictionary, null, 2)
  );
})()
  .catch((e) => console.error("Ha ocurrido un error", e))
  .finally(() => {
    console.log("El archivo json ha sido creado");
    utils.printMessage("Finalizando creación archivo json de los design token");
  });
