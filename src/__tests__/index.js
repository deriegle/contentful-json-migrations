const diff = require("../index");
const fs = require("fs");

jest.mock("fs");

describe("Contentful diffing tool", () => {
  test("works", () => {
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

    expect(diff(contentfulExport, localContent)).not.toBeUndefined();
    expect(fs.writeFileSync).toHaveBeenCalled();

    const [firstCall, secondCall] = fs.writeFileSync.mock.calls;

    expect(firstCall[0]).toMatch(/migrations\/\d+-homePage.js$/);
    expect(firstCall[1]).toMatch(/migration.editContentType\('homePage'\)/g);
    expect(firstCall[1]).toMatch(/contentType.description\('Home Pages'\)/g);
    expect(firstCall[2]).toEqual({
      flag: "wx+"
    });

    expect(secondCall[0]).toMatch(/migrations\/\d+-thirdPage.js$/);
    expect(secondCall[1]).toMatch(
      /migration.createContentType\('thirdPage'\)/g
    );
    expect(secondCall[1]).toMatch(/contentType.name\('Third Page'\)/g);
    expect(secondCall[1]).toMatch(/contentType.description\('Third Page'\)/g);
    expect(secondCall[2]).toEqual({
      flag: "wx+"
    });
  });
});
