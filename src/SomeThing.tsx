import { Box, Button, Text } from "@chakra-ui/react";
import React, { ForwardedRef, useCallback, useEffect } from "react";
import { useSettings } from "./settings/settings";

const SomeThing = React.forwardRef((_, ref: ForwardedRef<HTMLDivElement>) => {
  const [settings, setSettings] = useSettings();
  useEffect(() => {}, []);
  const handleClick = useCallback(() => {
    setSettings({
      ...settings,
      languageId: settings.languageId === "en" ? "fr" : "en",
    });
  }, [settings, setSettings]);
  return (
    <Box ref={ref}>
      <Text>Current lang: {settings.languageId}</Text>
      <Button onClick={handleClick}>Toggle language (en / fr)</Button>
    </Box>
  );
});

export default SomeThing;
