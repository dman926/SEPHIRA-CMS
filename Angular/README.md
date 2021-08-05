# Angular Starter

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.1.

## Installation

Run `npm install` in this directory to install all required packages.

## Development server

Run `npm run dev:ssr` for an express server that supports server-side rendering. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `npm run build:ssr:production` to build the project. The build artifacts will be stored in the `dist/` directory. Upload the entirety of the `dist/` folder to the production server as the angular universal server is looking for it.

## Production server

Install the `pm2` node package and use the included `pm2.service` file to run it on startup. Refer to the included NGINX configs for proxy_pass information