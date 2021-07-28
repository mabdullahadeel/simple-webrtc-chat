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

    async function enableStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(stream);

        if (myVideo.current && !myVideo.current.srcObject)
          myVideo.current.srcObject = stream;
      } catch (err) {
        console.log(err);
      }
    }

    if (!stream) {
      enableStream();
    } else {
      return function cleanup() {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      };
    }

    // socket handlers
    socket.on("me", (id: string) => setMyId(id));

    socket.on("userCalling", ({ from, name, signalData }: CallUser) => {
      setCall({ from, name, signalData, isReceivingCall: true });
    });
  }, [stream]);

  // Receive a call from another user
  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });
    // send signal data to peer
    peer.on("signal", (signalingData: SignalData) => {
      socket.emit("answercall", {
        signal: signalingData,
        to: call?.from,
        name,
      });
    });

    // receive stream from peer
    peer.on("stream", (currentStream: MediaStream) => {
      if (currentStream && userVideo.current && !userVideo.current.srcObject) {
        console.log("everything set and get to go - answerer");
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.on("error", (err) => {
      console.log(err);
    });

    peer.signal(call.signalData);

    connectionRef.current = peer;
  };

  // Making a call to another user
  const callOtherUser = (id: string) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (mySignalData: SignalData) => {
      socket.emit("calluser", {
        userToCall: id,
        signalData: mySignalData,
        from: myId,
        name,
      });
    });

    peer.on("stream", (currentStream: MediaStream) => {
      if (currentStream && userVideo.current && !userVideo.current.srcObject) {
        console.log("everything set and get to go");
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.on("error", (err) => {
      console.log(err);
    });

    socket.on(
      "callaccepted",
      ({
        signalingData,
        name,
      }: {
        signalingData: SignalData;
        name: string;
      }) => {
        setCallAccepterName(name);
        setCallAccepted(true);
        peer.signal(signalingData);
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
