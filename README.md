## SingaporeJS Website

Custom site for SingaporeJS Meetup.

## Instructions

[Bug reports, ideas and pull requests welcome.](https://github.com/SingaporeJS/singaporejs.github.io/issues)

### Developing

```bash
git clone git@github.com:SingaporeJS/singaporejs.github.io.git
cd singaporejs.github.io
npm install
npm start
```

### Deploy

```bash
npm install -g http-server # If you haven't already. For testing build.
npm run build # creates production build in ./build directory
cd build && http-server # test the build works by going to: http://localhost:8080
git add --force --all build # add ./build changes to repo. ./build is ignored by default hence --force --all.
git commit -m "[build] Update build."
npm run deploy # Pushes the build dir as master branch to github via scripts/deploy.sh. 
```

## License

ISC