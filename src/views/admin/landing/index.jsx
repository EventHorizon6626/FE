import {
  Button,
  Container,
  HStack,
  Icon,
  IconButton,
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
  MdLanguage,
  MdMic,
  MdSearch,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

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
        <InputGroup size="lg" w="full" maxW="700px">
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
  );
}
