const request = require("supertest");
const db = require("../models/index");
const app = require("../app");
var cheerio = require("cheerio");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Todo test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "Test",
      lastName: "User A",
      email: "user.a@test.com",
      password: "12345678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("Sign out", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });

  test("Adding a todo at /todos", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678");
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  // test("Marks a todo with the given ID as complete", async () => {
  //   const agent = request.agent(server);
  //   await login(agent, "user.a@test.com", "12345678");
  //   let res = await agent.get("/todos");
  //   let csrfToken = extractCsrfToken(res);

  //   await agent.post("/todos").send({
  //     title: "Buy milk",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //     _csrf: csrfToken,
  //   });
  //   const groupedTodoResponse = await agent
  //     .get("/todos")
  //     .set("Accept", "application/json");

  //   const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text);
  //   console.log(parsedGroupedResponse);
  //   const dueTodayCount = parsedGroupedResponse.dueToday.length;
  //   const lastestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

  //   res = await agent.get("/todos");
  //   csrfToken = extractCsrfToken(res);

  //   const markCompletedResponse = await agent
  //     .put(`/todos/${lastestTodo.id}/`)
  //     .send({
  //       _csrf: csrfToken,
  //       completed: true,
  //     });

  //   console.log(markCompletedResponse);
  //   const parsedUpdateResponse = JSON.parse(markCompletedResponse.text);

  //   expect(parsedUpdateResponse.completed).toBe(true);
  // });

  // test("Delete a todo with the given ID", async () => {
  //   let res = await agent.get("/todos");
  //   let csrfToken = extractCsrfToken(res);

  //   await agent.post("/todos").send({
  //     title: "Buy milk",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //     _csrf: csrfToken,
  //   });
  //   const groupedTodoResponse = await agent
  //     .get("/todos")
  //     .set("Accept", "application/json");

  //   const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text);

  //   expect(parsedGroupedResponse.dueToday).toBeDefined();

  //   const dueTodayCount = parsedGroupedResponse.dueToday.length;
  //   const lastestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

  //   res = await agent.get("/todos");
  //   csrfToken = extractCsrfToken(res);

  //   const deleteResonse = await agent.delete(`/todos/${lastestTodo.id}`).send({
  //     _csrf: csrfToken,
  //   });

  //   expect(deleteResonse.completed).toBe(true);
  // });
});
