const diff = require("../index");

const contentfulExport = {
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
};

const localContent = {
  contentTypes: [
    {
      id: "homePage",
      name: "Home Page",
      description: "Home Pages"
    },
    {
      id: "basicPage",
      name: "Basic Page",
      description: "Basic Page"
    },
    {
      id: "thirdPage",
      name: "Third Page",
      description: "Third Page"
    }
  ]
};

describe("Contentful diffing tool", () => {
  test("works", () => {
    expect(diff(contentfulExport, localContent)).not.toBeUndefined();
  });
});
