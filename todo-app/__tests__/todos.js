const request = require("supertest");
const db = require("../models/index");
const app = require("../app");
var cheerio = require("cheerio");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
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

  test("Marks a todo with the given ID as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodoResponse = await agent
      .get("/")
      .set("Accept", "application/json");

    const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const lastestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompletedResponse = await agent
      .put(`/todos/${lastestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: true,
      });

    console.log(markCompletedResponse);
    const parsedUpdateResponse = JSON.parse(markCompletedResponse.text);

    expect(parsedUpdateResponse.completed).toBe(true);
  });

  // test("Delete a todo by ID", async () => {
  //   const response = await agent.post("/todos").send({
  //     title: "Buy Milk",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   const parsedResponse = JSON.parse(response.text);
  //   const todoID = parsedResponse.id;

  //   const deleteResponse = await agent.delete(`/todos/${todoID}`).send();
  //   expect(deleteResponse.statusCode).toBe(200);
  //   expect(JSON.parse(deleteResponse.text)).toBe(true);
  // });
});
