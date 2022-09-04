import { h, use, memo, useEffect, useProps, useRef } from "@unis/unis";
import { Update } from "../hooks/update";
import s from "./index.module.css";

export interface Item {
  id: number;
  name: string;
  editing: boolean;
  canceled: boolean;
}

interface TodoItemProps {
  item: Item;
  onDelete: (item: Item) => any;
}

export const TodoItem = memo((props: TodoItemProps) => {
  let { item, onDelete } = useProps(props);
  let [render] = use(Update());
  let { editing, canceled, name } = use(() => item);

  const inputRef = useRef();

  const handleEditing = () => {
    if (canceled) return;
    item.editing = true;
    render();
  };

  const handleClick = () => {
    onDelete(item);
  };

  const handleCancel = () => {
    console.log(inputRef.current);
    item.canceled = !item.canceled;
    render();
  };

  const handleKeyDown = (e: any) => {
    if (e.key !== "Enter") return;
    item.name = e.target.value;
    item.editing = false;
    render();
  };

  const handleBlur = () => {
    item.editing = false;
    render();
  };

  useEffect(
    () => {
      item.name = item.name + "x";
      render();
    },
    () => [item.canceled]
  );

  return () => {
    // console.log("TodoItem render");
    return (
      <li className="flex flex-row items-center justify-between gap-5 bg-white bg-opacity-50 rounded-md p-5 shadow-md">
        {editing ? (
          <input
            ref={inputRef}
            value={name}
            className="flex-grow min-w-0"
            type="text"
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          ></input>
        ) : canceled ? (
          <del
            className="flex-grow min-w-0 overflow-ellipsis overflow-hidden"
            onClick={handleEditing}
          >
            {name}
          </del>
        ) : (
          <span
            className="flex-grow min-w-0 overflow-ellipsis overflow-hidden"
            onClick={handleEditing}
          >
            {name}
          </span>
        )}
        <i
          className={`${s.deleteIcon} cursor-pointer`}
          onClick={handleCancel}
          title={canceled ? "Revert" : "Cancel"}
        >
          {canceled ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </i>
        <i
          className={`${s.deleteIcon} cursor-pointer`}
          onClick={handleClick}
          title="Delete"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </i>
      </li>
    );
  };
});
