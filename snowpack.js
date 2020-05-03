const REACT_IS_SNIPPET = "import { isValidElementType } from 'react-is';";
const DETAILS_POLYFILL_SNIPPET = `if (typeof window !== 'undefined') {
  require('details-element-polyfill');
}`;

function primerWorkaround() {
  return {
    name: "react-is-workaround",

    transform(code) {
      let newCode = code;
      if (code.includes(REACT_IS_SNIPPET)) {
        newCode = code.replace(
          REACT_IS_SNIPPET,
          "import * as ReactIs from 'react-is';\nconst { isValidElementType } = ReactIs;"
        );
      }

      if (code.includes(DETAILS_POLYFILL_SNIPPET)) {
        newCode = newCode.replace(DETAILS_POLYFILL_SNIPPET, "");
      }

      return newCode;
    },
  };
}

module.exports = {
  rollup: {
    plugins: [primerWorkaround()],
  },
  installOptions: {
    dest: "public/web_modules",
  },
};
