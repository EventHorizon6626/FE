/* eslint-disable */
import React from 'react';
import {
  Flex,
  Link,
  List,
  ListItem,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

export default function Footer() {
  const textColor = useColorModeValue('gray.500', 'gray.400');
  const linkColor = useColorModeValue('gray.600', 'gray.300');
  const accentColor = useColorModeValue('brand.600', 'brand.300');
  const year = new Date().getFullYear();

  return (
    <Flex
      zIndex="3"
      flexDirection={{ base: 'column', lg: 'row' }}
      alignItems={{ base: 'center', xl: 'start' }}
      justifyContent="space-between"
      px={{ base: '30px', md: '0px' }}
      pb="30px"
    >
      {/* Left text */}
      <Text
        color={textColor}
        textAlign={{ base: 'center', xl: 'start' }}
        mb={{ base: '20px', lg: '0px' }}
        fontSize="sm"
      >
        © {year}{' '}
        <Text as="span" fontWeight="500" ms="4px">
          Event Horizon. All rights reserved.
        </Text>
      </Text>

      {/* Right links */}
      <List display="flex" flexWrap="wrap" justifyContent="center">
        <ListItem
          me={{ base: '20px', md: '44px' }}
          mb={{ base: '8px', lg: '0px' }}
        >
          <Link
            fontWeight="500"
            color={linkColor}
            _hover={{ color: accentColor }}
            href="mailto:support@eventhorizon.ai"
          >
            Support
          </Link>
        </ListItem>
        <ListItem
          me={{ base: '20px', md: '44px' }}
          mb={{ base: '8px', lg: '0px' }}
        >
          <Link
            fontWeight="500"
            color={linkColor}
            _hover={{ color: accentColor }}
            href="/terms"
          >
            Terms
          </Link>
        </ListItem>
        <ListItem
          me={{ base: '20px', md: '44px' }}
          mb={{ base: '8px', lg: '0px' }}
        >
          <Link
            fontWeight="500"
            color={linkColor}
            _hover={{ color: accentColor }}
            href="/privacy"
          >
            Privacy
          </Link>
        </ListItem>
        <ListItem>
          <Link
            fontWeight="500"
            color={linkColor}
            _hover={{ color: accentColor }}
            href="https://github.com/huyphamdev"
            target="_blank"
          >
            GitHub
          </Link>
        </ListItem>
      </List>
    </Flex>
  );
}
