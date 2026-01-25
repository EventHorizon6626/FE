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
  useColorModeValue,
} from '@chakra-ui/react';

// Custom components
import { APPLogo } from 'components/icons/Icons';

// Assets
import { FcGoogle } from 'react-icons/fc';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';

// Auth + API
import { useAuth } from 'context/AuthContext';
import api from 'lib/api';

function SignIn() {
  // Chakra color mode
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = useColorModeValue('gray.500', 'gray.400');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const googleBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const googleText = useColorModeValue('navy.700', 'white');

  // State
  const [show, setShow] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  // Router / Auth
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const next = sp.get('next') || '/'; // bạn nói dashboard là '/', nên để mặc định là '/'

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
    // chuyển hướng sang BE để start OAuth
    const base = api?.defaults?.baseURL || '/api';
    const url = `${base}/auth/google/start?next=${encodeURIComponent(next)}`;
    window.location.href = url;
  };

  return (
    <Flex
      w="100vw"
      h="100vh"
      bg={useColorModeValue('gray.50', '#0A0A0A')}
      align="center"
      justify="center"
      position="relative"
      overflow="hidden"
    >
      {/* Pixel art background grid */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity="0.03"
        backgroundImage={`
          linear-gradient(${useColorModeValue('#000', '#fff')} 1px, transparent 1px),
          linear-gradient(90deg, ${useColorModeValue('#000', '#fff')} 1px, transparent 1px)
        `}
        backgroundSize="20px 20px"
        pointerEvents="none"
      />

      {/* Main container */}
      <Box
        maxW="400px"
        w="full"
        px="20px"
        position="relative"
        zIndex="1"
      >
        {/* Logo and Title */}
        <VStack spacing="20px" mb="40px">
          <APPLogo
            h="120px"
            w="120px"
            color={useColorModeValue('navy.700', 'white')}
          />
          <VStack spacing="5px">
            <Text
              fontSize="2xl"
              fontWeight="900"
              color={textColor}
              letterSpacing="3px"
              fontFamily="monospace"
              textTransform="uppercase"
            >
              EVENT HORIZON
            </Text>
            <Text
              fontSize="xs"
              color={textColorSecondary}
              letterSpacing="1px"
              fontFamily="monospace"
            >
              AI-POWERED PORTFOLIO ANALYSIS
            </Text>
          </VStack>
        </VStack>

        {/* Error message */}
        {error && (
          <Box
            mb="20px"
            p="10px"
            bg="red.500"
            borderRadius="4px"
            border="2px solid"
            borderColor="red.600"
          >
            <Text fontSize="xs" color="white" fontFamily="monospace" textAlign="center">
              {error}
            </Text>
          </Box>
        )}

        {/* Sign in form */}
        <VStack
          as="form"
          onSubmit={onSubmit}
          spacing="15px"
          bg={useColorModeValue('white', 'navy.900')}
          p="25px"
          borderRadius="8px"
          border="2px solid"
          borderColor={useColorModeValue('gray.200', 'whiteAlpha.200')}
          boxShadow={useColorModeValue('0 4px 0 0 #e2e8f0', '0 4px 0 0 rgba(255,255,255,0.1)')}
        >
          {/* Google Sign In */}
          <Button
            w="full"
            h="45px"
            bg={googleBg}
            color={googleText}
            fontWeight="600"
            fontSize="xs"
            fontFamily="monospace"
            letterSpacing="1px"
            border="2px solid"
            borderColor={useColorModeValue('gray.300', 'whiteAlpha.300')}
            borderRadius="4px"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            _active={{ transform: 'translateY(0)' }}
            transition="all 0.15s"
            onClick={onGoogle}
            isDisabled={submitting}
            leftIcon={<Icon as={FcGoogle} w="18px" h="18px" />}
          >
            SIGN IN WITH GOOGLE
          </Button>

          {/* Divider */}
          <Flex align="center" w="full" my="5px">
            <Box flex="1" h="2px" bg={useColorModeValue('gray.200', 'whiteAlpha.200')} />
            <Text
              px="10px"
              fontSize="2xs"
              color={textColorSecondary}
              fontFamily="monospace"
              fontWeight="700"
            >
              OR
            </Text>
            <Box flex="1" h="2px" bg={useColorModeValue('gray.200', 'whiteAlpha.200')} />
          </Flex>

          {/* Email input */}
          <FormControl>
            <FormLabel
              fontSize="2xs"
              fontWeight="700"
              color={textColor}
              mb="6px"
              fontFamily="monospace"
              letterSpacing="1px"
            >
              EMAIL
            </FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              fontSize="sm"
              fontFamily="monospace"
              h="45px"
              bg={useColorModeValue('gray.50', 'navy.800')}
              border="2px solid"
              borderColor={useColorModeValue('gray.200', 'whiteAlpha.200')}
              borderRadius="4px"
              _hover={{ borderColor: brandColor }}
              _focus={{ borderColor: brandColor, boxShadow: 'none' }}
              isDisabled={submitting}
            />
          </FormControl>

          {/* Password input */}
          <FormControl>
            <FormLabel
              fontSize="2xs"
              fontWeight="700"
              color={textColor}
              mb="6px"
              fontFamily="monospace"
              letterSpacing="1px"
            >
              PASSWORD
            </FormLabel>
            <InputGroup>
              <Input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                fontSize="sm"
                fontFamily="monospace"
                h="45px"
                bg={useColorModeValue('gray.50', 'navy.800')}
                border="2px solid"
                borderColor={useColorModeValue('gray.200', 'whiteAlpha.200')}
                borderRadius="4px"
                _hover={{ borderColor: brandColor }}
                _focus={{ borderColor: brandColor, boxShadow: 'none' }}
                isDisabled={submitting}
              />
              <InputRightElement h="45px">
                <Icon
                  as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  color={textColorSecondary}
                  cursor="pointer"
                  onClick={handleClick}
                  w="18px"
                  h="18px"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* Submit button */}
          <Button
            type="submit"
            w="full"
            h="45px"
            bg={brandColor}
            color="white"
            fontWeight="700"
            fontSize="xs"
            fontFamily="monospace"
            letterSpacing="1px"
            border="2px solid"
            borderColor={useColorModeValue('brand.600', 'brand.500')}
            borderRadius="4px"
            boxShadow={useColorModeValue('0 4px 0 0 #3182ce', '0 4px 0 0 #63b3ed')}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            _active={{ transform: 'translateY(0)', boxShadow: 'none' }}
            transition="all 0.15s"
            isLoading={submitting}
            isDisabled={!email || !password}
          >
            SIGN IN
          </Button>

          {/* Sign up link */}
          <Text
            fontSize="2xs"
            color={textColorSecondary}
            fontFamily="monospace"
            textAlign="center"
            mt="10px"
          >
            NEW USER?{' '}
            <NavLink to={`/auth/sign-up?next=${encodeURIComponent(next)}`}>
              <Text as="span" color={brandColor} fontWeight="700" _hover={{ textDecoration: 'underline' }}>
                CREATE ACCOUNT
              </Text>
            </NavLink>
          </Text>
        </VStack>

        {/* Footer text */}
        <Text
          fontSize="3xs"
          color={textColorSecondary}
          textAlign="center"
          mt="20px"
          fontFamily="monospace"
          letterSpacing="1px"
        >
          © 2026 EVENT HORIZON
        </Text>
      </Box>
    </Flex>
  );
}

export default SignIn;
