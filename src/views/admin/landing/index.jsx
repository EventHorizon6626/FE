import {
  Box,
  Button,
  Container,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
  Spinner,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertDescription,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  MdApps,
  MdAttachFile,
  MdLanguage,
  MdMic,
  MdSearch,
  MdOpenInNew,
  MdCheckCircle,
} from 'react-icons/md';
import { webSearch, financialSearch, stockSearch, marketTrendsSearch } from 'lib/searchApi';

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

const SearchResult = ({ result, index }) => {
  return (
    <Box
      p="16px"
      borderRadius="12px"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      _hover={{ borderColor: 'teal.300', shadow: 'sm' }}
      transition="all 0.2s"
    >
      <HStack justify="space-between" align="start" mb="8px">
        <Text fontSize="sm" fontWeight="600" color="gray.900" flex="1">
          {result.title}
        </Text>
        {result.score && (
          <Badge colorScheme="teal" fontSize="xs">
            {(result.score * 100).toFixed(0)}%
          </Badge>
        )}
      </HStack>

      <Link href={result.url} isExternal>
        <HStack spacing="4px" mb="8px">
          <Text fontSize="xs" color="teal.600" isTruncated maxW="500px">
            {result.url}
          </Text>
          <Icon as={MdOpenInNew} boxSize="12px" color="teal.600" />
        </HStack>
      </Link>

      {result.snippet && (
        <Text fontSize="sm" color="gray.600" noOfLines={3}>
          {result.snippet}
        </Text>
      )}

      {result.publishedDate && (
        <Text fontSize="xs" color="gray.400" mt="8px">
          Published: {new Date(result.publishedDate).toLocaleDateString()}
        </Text>
      )}
    </Box>
  );
};

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResults(null);

    try {
      const response = await webSearch(searchQuery, 8, true);

      if (response.success) {
        setSearchResults(response.data);
      } else {
        setError(response.error || 'Search failed. Please try again.');
      }
    } catch (err) {
      console.error('[Landing] Search error:', err);
      setError(err.message || 'Unable to perform search. Please check your connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleQuickAction = async (action, searchFn = null) => {
    setSearchQuery(action);
    setIsSearching(true);
    setError(null);
    setSearchResults(null);

    try {
      const response = searchFn ? await searchFn() : await webSearch(action, 8, true);

      if (response.success) {
        setSearchResults(response.data);
      } else {
        setError(response.error || 'Search failed. Please try again.');
      }
    } catch (err) {
      console.error('[Landing] Quick action error:', err);
      setError(err.message || 'Unable to perform search.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Container maxW="container.lg" pt={searchResults ? "10vh" : "20vh"} pb="40px">
      <VStack spacing="32px" align="center">
        {/* Brand Name */}
        {!searchResults && (
          <Text
            fontSize="48px"
            fontWeight="400"
            color="#1F2937"
            letterSpacing="-0.02em"
          >
            Event Horizon
          </Text>
        )}

        {/* Search Box */}
        <InputGroup size="lg" w="full" maxW="700px">
          <InputLeftElement h="56px" pl="12px">
            <Icon as={MdSearch} boxSize="20px" color="gray.400" />
          </InputLeftElement>

          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything about stocks, markets, or financial analysis..."
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
              borderColor: 'teal.500',
              boxShadow: '0 0 0 1px #319795',
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
                icon={isSearching ? <Spinner size="sm" /> : <MdSearch />}
                size="sm"
                bg="teal.600"
                color="white"
                borderRadius="6px"
                aria-label="Search"
                _hover={{ bg: 'teal.700' }}
                onClick={handleSearch}
                isDisabled={!searchQuery.trim() || isSearching}
              />
            </HStack>
          </InputRightElement>
        </InputGroup>

        {/* Quick Actions - Only show when no results */}
        {!searchResults && !isSearching && (
          <HStack spacing="8px" flexWrap="wrap" justify="center">
            <QuickActionButton
              label="Analyze Stock"
              onClick={() => handleQuickAction('AAPL stock analysis', () => stockSearch('AAPL'))}
            />
            <QuickActionButton
              label="Financial News"
              onClick={() => handleQuickAction('Latest financial market news', () => financialSearch('latest market news'))}
            />
            <QuickActionButton
              label="Market Trends"
              onClick={() => handleQuickAction('Current market trends 2026', () => marketTrendsSearch())}
            />
            <QuickActionButton
              label="Compare Stocks"
              onClick={() => handleQuickAction('Compare AAPL vs MSFT stock performance')}
            />
          </HStack>
        )}

        {/* Loading State */}
        {isSearching && (
          <VStack spacing="16px" w="full" mt="32px">
            <Spinner size="xl" color="teal.600" thickness="3px" />
            <Text color="gray.600" fontSize="sm">
              Searching the web...
            </Text>
          </VStack>
        )}

        {/* Error State */}
        {error && !isSearching && (
          <Alert status="error" borderRadius="12px" maxW="700px">
            <AlertIcon />
            <AlertDescription fontSize="sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Search Results */}
        {searchResults && !isSearching && (
          <VStack spacing="24px" w="full" align="stretch" mt="32px">
            {/* Answer Section (if provided by Tavily or Perplexity) */}
            {searchResults.answer && (
              <Box
                p="20px"
                borderRadius="12px"
                bg="teal.50"
                border="1px solid"
                borderColor="teal.200"
              >
                <HStack mb="12px">
                  <Icon as={MdCheckCircle} boxSize="20px" color="teal.600" />
                  <Text fontSize="sm" fontWeight="600" color="teal.900">
                    AI Answer
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.900" lineHeight="1.7">
                  {searchResults.answer}
                </Text>
              </Box>
            )}

            <Divider />

            {/* Results Header */}
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="600" color="gray.900">
                {searchResults.totalResults} Results
              </Text>
              <Badge colorScheme="teal" fontSize="xs" px="8px" py="4px" borderRadius="full">
                Powered by {searchResults.provider || 'AI Search'}
              </Badge>
            </HStack>

            {/* Results List */}
            <VStack spacing="12px" align="stretch">
              {searchResults.results.map((result, index) => (
                <SearchResult key={index} result={result} index={index} />
              ))}
            </VStack>

            {/* New Search Button */}
            <Button
              variant="outline"
              colorScheme="teal"
              size="sm"
              alignSelf="center"
              onClick={() => {
                setSearchResults(null);
                setSearchQuery('');
              }}
            >
              New Search
            </Button>
          </VStack>
        )}
      </VStack>
    </Container>
  );
}
