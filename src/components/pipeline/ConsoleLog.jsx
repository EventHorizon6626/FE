import {
  Box,
  HStack,
  Icon,
  IconButton,
  Text,
  Tooltip,
  VStack
} from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from 'react';
import { MdDelete, MdTerminal } from 'react-icons/md';

const ConsoleLog = forwardRef((props, ref) => {
  const [logEntries, setLogEntries] = useState([]);
  const logBodyRef = useRef(null);

  // Expose addLog function to parent via ref
  useImperativeHandle(ref, () => ({
    addLog: (level, message) => {
      console.log('[ConsoleLog] addLog called:', level, message);
      setLogEntries(prev => {
        const newLog = {
          id: Date.now() + Math.random(),
          timestamp: new Date(),
          level: level, // 'info', 'success', 'warn', 'error'
          message: message
        };
        console.log('[ConsoleLog] Adding log entry:', newLog);
        return [...prev, newLog];
      });
    },
    clearLogs: () => {
      setLogEntries([]);
    }
  }));

  // Auto-scroll to bottom when new log is added
  useEffect(() => {
    if (logBodyRef.current) {
      logBodyRef.current.scrollTop = logBodyRef.current.scrollHeight;
    }
  }, [logEntries]);

  return (
    <Box
      position="absolute"
      bottom="20px"
      right="20px"
      w="500px"
      h="300px"
      bg="white"
      boxShadow="xl"
      zIndex="15"
      borderRadius="12px"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.200"
      display="flex"
      flexDirection="column"
    >
      {/* Log Header */}
      <HStack
        px="16px"
        py="8px"
        bg="gray.50"
        borderBottom="1px solid"
        borderColor="gray.200"
        justify="space-between"
      >
        <HStack spacing="10px">
          <Icon as={MdTerminal} color="teal.500" boxSize="20px" />
        </HStack>
        <HStack spacing="2">
          <Tooltip label="Clear logs" placement="left">
            <IconButton
              icon={<Icon as={MdDelete} />}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              color="gray.500"
              _hover={{ color: 'red.500', bg: 'gray.100' }}
              aria-label="Clear logs"
              onClick={() => setLogEntries([])}
            />
          </Tooltip>
        </HStack>
      </HStack>

      {/* Log Body */}
      <Box
        ref={logBodyRef}
        flex="1"
        overflowY="auto"
        p="12px"
        fontSize="xs"
        fontFamily="mono"
        bg="gray.25"
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f7fafc',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e0',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a0aec0',
          },
        }}
      >
        {logEntries.length === 0 ? (
          <Text color="gray.400" fontSize="sm" textAlign="center" mt="40px">
            No logs yet...
          </Text>
        ) : (
          <VStack spacing="4px" align="stretch">
            {logEntries.map((log) => (
              <Box
                key={log.id}
                p="2px 4px"
                borderRadius="6px"
                bg="white"
                border="1px solid"
                borderColor="gray.100"
                _hover={{ bg: 'gray.50', borderColor: 'gray.200' }}
                transition="all 0.2s"
              >
                <Text
                  color={
                    log.level === 'error'
                      ? 'red.600'
                      : log.level === 'warn'
                        ? 'orange.600'
                        : log.level === 'success'
                          ? 'green.600'
                          : 'gray.700'
                  }
                  fontSize="11px"
                  wordBreak="break-word"
                  fontWeight="500"
                >
                  {log.message}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
});

ConsoleLog.displayName = 'ConsoleLog';

export default ConsoleLog;
