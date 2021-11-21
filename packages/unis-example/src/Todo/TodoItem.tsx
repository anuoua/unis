import { h, isRef, Ref, toRefs } from "@unis/unis";
import s from "./TodoItem.module.css";

export interface Item {
  id: number;
  name: string;
  editing: boolean;
  canceled: boolean;
}

interface TodoItemProps {
  item: Item;
  onDelete: (item: Item) => any;
  onCancel: (item: Item) => any;
}

function $<I>(a: I): I extends Ref ? I["value"] : I {
  if (isRef(a)) {
    return a.value as any;
  } else {
    return a as any;
  }
}

export const TodoItem = (props: TodoItemProps) => {
  const { item } = toRefs(props);
  const { editing, canceled, name } = toRefs($(item));

  const handleEditing = () => {
    if ($(item).canceled) return;
    $(item).editing = true;
  };

  const handleClick = () => {
    props.onDelete(props.item);
  };

  const handleCancel = () => {
    props.onCancel(props.item);
  };

  const handleKeyDown = (e: any) => {
    if (e.key !== "Enter") return;
    $(item).name = e.target.value;
    $(item).editing = false;
  };

  const handleBlur = () => {
    $(item).editing = false;
  };

  return () => (
    <li className="flex flex-row items-center justify-between gap-5 bg-white bg-opacity-50 rounded-md p-5 shadow-md">
      {$(editing) ? (
        <input
          value={$(name)}
          className="flex-grow min-w-0"
          type="text"
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        ></input>
      ) : $(canceled) ? (
        <del
          className="flex-grow min-w-0 overflow-ellipsis overflow-hidden"
          onClick={handleEditing}
        >
          {$(name)}
        </del>
      ) : (
        <span
          className="flex-grow min-w-0 overflow-ellipsis overflow-hidden"
          onClick={handleEditing}
        >
          {$(name)}
        </span>
      )}
      <i
        className={`${s.deleteIcon} cursor-pointer`}
        onClick={handleCancel}
        title={$(canceled) ? "Revert" : "Cancel"}
      >
        {$(canceled) ? (
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
        onClick={() => handleClick()}
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
