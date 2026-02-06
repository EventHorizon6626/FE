// src/views/admin/profile/index.jsx
/* eslint-disable */
import React from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  HStack,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  MdPerson,
  MdEmail,
  MdVerified,
  MdSecurity,
  MdPhone,
  MdLogout,
  MdCalendarToday,
} from 'react-icons/md';
import { FaTelegram } from 'react-icons/fa';
import { useAuth } from 'context/AuthContext';

export default function Profile() {
  const { user = {}, logout } = useAuth();

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

  const InfoRow = ({ icon, label, value, action }) => (
    <HStack justify="space-between" w="full" py="12px">
      <HStack spacing="12px">
        <Icon as={icon} color="gray.500" boxSize="20px" />
        <Text fontSize="sm" color="gray.600" fontWeight="500">
          {label}
        </Text>
      </HStack>
      <HStack spacing="12px">
        {typeof value === 'string' ? (
          <Text fontSize="sm" fontWeight="600" color="gray.800">
            {value}
          </Text>
        ) : (
          value
        )}
        {action}
      </HStack>
    </HStack>
  );

  return (
    <Box h="100vh" bg="gray.50" p="40px" overflowY="auto">
      <VStack spacing="30px" maxW="800px" mx="auto">
        {/* Header */}
        <VStack align="start" spacing="5px" w="full">
          <HStack spacing="12px">
            <Icon as={MdPerson} color="teal.600" boxSize="32px" />
            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
              Account
            </Text>
          </HStack>
          <Text fontSize="md" color="gray.600">
            Manage your profile and account settings
          </Text>
        </VStack>

        {/* Profile Card */}
        <Box
          w="full"
          bg="white"
          borderRadius="16px"
          border="2px solid"
          borderColor="gray.200"
          overflow="hidden"
        >
          {/* Profile Header */}
          <Box
            bg="linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)"
            h="100px"
            position="relative"
          />

          <VStack spacing="0" px="30px" pb="30px">
            {/* Avatar */}
            <Avatar
              src={avatar}
              name={name || email}
              size="xl"
              mt="-50px"
              border="4px solid white"
              boxShadow="lg"
            />

            {/* Name & Email */}
            <Text fontSize="xl" fontWeight="bold" color="gray.800" mt="12px">
              {name || 'User'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {email}
            </Text>
          </VStack>
        </Box>

        {/* Account Info Card */}
        <Box
          w="full"
          bg="white"
          borderRadius="16px"
          border="2px solid"
          borderColor="gray.200"
          p="24px"
        >
          <Text fontSize="lg" fontWeight="600" color="gray.800" mb="16px">
            Account Information
          </Text>

          <VStack spacing="0" divider={<Divider />}>
            <InfoRow
              icon={MdEmail}
              label="Email Verification"
              value={
                emailVerified ? (
                  <Badge colorScheme="green" fontSize="xs">Verified</Badge>
                ) : (
                  <Badge colorScheme="red" fontSize="xs">Unverified</Badge>
                )
              }
              action={
                !emailVerified && (
                  <Button size="xs" colorScheme="teal" variant="outline">
                    Verify
                  </Button>
                )
              }
            />

            <InfoRow
              icon={MdSecurity}
              label="Two-Factor Auth"
              value={
                has2fa ? (
                  <Badge colorScheme="green" fontSize="xs">Enabled</Badge>
                ) : (
                  <Badge colorScheme="gray" fontSize="xs">Disabled</Badge>
                )
              }
              action={
                !has2fa && (
                  <Button size="xs" colorScheme="teal" variant="outline">
                    Enable
                  </Button>
                )
              }
            />

            <InfoRow
              icon={MdPhone}
              label="Phone Number"
              value={phone || 'Not set'}
              action={
                !phone && (
                  <Button size="xs" colorScheme="teal" variant="outline">
                    Add
                  </Button>
                )
              }
            />

            <InfoRow
              icon={FaTelegram}
              label="Telegram"
              value={telegram || 'Not connected'}
              action={
                !telegram && (
                  <Button size="xs" colorScheme="teal" variant="outline">
                    Connect
                  </Button>
                )
              }
            />

            <InfoRow
              icon={MdCalendarToday}
              label="Member Since"
              value={
                createdAt
                  ? new Date(createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Unknown'
              }
            />
          </VStack>
        </Box>

        {/* Logout Button */}
        <Button
          leftIcon={<Icon as={MdLogout} />}
          colorScheme="red"
          variant="outline"
          size="lg"
          w="full"
          onClick={logout}
        >
          Log Out
        </Button>
      </VStack>
    </Box>
  );
}
