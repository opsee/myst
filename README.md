# analytics
A proxy for customer tracking, to get around adblockers

### Local development
This service uses a few environment variables for secrets, which can be a pain
for local development. Instead, it's recommended to create a local config file.
Mappings from environment variable name to config key can be found in
`config/custom-environment-variables.json` -- these are the things you'll likely
want to add to your local config.

By default, `config/local.json` is ignored by git -- if you name yours something
else, please make sure it doesn't get commited!
