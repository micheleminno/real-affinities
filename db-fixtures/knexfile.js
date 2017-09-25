module.exports = {
  development: {
    client: "mysql",
    connection: {
      database: "real-affinities-test",
      host:     "mysql",
      user:     "development",
      password: "development"
    },
  },
  production: {
    client: "mysql",
    connection: {
      database: "real-affinities",
      host:     "mysql",
      user:     "production",
      password: "production"
    },
  },
};
