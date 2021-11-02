/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { HStack, Stack, Text } from "@chakra-ui/layout";
import { RiArrowLeftSFill } from "react-icons/ri";

interface BreadcrumbHeadingProps {
  title: string;
  parent: string;
  grandparent?: string;
  onBack: () => void;
}

const ToolkitBreadcrumbHeading = ({
  title,
  parent,
  grandparent,
  onBack,
}: BreadcrumbHeadingProps) => {
  return (
    <Stack spacing={0} position="sticky">
      <HStack>
        <Button
          leftIcon={<RiArrowLeftSFill color="rgb(179, 186, 211)" />}
          sx={{
            span: {
              margin: 0,
            },
            svg: {
              width: "1.5rem",
              height: "1.5rem",
            },
          }}
          display="flex"
          variant="unstyled"
          onClick={onBack}
          alignItems="center"
          fontWeight="sm"
        >
          {grandparent && grandparent + " / "}
          {parent}
        </Button>
      </HStack>
      <Text as="h2" fontSize="3xl" fontWeight="semibold">
        {title}
      </Text>
    </Stack>
  );
};

export default ToolkitBreadcrumbHeading;