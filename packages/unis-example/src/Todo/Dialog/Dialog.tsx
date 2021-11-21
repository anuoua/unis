import { h, ref, Teleport, toRefs } from "@unis/unis";
import { Item } from "../TodoItem";

interface DialogProps {
  onClose: () => void;
  onConfirm: (item: Item) => void;
  item: Item | null;
}

export function Dialog(props: DialogProps) {
  const { item } = toRefs(props);
  const maskDiv = ref();

  const handleClose = (e: MouseEvent) => {
    if (e.target === maskDiv.value) {
      props.onClose();
    }
  };

  const handleConfirm = () => {
    props.onConfirm(props.item!);
  };

  return () => (
    <Teleport to={document.body}>
      <div
        ref={maskDiv}
        className="bg-gray-900 bg-opacity-40 fixed left-0 top-0 h-full w-full flex items-center justify-center"
        onClick={handleClose}
      >
        <div className="w-96 bg-white rounded-md flex flex-col shadow-md">
          <div className="flex-shrink-0 text-right px-4 pt-4">
            <button onClick={() => props.onClose()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 p-10 flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div> Delete（{item.value?.name}）Task</div>
          </div>
          <div className="flex-shrink-0 text-right">
            <button
              className="m-2 p-2 px-5 bg-blue-500 text-gray-100 text-sm rounded-md focus:border-4 border-blue-300"
              onClick={handleConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  );
}
