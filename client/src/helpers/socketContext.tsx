import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  ReactChildren,
  ReactChild,
} from "react";
import { io } from "socket.io-client";
import Peer, { SignalData, Instance } from "simple-peer";
import { CallUser, ReceiveCall, GlobalContext } from "../types";

export const SocketContext = createContext<GlobalContext>({} as GlobalContext);

const socket = io("http://localhost:5000");

export const SocketProvider = ({
  children,
}: {
  children: ReactChild | ReactChildren;
}) => {
  const [stream, setStream] = useState<MediaStream | undefined>();
  const [myId, setMyId] = useState<string>("");
  const [call, setCall] = useState<ReceiveCall>({} as ReceiveCall);
  const [name, setName] = useState<string>("");
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const [callEnded, setCallEnded] = useState<boolean>(false);
  const [callAccepterName, setCallAccepterName] = useState<string>("");

  const myVideo = useRef<HTMLVideoElement | null>(null);
  const userVideo = useRef<HTMLVideoElement | null>(null);
  const connectionRef = useRef<Instance>();

  useEffect(() => {
    // get the permission to user camera and microphone
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);

        const node = myVideo.current;
        if (node) node.srcObject = stream;
      });

    // socket handlers
    socket.on("me", (id: string) => setMyId(id));

    socket.on("userCalling", ({ from, name, signalData }: CallUser) => {
      setCall({ from, name, signalData, isReceivingCall: true });
    });
  }, []);

  // Receive a call from another user
  const answerCall = () => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    // send signal data to peer
    peer.on("signal", (signalData: SignalData) => {
      socket.emit("answercall", { signal: signalData, to: call?.from, name });
    });

    // receive signal data from peer
    peer.on("stream", (currentStream: MediaStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(call?.signalData);
    setCallAccepted(true);

    connectionRef.current = peer;
  };

  // Making a call to another user
  const callOtherUser = (id: string) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (mySginalData: SignalData) => {
      socket.emit("calluser", {
        userToCall: id,
        signalData: mySginalData,
        from: myId,
        name,
      });
    });

    peer.on("stream", (currentStream: MediaStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    socket.on(
      "callaccepted",
      ({ signalData, name }: { signalData: SignalData; name: string }) => {
        setCallAccepterName(name);
        setCallAccepted(true);
        peer.signal(signalData);
      }
    );

    connectionRef.current = peer;
  };

  const endCall = () => {
    setCallEnded(true);
    connectionRef.current?.destroy();

    window.location.reload();
  };

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        callEnded,
        myVideo,
        userVideo,
        myId,
        stream,
        name,
        callAccepterName,
        setName,
        answerCall,
        callOtherUser,
        endCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
