let fs = require('fs');
let path = require('path');

const buildOptions = {
  tsOptions: {
    types: [],
    noUnusedLocals: false,
    lib: ['ES2019', 'dom', 'scripthost'],
    allowSyntheticDefaultImports: true,
    jsx: 'react',
    target: 'es2018',
  },
};

async function readPackages() {
  const yarnWorkspacesListOutput = require('child_process')
    .execSync(`yarn workspaces info`)
    .toString();
  let result = await Promise.all(
    Object.values(JSON.parse(yarnWorkspacesListOutput)).map(async (r) => {
      const _path = path.join(
        path.resolve(__dirname, r.location),
        'package.json',
      );

      const file = fs.readFileSync(_path, 'utf-8');
      const packageJSON = JSON.parse(file);

      return { ...r, packageJSON };
    }),
  );

  return result;
}

let projectDir = __dirname;

function joinP(...args) {
  return path.join(projectDir, ...args);
}

function mainFile(pkg) {
  let index = joinP(pkg, 'src', 'index.ts');

  if (fs.existsSync(index)) {
    return index;
  }
  throw new Error("Couldn't find a main file for " + pkg);
}

async function build() {
  console.info('Building...');
  let t0 = Date.now();

  const list = (await readPackages()).filter((r) => {
    return !r.packageJSON.private;
  });
  // await require('buildtool-bangle').watch(
  //   list.map((obj) => {
  //     return mainFile(obj.location);
  //   }),
  //   [],
  //   {
  //     ...buildOptions,
  //     include: ['**/src/**/*'],
  //   },
  // );
  await require('buildtool-bangle').build(
    list.map((obj) => {
      console.log('Working on', obj.location);
      return mainFile(obj.location);
    }),
    buildOptions,
  );

  console.info(`Done in ${((Date.now() - t0) / 1000).toFixed(2)}s`);
}

build();
