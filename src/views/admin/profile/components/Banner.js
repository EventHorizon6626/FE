/* eslint-disable */
import React from 'react';
import {
  Avatar,
  Box,
  Flex,
  Text,
  Stack,
  Badge,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';

import Card from 'components/card/Card.js';
import { useAuth } from 'context/AuthContext';

export default function Banner({ banner }) {
  const { user = {} } = useAuth();

  const {
    email = '',
    name = '',
    avatar = '',
    emailVerified = false,
    phone = null,
    telegram = null,
    createdAt = '',
    has2fa = false,
  } = user || {};

  const textPrimary = useColorModeValue('secondaryGray.900', 'white');
  const textSecondary = useColorModeValue('gray.400', 'gray.500');
  const bgInfo = useColorModeValue('secondaryGray.100', 'navy.700');
  const borderColor = useColorModeValue(
    'white !important',
    '#111C44 !important',
  );

  const infoRow = (label, value, actionBtn = null) => (
    <Flex justify="space-between" align="center" w="100%">
      <Text fontSize="sm" fontWeight="500" color={textSecondary}>
        {label}
      </Text>
      <Flex align="center" gap="10px">
        {typeof value === 'string' || typeof value === 'number' ? (
          <Text fontSize="sm" fontWeight="600" color={textPrimary}>
            {value}
          </Text>
        ) : (
          value
        )}
        {actionBtn}
      </Flex>
    </Flex>
  );

  return (
    <Card mb={{ base: '0px', lg: '20px' }} align="center" p="0px">
      {/* Banner Image */}
      <Box
        bg={`url(${banner})`}
        bgSize="cover"
        borderRadius="16px"
        h="131px"
        w="100%"
      />

      {/* Avatar */}
      <Avatar
        mx="auto"
        src={avatar}
        h="87px"
        w="87px"
        mt="-43px"
        border="4px solid"
        borderColor={borderColor}
      />

      {/* Name */}
      <Text color={textPrimary} fontWeight="bold" fontSize="xl" mt="10px">
        {name}
      </Text>

      {/* Email */}
      <Text color={textSecondary} fontSize="sm" mb="20px">
        {email}
      </Text>

      {/* ==== OLD STATS SECTION ==== */}
      <Flex w="max-content" mx="auto" mt="10px" mb="20px">
        <Flex mx="auto" me="60px" align="center" direction="column">
          <Text color={textPrimary} fontSize="2xl" fontWeight="700">
            2
          </Text>
          <Text color={textSecondary} fontSize="sm">
            Orders
          </Text>
        </Flex>

        <Flex mx="auto" me="60px" align="center" direction="column">
          <Text color={textPrimary} fontSize="2xl" fontWeight="700">
            5
          </Text>
          <Text color={textSecondary} fontSize="sm">
            On Processing
          </Text>
        </Flex>

        <Flex mx="auto" align="center" direction="column">
          <Text color={textPrimary} fontSize="2xl" fontWeight="700">
            12
          </Text>
          <Text color={textSecondary} fontSize="sm">
            Review
          </Text>
        </Flex>
      </Flex>

      {/* ==== NEW: ACCOUNT INFO SECTION ==== */}
      <Box w="90%" mx="auto" mb="25px" p="18px" borderRadius="16px" bg={bgInfo}>
        <Stack spacing={4}>
          {/* Email Verification */}
          {infoRow(
            'Email Verification',
            emailVerified ? (
              <Badge colorScheme="green">Verified</Badge>
            ) : (
              <Badge colorScheme="red">Unverified</Badge>
            ),
            !emailVerified ? (
              <Button size="xs" colorScheme="blue" variant="solid">
                Verify Now
              </Button>
            ) : null,
          )}

          {/* 2FA Security */}
          {infoRow(
            '2FA Security',
            <Button size="xs" colorScheme="purple" variant="outline">
              Enable 2FA
            </Button>,
          )}

          {/* Phone Number */}
          {infoRow(
            'Phone Number',
            <Button size="xs" colorScheme="blue">
              Add
            </Button>,
          )}

          {/* Telegram */}
          {infoRow(
            'Telegram',
            <Button size="xs" colorScheme="green">
              Connect
            </Button>,
          )}

          {/* Account Created */}
          {infoRow(
            'Account Created',
            createdAt
              ? new Date(createdAt).toLocaleDateString('vi-VN')
              : 'Unknown',
          )}
        </Stack>
      </Box>
    </Card>
  );
}
