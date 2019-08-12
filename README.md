# dex-react

# Setup for Apollo GraphQL + Typescript + React


## Automatically Fixing Code in VS Code
To run `eslint --fix` on save add to the settings.json file:

```
"eslint.autoFixOnSave":  true,
"eslint.validate":  [
  "javascript",
  "javascriptreact",
  {"language":  "typescript",  "autoFix":  true  },
  {"language":  "typescriptreact",  "autoFix":  true  }
]
```

# Running the app

```
npm install
npm start
```
