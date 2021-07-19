import { useState } from "react";
import { Grid, Text, Button, Input, Box } from "@chakra-ui/react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import useSocketPeer from "../hooks/useSocketPeer";

function ControlPanel() {
  const {
    myId,
    callAccepted,
    name,
    setName,
    callEnded,
    endCall,
    callOtherUser,
  } = useSocketPeer();

  const [idToCall, setIdToCall] = useState<string>("");

  return (
    <Box>
      <form noValidate autoComplete="off">
        <Grid>
          <Text>Account Info</Text>
          <Input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
          <CopyToClipboard text={myId}>
            <Button colorScheme="blue">Copy ID to Clipboard</Button>
          </CopyToClipboard>
        </Grid>
        <Grid>
          <Text>Make a call</Text>
          <Input
            value={idToCall}
            onChange={({ target }) => setIdToCall(target.value)}
          />
          {callAccepted && !callEnded ? (
            <Button colorScheme="blue" onClick={endCall}>
              Leave 🚪
            </Button>
          ) : (
            <Button onClick={() => callOtherUser(idToCall)}>
              Make a call 📞
            </Button>
          )}
        </Grid>
      </form>
    </Box>
  );
}

export default ControlPanel;
