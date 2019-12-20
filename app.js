const app = require("./src/index");

app(
  {
    contentTypes: []
  },
  {
    contentTypes: [
      {
        id: "homePage",
        name: "Home Page",
        description: "Basic Page type for Home pages",
        fields: [
          {
            id: "headerText",
            name: "Header Text",
            type: "Symbol",
            required: true
          }
        ]
      }
    ]
  }
);
