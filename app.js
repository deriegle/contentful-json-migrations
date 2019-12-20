const app = require("./src/index");

app(
  {
    contentTypes: [
      {
        id: "homePage",
        name: "Home Page",
        description: "Basic Page type for Home pages"
      },
      {
        id: "basicPage",
        name: "Basic Page",
        description: "Basic Page"
      }
    ]
  },
  {
    contentTypes: [
      {
        id: "homePage",
        name: "Home Page",
        description:
          "Basic Home page. Does not have all features landing pages do"
      },
      {
        id: "basicPage",
        name: "Basic Page",
        description: "Basic Page"
      },
      {
        id: "landingPage",
        name: "Landing Page",
        description: "Landing Page"
      }
    ]
  }
);
