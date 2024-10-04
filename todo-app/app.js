const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf({ cookie: true }));

const { Todo } = require("./models");
const { Model } = require("sequelize");

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (request, response) => {
  const allTodos = await Todo.getTodos();
  if (request.accepts("html")) {
    response.render("index", { allTodos, csrfToken: request.csrfToken() });
  } else {
    response.json({ allTodos });
  }
});

app.get("/todos", async (request, response) => {
  try {
    const todos = await Todo.findAll();
    return response.json(todos);
  } catch (error) {
    console.error(error);
    return response.status(422).json({ error: "Failed to retrieve todos" });
  }
});

app.post("/todos", async (request, response) => {
  console.log("Creating a todo", request.body);
  // todo
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false,
    });
    return response.redirect("/");
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", async (request, response) => {
  console.log("Updating todo with ID:", request.params.id);
  try {
    const { completed } = request.body;
    const updatedTodo = await Todo.setCompletionStatus(
      request.params.id,
      completed
    );
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async (request, response) => {
  const todoID = request.params.id;
  try {
    await Todo.remove(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Failed to delete todo" });
  }
});

module.exports = app;
