// Chakra Imports
import {
  Box,
  Button,
  Flex,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';

// Custom Components

// Assets
import { FiPlus } from 'react-icons/fi';

import { useAuth } from 'context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { USDTIcon } from 'components/icons/Icons';

const BalancePill = ({}) => {
  const user = useAuth()?.user || {};
  const balanceVndRaw = user?.wallet?.vnd?.available ?? user?.balanceVnd ?? 0;
  const navigate = useNavigate();

  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)',
  );

  const vndText = balanceVndRaw;
  return (
    <Flex
      align="center"
      gap="8px"
      ms="6px"
      me="10px"
      bg={useColorModeValue('gray.50', 'whiteAlpha.100')}
      border="1px solid"
      borderColor={useColorModeValue('#E6ECFA', 'whiteAlpha.200')}
      borderRadius="30px"
      px="10px"
      py="6px"
      boxShadow={shadow}
    >
      <Box
        as={Button}
        onClick={() => navigate('/profile?tab=balance')}
        // leftIcon={<FiWallet />}
        size="sm"
        variant="ghost"
        colorScheme="gray"
        borderRadius="20px"
        px="10px"
      >
        {vndText} VND / 10 <USDTIcon ml="4px" h="16px" w="16px" />
      </Box>
      <IconButton
        onClick={() => navigate('/profile?tab=balance')}
        size="sm"
        icon={<FiPlus />}
        colorScheme="green"
        borderRadius="20px"
      />
    </Flex>
  );
};
export default BalancePill;
