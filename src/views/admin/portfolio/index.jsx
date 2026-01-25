import {
  Badge,
  Box,
  Button,
  Collapse,
  Flex,
  Grid,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import { request } from 'lib/api';
import { useState } from 'react';
import Chart from 'react-apexcharts';
import {
  MdAccountBalance,
  MdArticle,
  MdAssessment,
  MdCheckCircle,
  MdShowChart,
  MdSpeed,
  MdTrendingUp,
} from 'react-icons/md';

// Minimalist Stock Analysis Card Component
function StockAnalysisCard({
  symbol,
  chartData,
  analysisResult,
  formatChartData,
  textColor,
  textColorSecondary,
  brandColor,
  cardBg,
  borderColor,
  preBlockBg,
}) {
  const [expandedSections, setExpandedSections] = useState({
    chart: true,
    news: false,
    earnings: false,
    technical: false,
    fundamentals: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const chartConfig = formatChartData(symbol);
  const newsData = analysisResult?.result?.news_data?.[symbol];
  const earningsData = analysisResult?.result?.earnings_data?.[symbol];
  const technicalData = analysisResult?.result?.technical_data?.[symbol];
  const fundamentalsData = analysisResult?.result?.fundamentals_data?.[symbol];

  return (
    <Card bg={cardBg} p="20px">
      {/* Stock Header */}
      <Flex justify="space-between" align="center" mb="20px">
        <HStack spacing="10px">
          <Text color={textColor} fontSize="xl" fontWeight="700">
            {symbol}
          </Text>
          <Badge colorScheme="brand" fontSize="xs">
            {AVAILABLE_STOCKS.find((s) => s.symbol === symbol)?.name || symbol}
          </Badge>
        </HStack>
      </Flex>

      <VStack spacing="15px" align="stretch">
        {/* Chart Section */}
        <Box>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleSection('chart')}
            w="full"
            justifyContent="space-between"
            rightIcon={
              <Icon
                as={MdShowChart}
                transform={expandedSections.chart ? 'rotate(180deg)' : 'none'}
                transition="all 0.2s"
              />
            }
          >
            <HStack spacing="8px">
              <Icon as={MdShowChart} w="14px" h="14px" color={brandColor} />
              <Text fontSize="xs" fontWeight="600">
                Price Chart
              </Text>
            </HStack>
          </Button>
          <Collapse in={expandedSections.chart}>
            <Box mt="10px">
              {chartConfig ? (
                <Chart
                  options={chartConfig.options}
                  series={chartConfig.series}
                  type="candlestick"
                  height={300}
                />
              ) : (
                <Text color={textColorSecondary} fontSize="xs" p="10px">
                  No chart data
                </Text>
              )}
            </Box>
          </Collapse>
        </Box>

        {/* News Section */}
        <Box borderTop="1px solid" borderColor={borderColor} pt="15px">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleSection('news')}
            w="full"
            justifyContent="space-between"
            rightIcon={
              <Badge colorScheme="brand" fontSize="xs">
                {newsData?.articles?.length || 0}
              </Badge>
            }
          >
            <HStack spacing="8px">
              <Icon as={MdArticle} w="14px" h="14px" color={brandColor} />
              <Text fontSize="xs" fontWeight="600">
                News Articles
              </Text>
            </HStack>
          </Button>
          <Collapse in={expandedSections.news}>
            <VStack spacing="8px" align="stretch" mt="10px">
              {newsData?.articles?.slice(0, 5).map((article, idx) => (
                <Box
                  key={idx}
                  p="10px"
                  bg={preBlockBg}
                  borderRadius="6px"
                  fontSize="xs"
                >
                  <Text
                    color={textColor}
                    fontWeight="600"
                    mb="4px"
                    noOfLines={1}
                  >
                    {article.title}
                  </Text>
                  <Text color={textColorSecondary} fontSize="2xs">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </Text>
                </Box>
              ))}
              {!newsData?.articles?.length && (
                <Text color={textColorSecondary} fontSize="xs" p="10px">
                  No news data
                </Text>
              )}
            </VStack>
          </Collapse>
        </Box>

        {/* Technical Indicators Section */}
        <Box borderTop="1px solid" borderColor={borderColor} pt="15px">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleSection('technical')}
            w="full"
            justifyContent="space-between"
            rightIcon={
              <Badge colorScheme="brand" fontSize="xs">
                {technicalData?.indicators
                  ? Object.keys(technicalData.indicators).length
                  : 0}
              </Badge>
            }
          >
            <HStack spacing="8px">
              <Icon as={MdSpeed} w="14px" h="14px" color={brandColor} />
              <Text fontSize="xs" fontWeight="600">
                Technical Indicators
              </Text>
            </HStack>
          </Button>
          <Collapse in={expandedSections.technical}>
            <Box mt="10px">
              {technicalData?.indicators ? (
                <SimpleGrid columns={2} spacing="8px">
                  {Object.entries(technicalData.indicators).map(
                    ([key, value]) => (
                      <Box
                        key={key}
                        p="10px"
                        bg={preBlockBg}
                        borderRadius="6px"
                      >
                        <Text
                          color={textColorSecondary}
                          fontSize="2xs"
                          fontWeight="600"
                          mb="4px"
                        >
                          {key}
                        </Text>
                        <Text color={textColor} fontSize="xs" noOfLines={2}>
                          {value}
                        </Text>
                      </Box>
                    ),
                  )}
                </SimpleGrid>
              ) : (
                <Text color={textColorSecondary} fontSize="xs" p="10px">
                  No technical data
                </Text>
              )}
            </Box>
          </Collapse>
        </Box>

        {/* Earnings Section */}
        <Box borderTop="1px solid" borderColor={borderColor} pt="15px">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleSection('earnings')}
            w="full"
            justifyContent="space-between"
          >
            <HStack spacing="8px">
              <Icon as={MdAssessment} w="14px" h="14px" color={brandColor} />
              <Text fontSize="xs" fontWeight="600">
                Earnings & Financials
              </Text>
            </HStack>
          </Button>
          <Collapse in={expandedSections.earnings}>
            <Box mt="10px" p="10px" bg={preBlockBg} borderRadius="6px">
              {earningsData ? (
                <VStack spacing="6px" align="stretch">
                  <HStack justify="space-between">
                    <Text color={textColorSecondary} fontSize="2xs">
                      Company
                    </Text>
                    <Text color={textColor} fontSize="xs" fontWeight="600">
                      {earningsData.name || 'N/A'}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color={textColorSecondary} fontSize="2xs">
                      Type
                    </Text>
                    <Text color={textColor} fontSize="xs">
                      {earningsData.security_type || 'N/A'}
                    </Text>
                  </HStack>
                </VStack>
              ) : (
                <Text color={textColorSecondary} fontSize="xs">
                  No earnings data
                </Text>
              )}
            </Box>
          </Collapse>
        </Box>

        {/* Fundamentals Section */}
        <Box borderTop="1px solid" borderColor={borderColor} pt="15px">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleSection('fundamentals')}
            w="full"
            justifyContent="space-between"
          >
            <HStack spacing="8px">
              <Icon
                as={MdAccountBalance}
                w="14px"
                h="14px"
                color={brandColor}
              />
              <Text fontSize="xs" fontWeight="600">
                Fundamentals
              </Text>
            </HStack>
          </Button>
          <Collapse in={expandedSections.fundamentals}>
            <Box mt="10px" p="10px" bg={preBlockBg} borderRadius="6px">
              <Text color={textColor} fontSize="xs" whiteSpace="pre-wrap">
                {fundamentalsData?.fundamentals_text || 'No fundamentals data'}
              </Text>
            </Box>
          </Collapse>
        </Box>
      </VStack>
    </Card>
  );
}

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
  const [chartData, setChartData] = useState(null);
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
        : [...prev, symbol],
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
    setChartData(null);

    try {
      // Fetch portfolio analysis and chart data in parallel
      const [analysisData, chartDataResponse] = await Promise.all([
        request.post('/ai/portfolio/analyze', {
          stocks: selectedStocks,
        }),
        request.post('/ai/chart', {
          stocks: selectedStocks,
        }),
      ]);

      setAnalysisResult(analysisData);
      setChartData(chartDataResponse);

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
        description:
          error.message || 'Failed to analyze portfolio. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // const groupedStocks = AVAILABLE_STOCKS.reduce((acc, stock) => {
  //   if (!acc[stock.sector]) {
  //     acc[stock.sector] = [];
  //   }
  //   acc[stock.sector].push(stock);
  //   return acc;
  // }, {});

  // Convert chart data to ApexCharts format
  const formatChartData = (symbol) => {
    if (!chartData || !chartData.result || !chartData.result.chart_data) {
      return null;
    }

    const stockData = chartData.result.chart_data[symbol];
    if (!stockData || !stockData.candles) {
      return null;
    }

    // Convert to candlestick format
    const series = [
      {
        name: symbol,
        data: stockData.candles.map((candle) => ({
          x: new Date(candle.date),
          y: [candle.open, candle.high, candle.low, candle.close],
        })),
      },
    ];

    const options = {
      chart: {
        type: 'candlestick',
        height: 350,
        toolbar: {
          show: true,
        },
      },
      title: {
        text: `${symbol} - ${stockData.period || '1mo'}`,
        align: 'left',
        style: {
          color: textColor,
        },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: textColorSecondary,
          },
        },
      },
      yaxis: {
        tooltip: {
          enabled: true,
        },
        labels: {
          formatter: (value) => `$${value.toFixed(2)}`,
          style: {
            colors: textColorSecondary,
          },
        },
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: '#26A69A',
            downward: '#EF5350',
          },
        },
      },
      tooltip: {
        theme: 'dark',
      },
      grid: {
        borderColor: borderColor,
      },
    };

    return { series, options };
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Minimalist Header */}
      <Box mb="30px">
        <Text color={textColor} fontSize="3xl" fontWeight="700" mb="5px">
          Portfolio Analysis
        </Text>
        <Text color={textColorSecondary} fontSize="sm">
          Select stocks and analyze with AI-powered insights
        </Text>
      </Box>

      {/* Minimalist Stock Selection */}
      <Card mb="20px" bg={cardBg} p="25px">
        <Flex justify="space-between" align="center" mb="20px">
          <Text color={textColor} fontSize="sm" fontWeight="600">
            {selectedStocks.length} Stock
            {selectedStocks.length !== 1 ? 's' : ''} Selected
          </Text>
          <HStack spacing="10px">
            <Button
              size="xs"
              variant="ghost"
              onClick={handleSelectAll}
              color={brandColor}
            >
              {selectedStocks.length === AVAILABLE_STOCKS.length
                ? 'Clear'
                : 'All'}
            </Button>
          </HStack>
        </Flex>

        {/* Compact Stock Grid */}
        <Grid
          templateColumns="repeat(auto-fill, minmax(80px, 1fr))"
          gap="8px"
          mb="20px"
        >
          {AVAILABLE_STOCKS.map((stock) => {
            const isSelected = selectedStocks.includes(stock.symbol);
            return (
              <Box
                key={stock.symbol}
                as="button"
                p="10px"
                borderRadius="8px"
                border="1px solid"
                borderColor={isSelected ? brandColor : borderColor}
                bg={isSelected ? selectedStockBg : 'transparent'}
                cursor="pointer"
                transition="all 0.15s"
                _hover={{
                  borderColor: brandColor,
                  transform: 'translateY(-2px)',
                }}
                onClick={() => handleStockToggle(stock.symbol)}
                position="relative"
              >
                {isSelected && (
                  <Icon
                    as={MdCheckCircle}
                    position="absolute"
                    top="4px"
                    right="4px"
                    w="12px"
                    h="12px"
                    color={brandColor}
                  />
                )}
                <Text
                  color={textColor}
                  fontSize="xs"
                  fontWeight="700"
                  textAlign="center"
                >
                  {stock.symbol}
                </Text>
              </Box>
            );
          })}
        </Grid>

        {/* Analyze Button */}
        <Button
          leftIcon={<MdTrendingUp />}
          colorScheme="brand"
          size="md"
          onClick={handleCreatePortfolio}
          isLoading={loading}
          loadingText="Analyzing..."
          isDisabled={selectedStocks.length === 0}
          w="full"
        >
          Analyze Portfolio
        </Button>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card bg={cardBg} p="40px">
          <VStack spacing="15px">
            <Spinner size="lg" color={brandColor} thickness="3px" />
            <Text color={textColor} fontSize="md" fontWeight="600">
              Analyzing Portfolio
            </Text>
            <Text color={textColorSecondary} fontSize="xs">
              Collecting data from 5 sources...
            </Text>
          </VStack>
        </Card>
      )}

      {/* Minimalist Analysis Results */}
      {analysisResult && !loading && (
        <VStack spacing="15px" align="stretch">
          {/* Summary Stats */}
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing="10px">
            <Card bg={cardBg} p="15px">
              <HStack spacing="8px">
                <Icon as={MdShowChart} w="16px" h="16px" color={brandColor} />
                <Text color={textColorSecondary} fontSize="xs">
                  Charts
                </Text>
              </HStack>
              <Text color={textColor} fontSize="lg" fontWeight="700" mt="5px">
                {chartData?.result?.chart_data
                  ? Object.keys(chartData.result.chart_data).length
                  : 0}
              </Text>
            </Card>

            <Card bg={cardBg} p="15px">
              <HStack spacing="8px">
                <Icon as={MdArticle} w="16px" h="16px" color={brandColor} />
                <Text color={textColorSecondary} fontSize="xs">
                  News
                </Text>
              </HStack>
              <Text color={textColor} fontSize="lg" fontWeight="700" mt="5px">
                {analysisResult?.result?.news_data
                  ? Object.keys(analysisResult.result.news_data).length
                  : 0}
              </Text>
            </Card>

            <Card bg={cardBg} p="15px">
              <HStack spacing="8px">
                <Icon as={MdAssessment} w="16px" h="16px" color={brandColor} />
                <Text color={textColorSecondary} fontSize="xs">
                  Earnings
                </Text>
              </HStack>
              <Text color={textColor} fontSize="lg" fontWeight="700" mt="5px">
                {analysisResult?.result?.earnings_data
                  ? Object.keys(analysisResult.result.earnings_data).length
                  : 0}
              </Text>
            </Card>

            <Card bg={cardBg} p="15px">
              <HStack spacing="8px">
                <Icon as={MdSpeed} w="16px" h="16px" color={brandColor} />
                <Text color={textColorSecondary} fontSize="xs">
                  Technical
                </Text>
              </HStack>
              <Text color={textColor} fontSize="lg" fontWeight="700" mt="5px">
                {analysisResult?.result?.technical_data
                  ? Object.keys(analysisResult.result.technical_data).length
                  : 0}
              </Text>
            </Card>

            <Card bg={cardBg} p="15px">
              <HStack spacing="8px">
                <Icon
                  as={MdAccountBalance}
                  w="16px"
                  h="16px"
                  color={brandColor}
                />
                <Text color={textColorSecondary} fontSize="xs">
                  Fundamentals
                </Text>
              </HStack>
              <Text color={textColor} fontSize="lg" fontWeight="700" mt="5px">
                {analysisResult?.result?.fundamentals_data
                  ? Object.keys(analysisResult.result.fundamentals_data).length
                  : 0}
              </Text>
            </Card>
          </SimpleGrid>

          {/* Per-Stock Analysis Cards */}
          {selectedStocks.map((symbol) => (
            <StockAnalysisCard
              key={symbol}
              symbol={symbol}
              chartData={chartData}
              analysisResult={analysisResult}
              formatChartData={formatChartData}
              textColor={textColor}
              textColorSecondary={textColorSecondary}
              brandColor={brandColor}
              cardBg={cardBg}
              borderColor={borderColor}
              preBlockBg={preBlockBg}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
}
