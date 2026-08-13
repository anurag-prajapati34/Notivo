import { makeGetReuqest } from "../utils/axios";
import { endpoints } from "./config";

/**
 * Ping API Server and worker server
 */
export const pingServers = async () => {
  for (let i = 0; i < 3; i++) {
    try {
      Promise.all([
        makeGetReuqest(endpoints.apiServerHealth),
        makeGetReuqest(endpoints.workerServerHealth),
      ]);
    } catch (error) {
      console.log("Servers not reachable");
    }
  }
};
