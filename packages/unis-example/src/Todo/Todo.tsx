import { reactive, ref } from "@unis/unis";
import { Dialog } from "./Dialog/Dialog";
import { Item, TodoItem } from "./TodoItem";

let count = 0;

export function ToDo() {
  const todoList = reactive<Item[]>([]);
  const dialogVisible = ref(false);

  const state = reactive<{ currentItem: null | Item }>({
    currentItem: null,
  });

  const handleAdd = (e: any) => {
    if (e.key !== "Enter") return;
    todoList.push({
      id: ++count,
      name: e.target.value,
      editing: false,
      canceled: false,
    });
    e.target.value = "";
  };

  const handleClose = () => {
    dialogVisible.value = false;
  };

  const handleConfirm = (item: Item) => {
    dialogVisible.value = false;
    const index = todoList.findIndex((i) => i === item);
    if (index === -1) return;
    todoList.splice(index, 1);
  };

  const handleDelete = (item: Item) => {
    state.currentItem = item;
    dialogVisible.value = true;
  };

  const handleCancel = (item: Item) => {
    item.canceled = !item.canceled;
  };

  return () => (
    <div className="w-80">
      <h1 className="font-mono text-white font-bold text-4xl mb-10 w-full text-center">
        TODO
      </h1>
      <input
        type="text"
        placeholder="Please Input Todo"
        className="h-14 border-2 rounded-md px-2 mb-10 w-full"
        onKeyDown={handleAdd}
      />
      <ul className="w-full flex flex-col gap-5">
        {todoList.map((i: any) => (
          <TodoItem
            key={i.id}
            item={i}
            onDelete={handleDelete}
            onCancel={handleCancel}
          />
        ))}
      </ul>
      {dialogVisible.value && (
        <Dialog
          item={state.currentItem}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
