import { createContext, useContext } from "react";
import { DefaultLogging } from "./default";
import { Logging } from "./logging";

export const LoggingContext = createContext<Logging | undefined>(
  new DefaultLogging()
);

/**
 * Hook exposing logging.
 */
export const useLogging = (): Logging => {
  const logging = useContext(LoggingContext);
  if (!logging) {
    throw new Error("Missing provider");
  }
  return logging;
};
