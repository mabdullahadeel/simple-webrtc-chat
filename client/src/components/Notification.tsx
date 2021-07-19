import useSocketPeer from "../hooks/useSocketPeer";
import { Button } from "@chakra-ui/react";

function Notification() {
  const { answerCall, call, callAccepted } = useSocketPeer();
  return (
    <>
      {call.isReceivingCall && !callAccepted && (
        <div>
          <h1>{call.name} is Calling 📱📶 ... </h1>
          <Button onClick={() => answerCall()}>Join Call</Button>
        </div>
      )}
    </>
  );
}

export default Notification;
