/**
 * Portfolio Analyzer - New Version with Multi-Asset Support
 *
 * Allows analyzing:
 * - Individual Stocks
 * - Market Indices (SPY, QQQ, etc.)
 * - Sector ETFs (XLK, XLF, etc.)
 * - International Markets
 */

import {
  Box,
  Button,
  VStack,
  Text,
  Spinner,
  SimpleGrid,
  HStack,
  Icon,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  MdShowChart,
  MdArticle,
  MdSpeed,
  MdAccountBalance,
} from 'react-icons/md';

import Card from 'components/card/Card.js';
import { request } from 'lib/api';
import AssetSelector from 'components/assets/AssetSelector';
import { detectAssetType } from 'data/assets';

// Import your existing StockAnalysisCard component
import StockAnalysisCard from './components/StockAnalysisCard';

export default function PortfolioAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [analyzedAssets, setAnalyzedAssets] = useState([]);
  const toast = useToast();

  // Colors
  const textColor = '#1F2937';
  const textColorSecondary = 'gray.600';
  const brandColor = 'teal.600';
  const cardBg = 'white';
  const borderColor = 'gray.200';

  const handleAnalyze = async (selectedTickers) => {
    if (selectedTickers.length === 0) {
      toast({
        title: 'No assets selected',
        description: 'Please select at least one asset to analyze.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setAnalysisResult(null);
    setChartData(null);
    setAnalyzedAssets(selectedTickers);

    try {
      // Detect asset types
      const assetsWithTypes = selectedTickers.map((ticker) => ({
        ticker,
        type: detectAssetType(ticker),
      }));

      // Show asset type info
      const assetTypeBreakdown = assetsWithTypes.reduce((acc, asset) => {
        acc[asset.type] = (acc[asset.type] || 0) + 1;
        return acc;
      }, {});

      console.log('Analyzing assets:', assetsWithTypes);
      console.log('Asset type breakdown:', assetTypeBreakdown);

      // Fetch portfolio analysis and chart data in parallel
      const [analysisData, chartDataResponse] = await Promise.all([
        request.post('/ai/portfolio/analyze', {
          stocks: selectedTickers,
          // Send asset types to backend (for future use)
          asset_types: assetsWithTypes,
        }),
        request.post('/ai/chart', {
          stocks: selectedTickers,
        }),
      ]);

      setAnalysisResult(analysisData);
      setChartData(chartDataResponse);

      // Show asset type breakdown in toast
      const typeLabels = Object.entries(assetTypeBreakdown)
        .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
        .join(', ');

      toast({
        title: 'Analysis complete',
        description: `Analyzed ${selectedTickers.length} assets (${typeLabels})`,
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

  return (
    <Box minH="100vh" bg="#FAFAFA" p={{ base: '20px', md: '40px' }}>
      <Box maxW="1400px" mx="auto">
        {/* Header */}
        <Box mb="30px">
          <Text color={textColor} fontSize="3xl" fontWeight="600" mb="5px">
            Event Horizon AI
          </Text>
          <Text color={textColorSecondary} fontSize="sm">
            Multi-asset analysis powered by AI agents
          </Text>
        </Box>

        {/* Asset Selector */}
        {!loading && !analysisResult && (
          <AssetSelector onAnalyze={handleAnalyze} />
        )}

        {/* Loading State */}
        {loading && (
          <Card
            bg={cardBg}
            p="40px"
            borderRadius="12px"
            border="1px solid"
            borderColor={borderColor}
          >
            <VStack spacing="15px">
              <Spinner size="lg" color={brandColor} thickness="3px" />
              <Text color={textColor} fontSize="md" fontWeight="600">
                Analyzing Assets
              </Text>
              <Text color={textColorSecondary} fontSize="xs">
                Running System 1: Data Pipeline...
              </Text>
              <Text color={textColorSecondary} fontSize="xs">
                Stage 1: Collecting data from multiple sources
              </Text>
            </VStack>
          </Card>
        )}

        {/* Analysis Results */}
        {analysisResult && !loading && (
          <VStack spacing="20px" align="stretch">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              alignSelf="flex-start"
              onClick={() => {
                setAnalysisResult(null);
                setChartData(null);
                setAnalyzedAssets([]);
              }}
            >
              ← New Analysis
            </Button>

            {/* Summary Stats */}
            <SimpleGrid columns={{ base: 2, md: 5 }} spacing="10px">
              <Card
                bg={cardBg}
                p="15px"
                borderRadius="12px"
                border="1px solid"
                borderColor={borderColor}
              >
                <HStack spacing="8px">
                  <Icon as={MdShowChart} w="16px" h="16px" color={brandColor} />
                  <Text color={textColorSecondary} fontSize="xs">
                    Assets
                  </Text>
                </HStack>
                <Text color={textColor} fontSize="lg" fontWeight="700" mt="5px">
                  {analyzedAssets.length}
                </Text>
              </Card>

              <Card
                bg={cardBg}
                p="15px"
                borderRadius="12px"
                border="1px solid"
                borderColor={borderColor}
              >
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

              <Card
                bg={cardBg}
                p="15px"
                borderRadius="12px"
                border="1px solid"
                borderColor={borderColor}
              >
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

              <Card
                bg={cardBg}
                p="15px"
                borderRadius="12px"
                border="1px solid"
                borderColor={borderColor}
              >
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

              <Card
                bg={cardBg}
                p="15px"
                borderRadius="12px"
                border="1px solid"
                borderColor={borderColor}
              >
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

            {/* Per-Asset Analysis Cards */}
            {analyzedAssets.map((ticker) => (
              <Box key={ticker}>
                <HStack spacing="8px" mb="10px">
                  <Badge colorScheme="teal" fontSize="sm">
                    {detectAssetType(ticker)}
                  </Badge>
                  <Text color={textColor} fontSize="lg" fontWeight="600">
                    {ticker}
                  </Text>
                </HStack>
                <StockAnalysisCard
                  symbol={ticker}
                  chartData={chartData}
                  analysisResult={analysisResult}
                  assetType={detectAssetType(ticker)}
                />
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
}
