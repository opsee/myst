![myst](http://static.giantbomb.com/uploads/original/8/81005/2350184-main_myst.jpg)

# myst
[![Circle CI](https://circleci.com/gh/opsee/myst.svg?style=shield&circle-token=6d1df2c870a7f1660f7a1b8eb7baf5a617276bd7)](https://circleci.com/gh/opsee/myst) [![Docker Repository on Quay](https://quay.io/repository/opsee/myst/status?token=a7125fae-9c0f-489c-86c5-69418d8efe71 "Docker Repository on Quay")](https://quay.io/repository/opsee/myst)

An API for muxing analytics data. Broadcasts events, user updates, page views, and the like to multiple channels: Google Analytics, Intercom, and Launch Darkly.

### API
The API is well documented in [server.js](https://github.com/opsee/myst/blob/HEAD/server.js).

### Local development
You can start the devserver with `npm run start` (or `nodemon server.js`). Run tests with `npm run test`, which includes linting.

#### Environment variables
This service uses a few environment variables for secrets, which can be a pain
for local development. Instead, it's recommended to create a local config file.
Mappings from environment variable name to config key can be found in
`config/custom-environment-variables.json` -- these are the things you'll likely
want to add to your local config.

By default, `config/local.json` is ignored by git and safe for holding secrets -- if you name yours something
else, please make sure it doesn't get commited!

### Deployment
Deployment is done via the [`compute`](github.com/opsee/compute) repo: `./run deploy production myst`.

To build the image locally, use `npm run docker-build`. To run it locally, use `npm run docker-run`. To manually build and publish the Docker image to [quay.io](https://quay.io/repository/opsee/myst), use `npm run docker-publish`.
