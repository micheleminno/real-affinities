switch(process.env.NODE_ENV) {
  case "production":
    module.exports = {
      client: "mysql",
      connection: {
        database: "real-affinities",
        host:     "mysql",
        user:     "production",
        password: "production",
      },
    };
    break;
  default:
    module.exports = {
      client: "mysql",
      connection: {
        database: "real-affinities-test",
        host:     "mysql",
        user:     "development",
        password: "development",
      },
    };
    break;
}
