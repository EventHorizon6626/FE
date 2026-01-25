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
  const accentColor = useColorModeValue('brand.600', 'brand.300');

  const year = new Date().getFullYear();

  return (
    <Flex
      zIndex="3"
      flexDirection={{ base: 'column', xl: 'row' }}
      alignItems={{ base: 'center', xl: 'start' }}
      justifyContent="space-between"
      px={{ base: '30px', md: '50px' }}
      pb="30px"
    >
      {/* Left text */}
      <Text
        color={textColor}
        textAlign={{ base: 'center', xl: 'start' }}
        mb={{ base: '20px', xl: '0px' }}
        fontSize="sm"
      >
        © {year}
        <Text as="span" fontWeight="500" ms="4px">
          Event Horizon. All rights reserved.
        </Text>
      </Text>

      {/* Right links */}
      <List display="flex" alignItems="center" gap={{ base: 4, md: 8 }}>
        <ListItem>
          <Link
            fontWeight="500"
            color={textColor}
            _hover={{ color: accentColor }}
            href="mailto:support@eventhorizon.ai"
          >
            Support
          </Link>
        </ListItem>
        <ListItem>
          <Link
            fontWeight="500"
            color={textColor}
            _hover={{ color: accentColor }}
            href="/terms"
          >
            Terms
          </Link>
        </ListItem>
        <ListItem>
          <Link
            fontWeight="500"
            color={textColor}
            _hover={{ color: accentColor }}
            href="/privacy"
          >
            Privacy
          </Link>
        </ListItem>
        <ListItem>
          <Link
            fontWeight="500"
            color={textColor}
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
