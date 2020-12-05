import { readFileSync, writeFileSync } from 'fs';
import postcss from 'postcss';

const autoprefixer = require('autoprefixer');

export const addPrefixesToCss = () => {
  const css = readFileSync('dist/styles.css');

  postcss(autoprefixer)
    .process(css, { from: 'dist/styles.css' })
    .then((result: any) => {
      writeFileSync('dist/styles.css', result.css);
    })
    .catch((error: any) => console.log(error));
};
