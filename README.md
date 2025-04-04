# aem-sites-ax-eds

This demo project leverages Edge Delivery Services (EDS) with Adobe Experience Manager (AEM) and a Universal Editor to provide a robust and scalable content delivery solution. It enables seamless content management and efficient content distribution through a modern, cloud-native approach.

## Environments

- **Preview:** [https://main--aem-sites-ax-eds--dmisailidis.aem.page/](https://main--aem-sites-ax-eds--dmisailidis.aem.page/)
- **Live:** [https://main--aem-sites-ax-eds--dmisailidis.aem.live/](https://main--aem-sites-ax-eds--dmisailidis.aem.live/)

## Installation

To install the necessary dependencies, run:

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
2. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
3. Open the `{repo}` directory in your favorite IDE and start coding :)


## Jest Unit Tests

1. Run `npm i` from project root if you need to install Jest dependencies
2. Add test file under each block folder with name {component-name}.test.js
3. Run `npm test` from project root to execute Test Suite
