## Step to debug "home-made" bundle.js

### 1. typescript to javascript
```
yarn run tsc-src
```

### 2. esbuild to out (commonjs)
```
yarn run esbuild-src
```

### 3. make index.html can load "require"

```
yarn run browserify-bundle
```


