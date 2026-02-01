import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  VStack
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  MdApps,
  MdAttachFile,
  MdFileDownload,
  MdLanguage,
  MdMic,
  MdPerson,
  MdSearch,
  MdTrendingUp,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const SidebarItem = ({ icon, label, onClick }) => {
  return (
    <VStack
      as="button"
      spacing="4px"
      py="12px"
      px="8px"
      cursor="pointer"
      color="gray.600"
      _hover={{ color: 'gray.900', bg: 'gray.50' }}
      borderRadius="8px"
      transition="all 0.2s"
      onClick={onClick}
      w="full"
    >
      <Icon as={icon} boxSize="20px" />
      <Text fontSize="11px" fontWeight="500">
        {label}
      </Text>
    </VStack>
  );
};

const QuickActionButton = ({ icon, label, onClick }) => {
  return (
    <Button
      leftIcon={icon ? <Icon as={icon} boxSize="16px" /> : null}
      size="sm"
      variant="outline"
      borderRadius="full"
      px="16px"
      py="10px"
      h="auto"
      fontSize="13px"
      fontWeight="500"
      color="gray.700"
      borderColor="gray.300"
      bg="white"
      _hover={{
        bg: 'gray.50',
        borderColor: 'gray.400',
      }}
      onClick={onClick}
    >
      {label}
    </Button>
  );
};

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate('/portfolio', { state: { query: searchQuery } });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleQuickAction = (action) => {
    setSearchQuery(action);
  };

  return (
    <Flex minH="100vh" bg="#FAFAFA">
      {/* Left Sidebar */}
      <Box
        w="68px"
        borderRight="1px solid"
        borderColor="gray.200"
        bg="white"
        position="fixed"
        h="100vh"
        left="0"
        top="0"
        zIndex="10"
      >
        <VStack spacing="0" h="full" justify="space-between" py="16px">
          {/* Top Section */}
          <VStack spacing="4px" w="full" px="8px">
            {/* Logo */}
            <Box mb="12px" cursor="pointer" onClick={() => navigate('/')}>
              <Image src="/logo.svg" alt="Event Horizon" h="28px" w="28px" />
            </Box>

            <SidebarItem
              icon={MdTrendingUp}
              label="Portfolio"
              onClick={() => navigate('/portfolio')}
            />
          </VStack>

          {/* Bottom Section */}
          <VStack spacing="4px" w="full" px="8px">
            <SidebarItem
              icon={MdPerson}
              label="Account"
              onClick={() => navigate('/profile')}
            />
            <SidebarItem icon={MdFileDownload} label="Install" onClick={() => {}} />
          </VStack>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex="1" ml="68px">
        <Container maxW="container.md" pt="20vh">
          <VStack spacing="32px" align="center">
            {/* Brand Name */}
            <Text
              fontSize="48px"
              fontWeight="400"
              color="#1F2937"
              letterSpacing="-0.02em"
            >
              Event Horizon
            </Text>

            {/* Search Box */}
            <Box w="full" maxW="700px">
              <InputGroup size="lg">
                <InputLeftElement h="56px" pl="12px">
                  <Icon as={MdSearch} boxSize="20px" color="gray.400" />
                </InputLeftElement>

                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything. Type @ for mentions and / for shortcuts."
                  bg="white"
                  border="1px solid"
                  borderColor="gray.300"
                  color="gray.900"
                  fontSize="15px"
                  h="56px"
                  pl="48px"
                  pr="180px"
                  borderRadius="12px"
                  _placeholder={{
                    color: 'gray.400',
                  }}
                  _hover={{
                    borderColor: 'gray.400',
                  }}
                  _focus={{
                    borderColor: 'gray.500',
                    boxShadow: 'none',
                  }}
                />

                <InputRightElement h="56px" w="auto" pr="8px">
                  <HStack spacing="4px">
                    <IconButton
                      icon={<MdAttachFile />}
                      size="sm"
                      variant="ghost"
                      color="gray.500"
                      borderRadius="6px"
                      aria-label="Attach file"
                    />
                    <IconButton
                      icon={<MdLanguage />}
                      size="sm"
                      variant="ghost"
                      color="gray.500"
                      borderRadius="6px"
                      aria-label="Language"
                    />
                    <IconButton
                      icon={<MdApps />}
                      size="sm"
                      variant="ghost"
                      color="gray.500"
                      borderRadius="6px"
                      aria-label="Apps"
                    />
                    <IconButton
                      icon={<MdMic />}
                      size="sm"
                      variant="ghost"
                      color="gray.500"
                      borderRadius="6px"
                      aria-label="Voice input"
                    />
                    <IconButton
                      icon={<MdSearch />}
                      size="sm"
                      bg="teal.600"
                      color="white"
                      borderRadius="6px"
                      aria-label="Search"
                      _hover={{ bg: 'teal.700' }}
                      onClick={handleSearch}
                      isDisabled={!searchQuery.trim()}
                    />
                  </HStack>
                </InputRightElement>
              </InputGroup>
            </Box>

            {/* Quick Actions */}
            <HStack spacing="8px" flexWrap="wrap" justify="center">
              <QuickActionButton
                label="Analyze Stock"
                onClick={() => handleQuickAction('Analyze AAPL stock')}
              />
              <QuickActionButton
                label="Portfolio Tips"
                onClick={() =>
                  handleQuickAction('Give me portfolio diversification tips')
                }
              />
              <QuickActionButton
                label="Latest News"
                onClick={() => handleQuickAction('Latest market news')}
              />
              <QuickActionButton
                label="Market Trends"
                onClick={() => handleQuickAction('Current market trends')}
              />
              <QuickActionButton
                label="Compare Stocks"
                onClick={() => handleQuickAction('Compare AAPL vs MSFT')}
              />
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Flex>
  );
}
