const request = require("supertest");
const app = require("../../server.js");
// import supertest from 'supertest'
// import '../../server.js'

describe("POST /api/v1/auth/login", () => {

    it("should login successfully", async () => {

        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "admin@gmail.com",
                password: "admin"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
    });

});