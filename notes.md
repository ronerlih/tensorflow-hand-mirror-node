**push to gh-pages** 


```sh
yarn build
git add . && git commit -m "deploy" 
```

```sh
git subtree push --prefix dist origin gh-pages
```