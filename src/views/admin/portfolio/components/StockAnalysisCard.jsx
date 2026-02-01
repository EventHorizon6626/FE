/**
 * StockAnalysisCard Component
 *
 * Extracted from the main portfolio component for reusability
 */

import { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  HStack,
  Text,
  Badge,
  Icon,
  VStack,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  MdShowChart,
  MdArticle,
  MdAssessment,
  MdSpeed,
  MdAccountBalance,
} from 'react-icons/md';
import Chart from 'react-apexcharts';
import Card from 'components/card/Card.js';

export default function StockAnalysisCard({
  symbol,
  chartData,
  analysisResult,
  assetType = 'stock',
}) {
  const [expandedSections, setExpandedSections] = useState({
    chart: true,
    news: false,
    earnings: false,
    technical: false,
    fundamentals: false,
  });

  const textColor = '#1F2937';
  const textColorSecondary = 'gray.600';
  const brandColor = 'teal.600';
  const cardBg = 'white';
  const borderColor = 'gray.200';
  const preBlockBg = 'gray.50';

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Format chart data
  const formatChartData = () => {
    if (!chartData || !chartData.result || !chartData.result.chart_data) {
      return null;
    }

    const stockData = chartData.result.chart_data[symbol];
    if (!stockData || !stockData.candles) {
      return null;
    }

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

  const chartConfig = formatChartData();
  const newsData = analysisResult?.result?.news_data?.[symbol];
  const earningsData = analysisResult?.result?.earnings_data?.[symbol];
  const technicalData = analysisResult?.result?.technical_data?.[symbol];
  const fundamentalsData = analysisResult?.result?.fundamentals_data?.[symbol];

  return (
    <Card
      bg={cardBg}
      p="20px"
      borderRadius="12px"
      border="1px solid"
      borderColor={borderColor}
    >
      <VStack spacing="15px" align="stretch">
        {/* Chart Section */}
        <Box>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleSection('chart')}
            w="full"
            justifyContent="space-between"
            color={textColor}
            _hover={{ bg: 'gray.50' }}
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
              <Badge colorScheme="teal" fontSize="xs">
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
              <Badge colorScheme="teal" fontSize="xs">
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
                    )
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
