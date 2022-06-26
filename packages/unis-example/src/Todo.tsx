import { h, useState } from "@unis/unis";
import { Dialog } from "./Dialog";
import { Item, TodoItem } from "./TodoItem";

let count = 0;

let todos: any[] = [];

for (; count < 1000; count++) {
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
  let [currentItem, setCurrentItem] = useState<Item | null>(null);

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
      <h1 className="font-mono text-white font-bold text-4xl mb-10 w-full text-center">
        TODO
      </h1>
      <input
        type="text"
        placeholder="Input here"
        className="h-14 border-2 rounded-md px-2 mb-10 w-full"
        onKeyPress={handleAdd}
      />
      <ul className="h-80 w-full flex flex-col gap-5 overflow-auto">
        {todoList.map((i: any) => (
          <TodoItem key={i.id} item={i} onDelete={handleDelete} />
        ))}
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
