import { h, useState } from "@unis/unis";
import { CSSTransition, TransitionGroup } from "@unis/transition";
import { Dialog } from "./Dialog";
import { Item, TodoItem } from "./TodoItem";

let count = 0;

let todos: any[] = [];

for (; count < 0; count++) {
  todos.push({
    id: count,
    name: "",
    editing: false,
    canceled: false,
  });
}

export function ToDo() {
  let [todoList, setTodoList] = useState<any[]>(todos);
  let [dialogVisible, setDialogVisible] = useState(false);
  let [titleVisible, setTitleVisible] = useState(true);
  let [currentItem, setCurrentItem] = useState<Item | null>(null);

  const handleToggleTitle = () => {
    setTitleVisible(!titleVisible);
    setTimeout(() => {
      setTitleVisible(true);
    }, 200);
  };

  const handleAdd = (e: any) => {
    if (e.key !== "Enter") return;
    todoList.push({
      id: ++count,
      name: e.target.value,
      editing: false,
      canceled: false,
    });
    e.target.value = "";
    setTodoList([...todoList]);
  };

  const handleClose = () => {
    setDialogVisible(false);
  };

  const handleConfirm = (item: Item) => {
    setDialogVisible(false);
    const index = todoList.findIndex((i) => i === item);
    if (index === -1) return;
    todoList.splice(index, 1);
    setTodoList([...todoList]);
  };

  const handleDelete = (item: Item) => {
    setCurrentItem(item);
    const index = todoList.findIndex((i) => i === item);
    if (index === -1) return;
    todoList.splice(index, 1);
    setTodoList([...todoList]);
    // setDialogVisible(true);
  };

  return () => (
    <div className="w-80">
      <CSSTransition timeout={400} in={titleVisible} classNames="scale">
        <h1
          className="font-mono text-white font-bold text-4xl mb-10 w-full text-center cursor-pointer"
          onClick={handleToggleTitle}
        >
          TODO
        </h1>
      </CSSTransition>
      <input
        type="text"
        placeholder="Input here"
        className="h-14 border-2 rounded-md px-2 mb-10 w-full"
        onKeyPress={handleAdd}
      />
      <ul className="h-80 w-full flex flex-col gap-5 overflow-auto">
        <TransitionGroup>
          {todoList.map((i: any) => (
            <CSSTransition key={i.id} timeout={400} classNames="scale" appear>
              <TodoItem item={i} onDelete={handleDelete} />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </ul>
      {dialogVisible && (
        <Dialog
          item={currentItem}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
