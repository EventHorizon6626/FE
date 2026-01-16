// src/views/admin/profile/components/BalanceCardDual.jsx
/* eslint-disable */
import React from 'react';
import {
  Box,
  Flex,
  Icon,
  Progress,
  Text,
  Button,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';

import Card from 'components/card/Card';
import IconBox from 'components/icons/IconBox';
import Menu from 'components/menu/MainMenu';

import { FiCreditCard } from 'react-icons/fi';
import { FaDollarSign } from 'react-icons/fa';

import { useAuth } from 'context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { USDTIcon } from 'components/icons/Icons';

// Helpers
const vnd = (n) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(
    Number(n) || 0,
  );

const usd = (n) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

export default function BalanceCardDual({
  limitVnd = 10000000,
  limitUsdt = 5000,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const balanceVnd = user?.wallet?.vnd?.available ?? 0;
  const balanceUsdt = user?.wallet?.usdt?.available ?? 0;

  const pctVnd = Math.min(100, (balanceVnd / limitVnd) * 100);
  const pctUsdt = Math.min(100, (balanceUsdt / limitUsdt) * 100);

  // Colors
  const textPrimary = useColorModeValue('secondaryGray.900', 'white');
  const textSecondary = useColorModeValue('gray.500', 'gray.400');
  const brandColor = useColorModeValue('brand.500', 'white');
  const cardBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');

  return (
    <Card mb={{ base: '0px', lg: '20px' }} align="center">
      {/* <Flex w="100%">
        <Menu ms="auto" />
      </Flex> */}

      <IconBox
        mx="auto"
        h="80px"
        w="80px"
        icon={<Icon as={FiCreditCard} color={brandColor} h="40px" w="40px" />}
        bg={cardBg}
      />

      <Text fontWeight="bold" fontSize="2xl" color={textPrimary} mt="10px">
        Wallet Balances
      </Text>

      <Text color={textSecondary} fontSize="md" mt="4px">
        Your available funds across multiple currencies
      </Text>

      <Box w="100%" mt="25px" px="10px">
        {/* ===== VND ===== */}
        <Box mb="30px">
          <Flex align="center" mb="8px">
            <Icon as={FiCreditCard} color={brandColor} mr="8px" />
            <Text fontSize="lg" fontWeight="700" color={textPrimary}>
              VND Wallet
            </Text>
          </Flex>

          <Flex justify="space-between" mb="6px">
            <Text fontSize="sm" color={textSecondary}>
              Available
            </Text>
            <Text fontSize="sm" color={textSecondary}>
              Daily limit
            </Text>
          </Flex>

          <Flex justify="space-between" mb="10px">
            <Text fontSize="xl" fontWeight="700" color={brandColor}>
              0 VND
            </Text>
            <Text color={textSecondary} fontWeight="500">
              {limitVnd} VND
            </Text>
          </Flex>

          <Progress
            value={pctVnd}
            colorScheme="brandScheme"
            borderRadius="full"
            mb="16px"
          />
        </Box>

        <Divider />

        {/* ===== USDT ===== */}
        <Box mt="25px">
          <Flex align="center" mb="8px">
            <Text fontSize="lg" fontWeight="700" color={textPrimary}>
              Crypto Wallet
            </Text>
          </Flex>

          <Flex justify="space-between" mb="6px">
            <Text fontSize="sm" color={textSecondary}>
              Available
            </Text>
            <Text fontSize="sm" color={textSecondary}>
              Daily limit
            </Text>
          </Flex>

          <Flex justify="space-between" mb="10px">
            <Text fontSize="xl" fontWeight="700" color={brandColor}>
              {usd(balanceUsdt)}
              <USDTIcon ml="4px" h="16px" w="16px" />
            </Text>
            <Text color={textSecondary} fontWeight="500">
              {usd(limitUsdt)}
              <USDTIcon ml="4px" h="16px" w="16px" />
            </Text>
          </Flex>

          <Progress
            value={pctUsdt}
            colorScheme="brandScheme"
            borderRadius="full"
            mb="16px"
          />
        </Box>

        {/* ===== One single button ===== */}
        <Button
          mt="20px"
          w="100%"
          variant="brand"
          onClick={() => navigate('/profile?tab=balance')}
        >
          Add Balance
        </Button>
      </Box>
    </Card>
  );
}
