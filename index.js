
const [fetch, fs, utils, environment] = [
  require("node-fetch"),
  require("fs"),
  require("./utils"),
  require("./environment")
];

utils.printMessage("Iniciando creación archivo json de los design token");

const jsonStyleDictionary = {
  color: {},
  typography: {},
  breakpoints: {}
};

const tokensType = {
  color: 'color',
  grid: 'grid',
  typography: 'typography',
}

const file = 'config.json';

async function generateJson() {
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

  const getFrame = (filter) =>
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
    fs.mkdirSync('assets/fonts/icomoon',{recursive: true}, ()=> true);
    fs.rm("assets/icons/", { recursive: true, force: true }, () => true);
    const init = getFrame("Icons");
    init[0].children.map(async (icons, i) => {
      let svg = await fetch(
        `https://api.figma.com/v1/images/${environment.dev.figmaId}/?ids=${icons.children[0].id}&format=svg`,
        {
          method: "GET",
          headers: {
            "X-Figma-Token": environment.dev.apiKey
          }
        }
      );
      await svg
        .json()
        .then(async (elem) => {
          let icon = await fetch(Object.values(elem.images)).then((elem) =>
            elem.text()
          );
          utils.createFile("assets/icons", `${icons.name}.svg`, icon);
        })
        .catch((e) => console.error("Ha ocurrido el siguiente error", e))
        .finally(() =>
          console.log(
            `Importado svg ${icons.name} en la ruta ${__dirname}/assets/icons/${icons.name}`
          )
        );
    });
  })();

  const getColors = () => {
    const init = getFrame("Colors");
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
              type: tokensType.color
            }
          };
          Object.assign(colors, color);
        }
      });
    });
    return colors;
  };
  const getGrid = () => {
    const init = getFrame("Grid");
    let breakpoints = {};
    init[0].children.reverse().map(layout => {
      grid = {
        [layout.name]:{
          gutter: {
            value: `${layout.layoutGrids[0].gutterSize}px`,
            type: tokensType.grid
          },
          offset: {
            value: `${layout.layoutGrids[0].offset}px`,
            type: tokensType.grid
          },
          columns: {
            value: layout.layoutGrids[0].count,
            type: tokensType.grid
          },
          width: {
            value: `${layout.absoluteBoundingBox.width}px`,
            type: tokensType.grid
          }
        }
      }

      Object.assign(breakpoints, grid);

    })

    return breakpoints;
  };
  const getFonts = () => {
    const init = getFrame("Typography");
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
                type: tokensType.typography
              },
              size: {
                value: `${text.style.fontSize}px`,
                type: tokensType.typography
              },
              weight: {
                value: text.style.fontWeight,
                type: tokensType.typography
              }
            }
          };
          Object.assign(fontStyles, font);
        }
      });
    });
    return fontStyles;
  };

  Object.assign(jsonStyleDictionary.color, getColors());
  Object.assign(jsonStyleDictionary.breakpoints, getGrid());
  Object.assign(jsonStyleDictionary.typography, getFonts());

  utils.createFile(
    __dirname,
    file,
    JSON.stringify(jsonStyleDictionary, null, 2)
  );
}

if(environment.dev.apiKey?.length > 1 && typeof environment.dev['apiKey' && 'figmaId'] === 'string'){
  generateJson()
  .catch((e) => console.error("Ha ocurrido un error",e))
  .finally(() => {
    console.log(`El archivo json ha sido creado en la ruta ${__dirname}/${file}`);
    utils.printMessage("Finalizando creación archivo json de los design token");
  });
}else {
  console.error('Revisa por favor el archivo de configuración:');
  console.error(JSON.stringify(environment.dev,null,2));
}
