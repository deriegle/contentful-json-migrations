const diff = require("../index");

const contentfulExport = {
  required: false,
  contentTypes: ["blogPage"]
};

const localContent = {
  required: true,
  contentTypes: ["homePage"]
};

describe("Contentful diffing tool", () => {
  test("works", () => {
    expect(diff(contentfulExport, localContent)).toEqual({
      required: {
        __new: true,
        __old: false
      },
      model: {
        id: {
          __new: "homePage",
          __old: "blogPage"
        }
      }
    });
  });
});
