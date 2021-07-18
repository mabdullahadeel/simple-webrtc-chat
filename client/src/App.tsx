import React from "react";
import "./App.css";
import { Box, Flex, Text, Center } from "@chakra-ui/react";
import Notification from "./components/Notification";
import Video from "./components/Video";
import ControlPanel from "./components/ControlPanel";

function App() {
  return (
    <Box>
      <Flex height="100px" align="center" justify="center">
        <Text>
          <Center>Hover Chat ✌</Center>
        </Text>
      </Flex>
      <Box>
        <Video />
        <ControlPanel />
        <Notification />
      </Box>
    </Box>
  );
}

export default App;
