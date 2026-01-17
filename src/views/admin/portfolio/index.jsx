import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  useColorModeValue,
  SimpleGrid,
  Checkbox,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import { MdTrendingUp } from 'react-icons/md';
import { request } from 'lib/api';

// Predefined list of popular stocks
const AVAILABLE_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive' },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financial' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare' },
  { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'DIS', name: 'Walt Disney Co.', sector: 'Communication' },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financial' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology' },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology' },
];

export default function PortfolioCreator() {
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const toast = useToast();

  // Chakra Color Mode
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const selectedStockBg = useColorModeValue('brand.50', 'brand.900');
  const preBlockBg = useColorModeValue('gray.50', 'navy.900');

  const handleStockToggle = (symbol) => {
    setSelectedStocks((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const handleSelectAll = () => {
    if (selectedStocks.length === AVAILABLE_STOCKS.length) {
      setSelectedStocks([]);
    } else {
      setSelectedStocks(AVAILABLE_STOCKS.map((stock) => stock.symbol));
    }
  };

  const handleCreatePortfolio = async () => {
    if (selectedStocks.length === 0) {
      toast({
        title: 'No stocks selected',
        description: 'Please select at least one stock to create a portfolio.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      const data = await request.post('/ai/portfolio/analyze', {
        stocks: selectedStocks,
      });

      setAnalysisResult(data);
      toast({
        title: 'Portfolio analysis complete',
        description: `Analyzed ${selectedStocks.length} stocks successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Portfolio analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: error.message || 'Failed to analyze portfolio. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const groupedStocks = AVAILABLE_STOCKS.reduce((acc, stock) => {
    if (!acc[stock.sector]) {
      acc[stock.sector] = [];
    }
    acc[stock.sector].push(stock);
    return acc;
  }, {});

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header */}
      <Flex mb="20px" align="center" justify="space-between">
        <Box>
          <Text color={textColor} fontSize="2xl" fontWeight="700">
            Create Your Portfolio
          </Text>
          <Text color={textColorSecondary} fontSize="md" mt="5px">
            Select stocks to analyze with AI-powered insights
          </Text>
        </Box>
        <Button
          variant="outline"
          colorScheme="brand"
          size="sm"
          onClick={handleSelectAll}
        >
          {selectedStocks.length === AVAILABLE_STOCKS.length
            ? 'Deselect All'
            : 'Select All'}
        </Button>
      </Flex>

      {/* Stock Selection */}
      <Card mb="20px" bg={cardBg}>
        <Text color={textColor} fontSize="lg" fontWeight="600" mb="20px">
          Available Stocks ({selectedStocks.length} selected)
        </Text>

        {Object.entries(groupedStocks).map(([sector, stocks]) => (
          <Box key={sector} mb="30px">
            <Text
              color={brandColor}
              fontSize="md"
              fontWeight="600"
              mb="10px"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              {sector}
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing="15px">
              {stocks.map((stock) => (
                <Flex
                  key={stock.symbol}
                  p="15px"
                  border="1px solid"
                  borderColor={
                    selectedStocks.includes(stock.symbol)
                      ? brandColor
                      : borderColor
                  }
                  borderRadius="10px"
                  bg={
                    selectedStocks.includes(stock.symbol)
                      ? selectedStockBg
                      : 'transparent'
                  }
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ borderColor: brandColor }}
                  onClick={() => handleStockToggle(stock.symbol)}
                  align="center"
                >
                  <Checkbox
                    isChecked={selectedStocks.includes(stock.symbol)}
                    onChange={() => handleStockToggle(stock.symbol)}
                    colorScheme="brand"
                    mr="10px"
                  />
                  <Box flex="1">
                    <Text color={textColor} fontSize="sm" fontWeight="700">
                      {stock.symbol}
                    </Text>
                    <Text
                      color={textColorSecondary}
                      fontSize="xs"
                      noOfLines={1}
                    >
                      {stock.name}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </SimpleGrid>
          </Box>
        ))}
      </Card>

      {/* Create Portfolio Button */}
      <Flex justify="center" mb="20px">
        <Button
          leftIcon={<MdTrendingUp />}
          colorScheme="brand"
          size="lg"
          onClick={handleCreatePortfolio}
          isLoading={loading}
          loadingText="Analyzing..."
          isDisabled={selectedStocks.length === 0}
          px="60px"
        >
          Create Portfolio & Analyze
        </Button>
      </Flex>

      {/* Analysis Results */}
      {loading && (
        <Card bg={cardBg}>
          <Flex align="center" justify="center" py="40px" direction="column">
            <Spinner size="xl" color={brandColor} thickness="4px" mb="20px" />
            <Text color={textColor} fontSize="lg" fontWeight="600">
              Analyzing your portfolio...
            </Text>
            <Text color={textColorSecondary} fontSize="sm" mt="5px">
              Fetching news, reports, and financial data
            </Text>
          </Flex>
        </Card>
      )}

      {analysisResult && !loading && (
        <Card bg={cardBg}>
          <Text color={textColor} fontSize="xl" fontWeight="700" mb="20px">
            Analysis Results
          </Text>
          <Box
            as="pre"
            p="20px"
            bg={preBlockBg}
            borderRadius="10px"
            overflow="auto"
            fontSize="sm"
            color={textColor}
          >
            {JSON.stringify(analysisResult, null, 2)}
          </Box>
        </Card>
      )}
    </Box>
  );
}
