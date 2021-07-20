import { useEffect } from "react";
import { Text, Grid, Box } from "@chakra-ui/react";
import useSocketPeer from "../hooks/useSocketPeer";

function Video() {
  const {
    myVideo,
    userVideo,
    name,
    callEnded,
    stream,
    call,
    callAccepted,
    callAccepterName,
  } = useSocketPeer();

  useEffect(() => {
    console.log(userVideo);
  }, [userVideo]);
  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
      {/* Current User Video */}
      {stream && (
        <Box>
          <Text>{name || "Please Choose your username"}</Text>
          <video playsInline muted ref={myVideo} autoPlay />
        </Box>
      )}
      {/* Other Caller's Vider */}
      {callAccepted && !callEnded && (
        <Box>
          <Text>{call.name || callAccepterName || "Random Caller"}</Text>
          <Box>
            <video playsInline muted ref={userVideo} autoPlay />
          </Box>
        </Box>
      )}
    </Grid>
  );
}

export default Video;
