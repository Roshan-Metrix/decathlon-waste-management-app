const request = require("supertest");
const app = require("../../server.js");
// import supertest from 'supertest'
// import '../../server.js'

describe("POST /api/auth/login", () => {

    it("should login successfully", async () => {

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test@gmail.com",
                password: "123456"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
    });

});