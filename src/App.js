import React, { useEffect, useState } from "react";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { createTodo, deleteTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import { withAuthenticator } from "@aws-amplify/ui-react";
import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: "", description: "" };

const App = () => {
  const [todoList, setTodoList] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);
  const [modalIsOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      console.log(todoData);
      setTodoList(todoData.data.listTodos.items);
      setApiLoading(true);
    } catch (err) {
      console.log("error fetching todos");
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await API.graphql(graphqlOperation(createTodo, { input: todo }));
      fetchTodos();
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function deleteTodoFun(id) {
    const request = { id: `${id}` };
    try {
      await API.graphql(
        graphqlOperation(deleteTodo, { input: request  })
      );
      fetchTodos();
    } catch (err) {
      console.log("error in deleting todo:", err);
    }
  }

  return (
    <div className="container d-flex justify-content-start flex-column mt-5">
      <div className="row">
        <div className="col-12 text-center">
          <h2>
            {" "}
            My To Do List &nbsp;{" "}
            {
              modalIsOpen === false ? (<i
                className="las la-plus"
                style={{ cursor: "pointer" }}
                onClick={() => setIsOpen(true)}
              ></i>) : (<i
                className="las la-minus"
                style={{ cursor: "pointer" }}
                onClick={() => setIsOpen(false)}
              ></i>)
            }
          </h2>
        </div>
      </div>
      {modalIsOpen === true && (
        <div className="row justify-content-md-center m-4">
          <div className="col-md-4 col-xs-12">
            <div class="form-group">
              <label for="exampleInputEmail1">Enter the Task</label>
              <input
                type="name"
                class="form-control"
                onChange={(event) => setInput("name", event.target.value)}
                value={formState.name}
                placeholder="Name"
              />
            </div>

            <div class="form-group">
              <label for="exampleInputEmail1">Enter the Description </label>
              <input
                type="name"
                class="form-control"
                onChange={(event) =>
                  setInput("description", event.target.value)
                }
                value={formState.description}
                placeholder="Description"
              />
            </div>

            <div className="col-12" style={{ paddingRight: "0px" }}>
              <button class="btn btn-primary float-right ml-2" onClick={addTodo}>
                Create Todo
              </button>
              <button
                class="btn btn-info float-right"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {apiLoading === true ? (
        <>
          {todoList.length > 0 && todoList !== null ? (
            <div className="row justify-content-md-center m-4">
              {todoList.map((item, idx) => (
                <div
                  className="card col-md-3 col-xs-12 m-2"
                  style={{
                    backgroundColor: "white",
                    color: "#000000",
                  }}
                  key={idx}
                >
                  <div className="card-body">
                    <h5 className="card-title">{item.name}</h5>
                    <p className="card-text">{item.description}</p>
                  </div>
                  <div
                    className="text-right"
                    style={{ cursor: "pointer" }}
                    onClick={() => deleteTodoFun(item.id)}
                  >
                    {" "}
                    <i className="las la-trash"></i>{" "}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <h5 className="text-center mt-2">
              {" "}
              Oops you don't have any Task in your To Do List!
            </h5>
          )}
        </>
      ) : (
        <div className="d-flex justify-content-center mt-4">
          <div className="spinner-grow text-primary" role="status">
            <span className="sr-only">Loading... </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuthenticator(App);
