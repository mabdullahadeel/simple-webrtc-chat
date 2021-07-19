import { SignalData } from "simple-peer";
import { MutableRefObject, SetStateAction, Dispatch } from "react";

export interface CallUser {
  from: string;
  name: string;
  signalData: SignalData;
}

export interface ReceiveCall extends CallUser {
  isReceivingCall: boolean;
}

export interface GlobalContext {
  call: ReceiveCall;
  callAccepted: boolean;
  callEnded: boolean;
  myVideo: MutableRefObject<HTMLVideoElement | null>;
  userVideo: MutableRefObject<HTMLVideoElement | null>;
  myId: string;
  stream: MediaStream | undefined;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  answerCall: () => void;
  callOtherUser: (id: string) => void;
  endCall: () => void;
}
