/* eslint-disable */
import React from 'react';
import { NavLink, useSearchParams, useNavigate } from 'react-router-dom';

// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
  Image,
} from '@chakra-ui/react';

// Assets
import { FcGoogle } from 'react-icons/fc';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';

// Auth + API
import { useAuth } from 'context/AuthContext';
import api from 'lib/api';

function SignIn() {
  // Clean white theme colors (Perplexity style)
  const textColor = '#1F2937';
  const textColorSecondary = 'gray.600';
  const brandColor = 'teal.600';

  // State
  const [show, setShow] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  // Router / Auth
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const next = sp.get('next') || '/';

  const { login } = useAuth();

  const handleClick = () => setShow((s) => !s);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(next, { replace: true });
    } catch (err) {
      const msg = err?.message || 'Login failed';
      if (/invalid/i.test(msg)) setError('Invalid email or password');
      else if (/locked|attempts/i.test(msg))
        setError('Too many attempts. Try later.');
      else setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogle = () => {
    const base = api?.defaults?.baseURL || '/api';
    const url = `${base}/auth/google/start?next=${encodeURIComponent(next)}`;
    window.location.href = url;
  };

  return (
    <Flex
      w="100vw"
      h="100vh"
      bg="#FAFAFA"
      align="center"
      justify="center"
      position="relative"
    >
      {/* Main container */}
      <Box
        maxW="420px"
        w="full"
        px="20px"
        position="relative"
        zIndex="1"
      >
        {/* Logo and Title */}
        <VStack spacing="24px" mb="40px" align="center">
          <Image src="/logo.svg" alt="Event Horizon" h="48px" w="48px" />
          <VStack spacing="8px">
            <Text
              fontSize="32px"
              fontWeight="400"
              color={textColor}
              letterSpacing="-0.02em"
            >
              Event Horizon
            </Text>
            <Text
              fontSize="15px"
              color={textColorSecondary}
              fontWeight="400"
            >
              Sign in to your account
            </Text>
          </VStack>
        </VStack>

        {/* Error message */}
        {error && (
          <Box
            mb="20px"
            p="12px"
            bg="red.50"
            borderRadius="8px"
            border="1px solid"
            borderColor="red.200"
          >
            <Text fontSize="sm" color="red.700" textAlign="center">
              {error}
            </Text>
          </Box>
        )}

        {/* Sign in form */}
        <VStack
          as="form"
          onSubmit={onSubmit}
          spacing="16px"
          bg="white"
          p="32px"
          borderRadius="12px"
          border="1px solid"
          borderColor="gray.200"
        >
          {/* Google Sign In */}
          <Button
            w="full"
            h="48px"
            bg="white"
            color={textColor}
            fontWeight="500"
            fontSize="15px"
            border="1px solid"
            borderColor="gray.300"
            borderRadius="8px"
            _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
            _active={{ bg: 'gray.100' }}
            transition="all 0.2s"
            onClick={onGoogle}
            isDisabled={submitting}
            leftIcon={<Icon as={FcGoogle} w="20px" h="20px" />}
          >
            Continue with Google
          </Button>

          {/* Divider */}
          <Flex align="center" w="full" my="8px">
            <Box flex="1" h="1px" bg="gray.200" />
            <Text
              px="12px"
              fontSize="13px"
              color={textColorSecondary}
              fontWeight="500"
            >
              or
            </Text>
            <Box flex="1" h="1px" bg="gray.200" />
          </Flex>

          {/* Email input */}
          <FormControl>
            <FormLabel
              fontSize="14px"
              fontWeight="500"
              color={textColor}
              mb="8px"
            >
              Email
            </FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              fontSize="15px"
              h="48px"
              bg="white"
              border="1px solid"
              borderColor="gray.300"
              borderRadius="8px"
              _hover={{ borderColor: 'gray.400' }}
              _focus={{ borderColor: brandColor, boxShadow: 'none' }}
              isDisabled={submitting}
            />
          </FormControl>

          {/* Password input */}
          <FormControl>
            <FormLabel
              fontSize="14px"
              fontWeight="500"
              color={textColor}
              mb="8px"
            >
              Password
            </FormLabel>
            <InputGroup>
              <Input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                fontSize="15px"
                h="48px"
                bg="white"
                border="1px solid"
                borderColor="gray.300"
                borderRadius="8px"
                _hover={{ borderColor: 'gray.400' }}
                _focus={{ borderColor: brandColor, boxShadow: 'none' }}
                isDisabled={submitting}
              />
              <InputRightElement h="48px">
                <Icon
                  as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  color={textColorSecondary}
                  cursor="pointer"
                  onClick={handleClick}
                  w="20px"
                  h="20px"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* Submit button */}
          <Button
            type="submit"
            w="full"
            h="48px"
            bg={brandColor}
            color="white"
            fontWeight="600"
            fontSize="15px"
            borderRadius="8px"
            _hover={{ bg: 'teal.700' }}
            _active={{ bg: 'teal.800' }}
            transition="all 0.2s"
            isLoading={submitting}
            isDisabled={!email || !password}
            mt="8px"
          >
            Sign in
          </Button>

          {/* Sign up link */}
          <Text
            fontSize="14px"
            color={textColorSecondary}
            textAlign="center"
            mt="16px"
          >
            Don't have an account?{' '}
            <NavLink to={`/auth/sign-up?next=${encodeURIComponent(next)}`}>
              <Text
                as="span"
                color={brandColor}
                fontWeight="600"
                _hover={{ textDecoration: 'underline' }}
              >
                Sign up
              </Text>
            </NavLink>
          </Text>
        </VStack>

        {/* Footer text */}
        <Text
          fontSize="13px"
          color={textColorSecondary}
          textAlign="center"
          mt="32px"
        >
          © 2026 Event Horizon
        </Text>
      </Box>
    </Flex>
  );
}

export default SignIn;
