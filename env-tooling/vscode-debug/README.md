## Step to debug "home-made" bundle.js

### 1. typescript to javascript
```
yarn run tsc src/*.ts --target ES6 --sourceMap true --moduleResolution node
```

### 2. esbuild to out (commonjs)
```
yarn run esbuild-src
```

### 3. make index.html can load "require"

```
yarn run browserify-bundle
```

### 4. host out 

```  
cd out
python -m http.server 7708   (python3)  
python -m SimpleHTTPServer 7708   (python2)  
```

### 5. create index.html in out

```html  
<!DOCTYPE html>
<script src="bundle.js"></script>
</html>
```


