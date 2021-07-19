import { useContext } from "react";
import { SocketContext } from "../helpers/socketContext";
import { GlobalContext } from "../types";

function useSocketPeer(): GlobalContext {
  return useContext(SocketContext);
}

export default useSocketPeer;
