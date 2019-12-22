const app = require("./src/index");

app(
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
            name: "Header Copy",
            type: "Text",
            required: false
          }
        ]
      }
    ]
  }
);
