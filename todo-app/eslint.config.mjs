import globals from "globals";
import pluginJs from "@eslint/js";
import jest from "eslint-plugin-jest";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.browser,
        jest: true,
        describe: true,
        it: true,
        expect: true,
        beforeEach: true,
      },
    },
  },

  // Apply recommended JavaScript linting rules
  pluginJs.configs.recommended,
];
