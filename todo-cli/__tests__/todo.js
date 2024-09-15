/* eslint-disable no-undef */

const todoList = require("../todo");

const { all, markAsComplete, add, overdue, dueToday, dueLater } = todoList();

describe("Todolist Test Suite", () => {
  const formattedDate = (d) => {
    return d.toISOString().split("T")[0];
  };

  test("Should Add new todo", () => {
    const todoItemsCount = all.length;
    add({
      title: "Test todo",
      completed: false,
      dueDate: new Date().toISOString().slice(0, 10),
    });
    expect(all.length).toBe(todoItemsCount + 1);
  });

  test("Should mark a todo as complete", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });

  test("Should Retrive a Overdue todo", () => {
    const overduesbefore = overdue().length;

    add({
      title: "Overdue todo",
      completed: false,
      dueDate: formattedDate(
        new Date(new Date().setDate(new Date().getDate() - 1)),
      ),
    });

    const overduesafter = overdue().length;

    expect(overduesafter).toBe(overduesbefore + 1);
  });

  test("Should Retrive a due today todo", () => {
    const todayduesbefore = dueToday().length;

    add({
      title: "Today due todo",
      completed: false,
      dueDate: formattedDate(new Date()),
    });

    const todayduesafter = dueToday().length;

    expect(todayduesafter).toBe(todayduesbefore + 1);
  });

  test("Should Retrive a due later todo", () => {
    const laterduesbefore = dueLater().length;

    add({
      title: "Later due todo",
      completed: false,
      dueDate: formattedDate(
        new Date(new Date().setDate(new Date().getDate() + 1)),
      ),
    });

    const laterduesafter = dueLater().length;

    expect(laterduesafter).toBe(laterduesbefore + 1);
  });
});

/* eslint-enable no-undef */
