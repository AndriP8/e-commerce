export interface FileWithPreview {
  id: string;
  preview: string;
  file: File;
}

export interface UploadState {
  files: FileWithPreview[];
  uploading: boolean;
  progress: { [key: string]: number };
  uploaded: string[];
  errors: { [key: string]: string };
}

export type UploadAction =
  | { type: "ADD_FILES"; payload: FileWithPreview[] }
  | { type: "SET_UPLOADING"; payload: boolean }
  | { type: "UPDATE_PROGRESS"; payload: { id: string; progress: number } }
  | { type: "SET_UPLOADED"; payload: string }
  | { type: "SET_ERROR"; payload: { id: string; error: string } }
  | { type: "REMOVE_FILE"; payload: string }
  | { type: "RESET" };

export const initialState: UploadState = {
  files: [],
  uploading: false,
  progress: {},
  uploaded: [],
  errors: {},
};

export function uploadReducer(
  state: UploadState,
  action: UploadAction,
): UploadState {
  switch (action.type) {
    case "ADD_FILES":
      return {
        ...state,
        files: [...state.files, ...action.payload],
      };
    case "SET_UPLOADING":
      return {
        ...state,
        uploading: action.payload,
      };
    case "UPDATE_PROGRESS":
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.payload.id]: action.payload.progress,
        },
      };
    case "SET_UPLOADED":
      return {
        ...state,
        uploaded: [...state.uploaded, action.payload],
        progress: {
          ...state.progress,
          [action.payload]: 0,
        },
        uploading: false,
      };
    case "SET_ERROR":
      return {
        ...state,
        progress: {
          [action.payload.id]: 0,
        },
        errors: {
          ...state.errors,
          [action.payload.id]: action.payload.error,
        },
        uploading: false,
      };
    case "REMOVE_FILE":
      return {
        ...state,
        files: state.files.filter((file) => file.id !== action.payload),
        progress: Object.fromEntries(
          Object.entries(state.progress).filter(
            ([key]) => key !== action.payload,
          ),
        ),
        uploaded: state.uploaded.filter((id) => id !== action.payload),
        errors: Object.fromEntries(
          Object.entries(state.errors).filter(
            ([key]) => key !== action.payload,
          ),
        ),
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}
