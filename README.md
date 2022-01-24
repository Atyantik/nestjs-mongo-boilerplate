# NestJS Barebone  

The starter repo for most of the enterprise projects. 

## Description  
This repository is built on top of NestJS framework TypeScript starter repository.
[https://github.com/nestjs/nest](https://github.com/nestjs/nest)

## Basic Coverage
 - Emailing with [Nodemailer](https://github.com/nodemailer/nodemailer)
 - Email validation with [deep-email-validator](https://github.com/mfbx9da4/deep-email-validator) and [Zerobounce](https://www.zerobounce.net/)
 - Minimal email templating with [HandlerbarJS](https://github.com/handlebars-lang/handlebars.js/)
 - SMTP Integration 
 - Media & file management with Digital Ocean Spaces / S3 buckets
 - Basic MongoDB with Mongoose
 - Keycloak authentication
 - MongoDB, Redis and/or Memory Caching
 - Dockerfile for deployment
 - Puppeteer for `html-to-pdf` 

## Before Starting
 1. Clone the repo
 2. Remove the .git folder and git init with relevant steps
 3. Set up env variables from [.example.env](.example.env)
 4. Setup SSLs, basic instruction in [ssl/README.md](ssl/README.md)
 5. Create Setup 

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project, and so is this repository.

## Stay in touch

- Author - [Atyantik Technologies](https://www.atyantik.com)
- NestJS Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@atyantik_tech](https://twitter.com/atyantik_tech)

## License
[MIT licensed](LICENSE).
