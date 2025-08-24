import { serializeError } from "serialize-error";

export const parseErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    if (error.message.includes("User rejected the request")) {
      return "User rejected the request";
    }
    return error.message;
  }

  const serialized = serializeError(error);
  if (
    typeof serialized === "object" &&
    serialized !== null &&
    "message" in serialized &&
    typeof serialized.message === "string"
  ) {
    return serialized.message;
  }

  return "An unknown error occurred";
};
