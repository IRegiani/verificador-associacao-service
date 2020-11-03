// const config = require('config');

module.exports = () => {
  const swaggerDocumentation = {
    openapi: '3.0.2',
    info: {
      title: 'Verificador Associação Service',
      description: '',
      version: '1.0.0',
    },
    // servers: {},
    // security
    paths: require('./paths')(),
  };

  return swaggerDocumentation;
};
