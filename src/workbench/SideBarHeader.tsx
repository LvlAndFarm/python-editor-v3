/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { RiCloseLine, RiSearch2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import useIsUnmounted from "../common/use-is-unmounted";
import { useDeployment } from "../deployment";
import { topBarHeight } from "../deployment/misc";
import { SearchResults } from "../documentation/search/common";
import { useSearch } from "../documentation/search/search-hooks";
import SearchDialog from "../documentation/search/SearchDialog";
import { flags } from "../flags";

const SideBarHeader = () => {
  const ref = useRef<HTMLDivElement>(null);
  const faceLogoRef = useRef<HTMLDivElement>(null);
  const intl = useIntl();
  const brand = useDeployment();
  const searchModal = useDisclosure();
  const search = useSearch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | undefined>();
  const isUnmounted = useIsUnmounted();
  const handleQueryChange: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      async (e) => {
        const newQuery = e.currentTarget.value;
        setQuery(newQuery);
        const trimmedQuery = newQuery.trim();
        if (trimmedQuery) {
          const results = await search.search(trimmedQuery);
          if (!isUnmounted()) {
            setResults(results);
          }
        } else {
          setResults(undefined);
        }
      },
      [search, isUnmounted]
    );
  const handleClear = useCallback(() => {
    setQuery("");
    setResults(undefined);
  }, [setQuery, setResults]);
  // Width of the sidebar tabs. Perhaps we can restructure the DOM?
  const sidebarWidth = useRef<HTMLDivElement>(null);
  const offset = faceLogoRef.current
    ? faceLogoRef.current.getBoundingClientRect().right + 14
    : 0;
  const width = sidebarWidth.current
    ? sidebarWidth.current!.clientWidth - offset - 14 + "px"
    : undefined;
  return (
    <>
      {/* Empty box used to calculate width only. */}
      <Box ref={sidebarWidth}></Box>
      {flags.search && (
        <Modal
          isOpen={searchModal.isOpen}
          onClose={searchModal.onClose}
          size="lg"
        >
          <ModalOverlay>
            <ModalContent
              mt={3.5}
              ml={offset + "px"}
              width={width}
              containerProps={{
                justifyContent: "flex-start",
              }}
              p={1}
              borderRadius="20px"
              maxWidth="unset"
              maxHeight="unset"
            >
              <ModalBody p={0}>
                <SearchDialog
                  onClose={searchModal.onClose}
                  results={results}
                  query={query}
                  onQueryChange={handleQueryChange}
                  onClear={handleClear}
                />
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        </Modal>
      )}
      <Flex
        ref={ref}
        backgroundColor="brand.500"
        boxShadow="0px 4px 16px #00000033"
        zIndex={3}
        height={searchModal.isOpen ? "5.5rem" : topBarHeight}
        alignItems="center"
        justifyContent="space-between"
        pr={4}
        transition="height .2s"
      >
        <Link
          display="block"
          href="https://microbit.org/code/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={intl.formatMessage({ id: "visit-dot-org" })}
        >
          <HStack spacing={3.5} pl={4} pr={4}>
            <Box width="3.56875rem" color="white" role="img" ref={faceLogoRef}>
              {brand.squareLogo}
            </Box>
            {!query && (
              <Box width="9.098rem" role="img" color="white">
                {brand.horizontalLogo}
              </Box>
            )}
          </HStack>
        </Link>
        {flags.search && !query && (
          <Button
            aria-label="Open search"
            onClick={searchModal.onOpen}
            backgroundColor="#5c40a6"
            fontWeight="normal"
            color="#fffc"
            leftIcon={<Box as={RiSearch2Line} fontSize="lg" color="fff" />}
            fontSize="sm"
            _hover={{}}
            _active={{}}
            border="unset"
            textAlign="left"
            pl={3}
            pr={20}
          >
            Search
          </Button>
        )}
        {flags.search && query && (
          <Flex
            backgroundColor="white"
            borderRadius="3xl"
            width={`calc(100% - ${offset}px)`}
            position="relative"
          >
            <Button
              _active={{}}
              _hover={{}}
              border="unset"
              color="gray.800"
              flex={1}
              fontSize="md"
              fontWeight="normal"
              justifyContent="flex-start"
              leftIcon={
                <Box as={RiSearch2Line} fontSize="lg" color="#838383" />
              }
              onClick={searchModal.onOpen}
              overflow="hidden"
            >
              {query}
            </Button>
            <IconButton
              aria-label="Clear"
              backgroundColor="white"
              // Also used for Zoom, move to theme.
              color="#838383"
              fontSize="2xl"
              icon={<RiCloseLine />}
              isRound={false}
              onClick={handleClear}
              position="absolute"
              right="0"
              pr={3}
              pl={3}
              variant="ghost"
            />
          </Flex>
        )}
      </Flex>
    </>
  );
};

export default SideBarHeader;