const request = require("supertest");
const db = require("../models/index");
var cherrio = require("cheerio");
const app = require("../app");

let server, agent;

function extractCsrfToken(res) {
  var $ = cherrio.load(res.text);
  return $("[name=_csrf]").val();
}

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

  test("response with json at /todos", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Mark a todo as a complete with the given id", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    const createResponse = await agent.post("/todos").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(createResponse.statusCode).toBe(302);

    const todosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const todos = JSON.parse(todosResponse.text);

    if (!todos || !todos.length) {
      throw new Error("No todos returned from the API.");
    }

    const latestTodo = todos[todos.length - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const updateResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      completed: true,
      _csrf: csrfToken,
    });

    const updatedTodo = JSON.parse(updateResponse.text);
    expect(updatedTodo.completed).toBe(true);
  });

  test("Delete a todo by ID", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    const createResponse = await agent.post("/todos").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(createResponse.statusCode).toBe(302);

    const todosResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const todos = JSON.parse(todosResponse.text);
    const latestTodo = todos[todos.length - 1];
    const todoID = latestTodo.id;

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const deleteResponse = await agent.delete(`/todos/${todoID}`).send({
      _csrf: csrfToken,
    });
    expect(deleteResponse.statusCode).toBe(200);

    const parsedDeleteResponse = JSON.parse(deleteResponse.text);
    expect(parsedDeleteResponse.success).toBe(true);
  });
});
