cp 404.html 'dist'
cd dist
git init 
git add -A
git commit -m 'test: deploy'
git push -f https://github.com/howie12207/task.git master:gh-pages