# verificador-associacao-service

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/376c5ebad7814492b308fef77cd7b423)](https://app.codacy.com/gh/IRegiani/verificador-associacao-service?utm_source=github.com&utm_medium=referral&utm_content=IRegiani/verificador-associacao-service&utm_campaign=Badge_Grade)
![Code Coverage](https://img.shields.io/codacy/coverage/376c5ebad7814492b308fef77cd7b423)
![GitHub pull requests](https://img.shields.io/github/issues-pr/IRegiani/verificador-associacao-service)
![GitHub package.json version](https://img.shields.io/github/package-json/v/IRegiani/verificador-associacao-service)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/IRegiani/verificador-associacao-service)
[![CircleCI](https://circleci.com/gh/IRegiani/verificador-associacao-service.svg?style=shield)](https://circleci.com/gh/circleci/circleci-docs)

## How to develop

### Running locally for the first time

 1. After cloning, run `npm ci`
 2. Run `npm run db:local`, to start the database and its UI runs at [http://localhost:5001](http://localhost:5001)
 3. Run `npm run local`, to start the service at [http://localhost:4000](http://localhost:4000)

### Developing a feature

 1. After agreeing with the others collaborators which task you are going to do, goto the **main** branch
 2. Create a new branch and do your work there
 3. Upon finishing don't forget Unit Tests and Integration Tests. To test, run `npm run review`. If it fails, you must fix them in order to proceed
 4. If everything is ok, open a new Pull Request to **development**. Your PR is going to be blocked if the previous step is failing

#### Client available [here](https://github.com/IRegiani/verificador-associacao)
