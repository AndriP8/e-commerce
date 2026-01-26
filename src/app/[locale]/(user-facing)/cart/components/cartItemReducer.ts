export type CartItemAction =
  | { type: "SET_QUANTITY"; payload: string }
  | { type: "SET_DEBOUNCED_QUANTITY"; payload: string }
  | { type: "SET_UPDATING"; payload: boolean }
  | { type: "RESET_TO_ORIGINAL"; payload: string };

export type CartItemState = {
  quantity: string;
  debouncedQuantity: string;
  isUpdating: boolean;
};

export function cartItemReducer(
  state: CartItemState,
  action: CartItemAction,
): CartItemState {
  switch (action.type) {
    case "SET_QUANTITY":
      return { ...state, quantity: action.payload };
    case "SET_DEBOUNCED_QUANTITY":
      return { ...state, debouncedQuantity: action.payload };
    case "SET_UPDATING":
      return { ...state, isUpdating: action.payload };
    case "RESET_TO_ORIGINAL":
      return {
        ...state,
        quantity: action.payload,
        debouncedQuantity: action.payload,
      };
    default:
      return state;
  }
}

export function createInitialCartItemState(quantity: number): CartItemState {
  const quantityString = quantity.toString();
  return {
    quantity: quantityString,
    debouncedQuantity: quantityString,
    isUpdating: false,
  };
}
