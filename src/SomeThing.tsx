import { Box, Button, Text } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { useSettings } from "./settings/settings";

const SomeThing = () => {
  const [settings, setSettings] = useSettings();
  useEffect(() => {}, []);
  const handleClick = useCallback(() => {
    setSettings({
      ...settings,
      languageId: settings.languageId === "en" ? "fr" : "en",
    });
  }, [settings, setSettings]);
  return (
    <Box id="something">
      <Text>Current lang: {settings.languageId}</Text>
      <Button onClick={handleClick}>Toggle language (en / fr)</Button>
    </Box>
  );
};

export default SomeThing;
