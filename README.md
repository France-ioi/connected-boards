# Connected boards


## Dev

Install dependencies:
```
yarn
```

Develop on the project:
```
yarn dev
```

This will watch the source files and recompile the project everytime a file changes.
The output files are in the `dist` folder.

Advice: you can make a symlink between this dist file and the 
SVN path `_common/modules/pemFioi/connected-boards/` to make it
easier to test this lib on the SVN.

## Build

```
yarn build
```

The output files are in the `dist` folder.
Then just copy/paste then to bebras-modules
in the folder `pemFioi/connected-boards/`.