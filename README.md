# Mint Model Catalog Explorer [![Build Status](https://travis-ci.org/mintproject/model-catalog-explorer.svg?branch=master)](https://travis-ci.org/mintproject/model-catalog-explorer)

An standalone version of the MINT Model Catalog.

https://models.mint.isi.edu

## INSTALL
```
yarn install
```

You will need to set the configuration for firebase through enviroment variables:
```
export FIREBASE_API_KEY=
export FIREBASE_AUTH_DOMAIN=
export FIREBASE_DATABASE_URL=
export FIREBASE_PROJECT_ID=
export FIREBASE_STORAGE_BUCKET=
export FIREBASE_MESSAGING_SENDER_ID=
export FIREBASE_APP_ID=
export GOOGLE_MAPS_API_KEY=
```

If you want to add new variables, please check `webpack/base.config.ts`

## BUILDING

To create the production build use:
```
yarn create-build
```

You can start the development server with:
```
yarn start
```

Or build the development version with:
```
yarn create-build-dev
```
