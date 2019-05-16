import * as path from "path";
import * as request from "supertest";
import Server from "../../../lib";
import { Logger } from "ts-framework-common";

describe("lib.server.helpers.FilterWrapper", () => {
  Logger.initialize();

  it("GET /pass_simple_filter (200)", async () => {
    const server = new Server({
      port: 3333,
      request: {
        secret: "TEST_SECRET"
      },
      router: {
        routes: {
          get: {
            "/": {
              controller: (req, res) => res.json({ test: "ok" }),
              filters: [require("../../__mock__/okFilter.mock")]
            }
          }
        }
      }
    });

    // Perform a simple request to get a 200 response
    await request(server.app)
      .get("/")
      .expect("Content-Type", /json/)
      .expect(200, { test: "ok" });
  });

  it("GET /pass_simple_file_filter (200)", async () => {
    const server = new Server({
      port: 3333,
      request: {
        secret: "TEST_SECRET"
      },
      router: {
        path: {
          filters: path.join(__dirname, "../../__mock__")
        },
        routes: {
          get: {
            "/": {
              controller: (req, res) => res.json({ test: "ok" }),
              filters: ["okFilter.mock"]
            }
          }
        }
      }
    });

    // Perform a simple request to get a 200 response
    await request(server.app)
      .get("/")
      .expect("Content-Type", /json/)
      .expect(200, { test: "ok" });

    await server.close();
  });

  it("GET /error_filter (200)", async () => {
    const server = new Server({
      port: 3333,
      request: {
        secret: "TEST_SECRET"
      },
      router: {
        routes: {
          get: {
            "/": {
              controller: (req, res) => res.json({ test: "ok" }),
              filters: [require("../../__mock__/forbiddenFilter.mock")]
            }
          }
        }
      }
    });

    // Perform a simple request to get the error response
    await request(server.app)
      .get("/")
      .expect("Content-Type", /json/)
      .expect(403, { test: "forbidden" });

    await server.close();
  });

  it("should break if filter was not found", async () => {
    expect(
      () =>
        new Server({
          port: 3333,
          request: {
            secret: "TEST_SECRET"
          },
          router: {
            path: {
              filters: path.join(__dirname, "../../__mock__")
            },
            routes: {
              get: {
                "/": {
                  controller: (req, res) => res.json({ test: "ok" }),
                  filters: ["someUnknownFilter"]
                }
              }
            }
          }
        })
    ).toThrow(/someUnknownFilter/);
  });

  it("should also break if the filter breaks in initialization", async () => {
    expect(
      () =>
        new Server({
          port: 3333,
          request: {
            secret: "TEST_SECRET"
          },
          router: {
            path: {
              filters: path.join(__dirname, "../../__mock__")
            },
            routes: {
              get: {
                "/": {
                  controller: (req, res) => res.json({ test: "ok" }),
                  filters: ["brokenFilter.mock"]
                }
              }
            }
          }
        })
    ).toThrow(/broken filter/);
  });
});
