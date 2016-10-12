## SingaporeJS Website

Custom site for SingaporeJS Meetup.

[![image](https://cloud.githubusercontent.com/assets/43438/19329915/cab3ccec-910d-11e6-83ed-8dcfa24211ba.png)](https://singaporejs.github.io)

## Instructions

[Bug reports, ideas and pull requests welcome.](https://github.com/SingaporeJS/singaporejs.github.io/issues)

### Developing

```bash
git clone git@github.com:SingaporeJS/singaporejs.github.io.git
cd singaporejs.github.io
npm install
npm start # starts a development server on http://localhost:3000
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
