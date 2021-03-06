import * as request from "supertest";
import Server from "../../../lib";
import { Logger } from "ts-framework-common";

describe("lib.server.middlewares.CORS", () => {
  Logger.initialize();

  it("GET /cors_inactive (200)", async () => {
    // Initialize a simple server
    const server = new Server({
      port: 3333,
      security: {
        cors: false
      },
      router: {
        routes: {
          get: {
            "/": (req, res) => res.json({ test: "ok" })
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

  it("GET /cors_active (200)", async () => {
    // Initialize a simple server
    const server = new Server({
      port: 3333,
      security: {
        cors: true
      },
      router: {
        routes: {
          get: {
            "/": (req, res) => res.json({ test: "ok" })
          }
        }
      }
    });

    // Perform a simple request to get a 200 response
    await request(server.app)
      .get("/")
      .expect("Content-Type", /json/)
      .expect("Access-Control-Allow-Origin", "*")
      .expect(200, { test: "ok" });

    await server.close();
  });
});
