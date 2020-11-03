module.exports = () => ({
  '/login': require('./authorization/login')(),
});
