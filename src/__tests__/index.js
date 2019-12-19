const diff = require("../src/index");

const contentfulExport = {
  contentTypes: [
    {
      id: "blogPage",
      name: "Blog Page",
      fields: [
        {
          id: "title",
          name: "Title",
          type: "Symbol"
        }
      ]
    }
  ]
};

const localContent = {
  contentTypes: [
    {
      id: "blogPage",
      name: "Blog Page",
      fields: [
        {
          id: "title",
          name: "My title",
          type: "Symbol",
          required: true
        },
        {
          id: "body",
          name: "Body",
          type: "RichText",
          required: true
        }
      ]
    }
  ]
};

describe("Contentful diffing tool", () => {
  test("works", () => {
    expect(diff(contentfulExport, localContent)).toEqual({});
  });
});
