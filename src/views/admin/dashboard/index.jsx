/* eslint-disable */
import {
  Box,
  Button,
  HStack,
  Icon,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useState } from 'react';
import { MdSearch, MdTrendingUp, MdTrendingDown } from 'react-icons/md';

// Mock data - In production, this would come from an API
const mockData = [
  {
    ticker: 'PLTR',
    company: 'Palantir',
    price: 19.19,
    marketCap: 45.6,
    ps: 13.21,
    pe: 'N/A',
    ytd: -17.83,
    oneYear: -30.19,
    delta52w: -75.05,
    type: 'stock',
  },
  {
    ticker: 'TTO',
    company: 'Trade Desk',
    price: 31.39,
    marketCap: 15.2,
    ps: 6.44,
    pe: 35.81,
    ytd: -17.83,
    oneYear: -30.19,
    delta52w: -75.05,
    type: 'stock',
  },
  {
    ticker: 'DIS',
    company: 'Walt Disney',
    price: 141.00,
    marketCap: 256.5,
    ps: 6.26,
    pe: 17.85,
    ytd: -30.13,
    oneYear: -74.11,
    delta52w: -74.11,
    type: 'stock',
  },
  {
    ticker: 'ETH',
    company: 'Ethereum',
    price: 2287.45,
    marketCap: 275000,
    ps: 'N/A',
    pe: 'N/A',
    ytd: 45.23,
    oneYear: 123.45,
    delta52w: 85.32,
    type: 'crypto',
  },
  {
    ticker: 'BTC',
    company: 'Bitcoin',
    price: 43250.00,
    marketCap: 850000,
    ps: 'N/A',
    pe: 'N/A',
    ytd: 62.15,
    oneYear: 145.67,
    delta52w: 98.21,
    type: 'crypto',
  },
  {
    ticker: 'SPY',
    company: 'S&P 500 ETF',
    price: 445.67,
    marketCap: 420000,
    ps: 'N/A',
    pe: 21.45,
    ytd: 12.34,
    oneYear: 18.45,
    delta52w: 8.32,
    type: 'index',
  },
  {
    ticker: 'QQQ',
    company: 'Nasdaq 100 ETF',
    price: 378.92,
    marketCap: 180000,
    ps: 'N/A',
    pe: 28.34,
    ytd: -8.45,
    oneYear: -12.56,
    delta52w: -15.43,
    type: 'index',
  },
  {
    ticker: 'NFLX',
    company: 'Netflix',
    price: 376.48,
    marketCap: 166.5,
    ps: 4.78,
    pe: 31.23,
    ytd: -48.92,
    oneYear: -65.34,
    delta52w: -68.12,
    type: 'stock',
  },
  {
    ticker: 'MSFT',
    company: 'Microsoft',
    price: 295.37,
    marketCap: 2200,
    ps: 11.2,
    pe: 28.5,
    ytd: -25.43,
    oneYear: -18.32,
    delta52w: -22.67,
    type: 'stock',
  },
  {
    ticker: 'AAPL',
    company: 'Apple',
    price: 142.56,
    marketCap: 2300,
    ps: 6.8,
    pe: 24.1,
    ytd: -18.45,
    oneYear: -12.34,
    delta52w: -15.23,
    type: 'stock',
  },
];

export default function Dashboard() {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('ytd');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filter and sort data
  const filteredData = mockData
    .filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.ticker.toLowerCase().includes(query) ||
        item.company.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Handle N/A values
      if (aVal === 'N/A') aVal = 0;
      if (bVal === 'N/A') bVal = 0;

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const getColorForValue = (value) => {
    if (typeof value !== 'number') return 'gray.600';
    if (value > 0) return 'green.600';
    if (value < 0) return 'red.600';
    return 'gray.600';
  };

  const getBgColorForValue = (value) => {
    if (typeof value !== 'number') return 'transparent';
    if (value > 10) return 'green.100';
    if (value > 0) return 'green.50';
    if (value < -10) return 'red.100';
    if (value < 0) return 'red.50';
    return 'transparent';
  };

  const formatNumber = (num, decimals = 2) => {
    if (typeof num !== 'number') return num;
    return num.toFixed(decimals);
  };

  const formatLargeNumber = (num) => {
    if (typeof num !== 'number') return num;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}T`;
    return `${num.toFixed(1)}B`;
  };

  return (
    <Box h="100vh" bg="#FAFAFA" p="40px" overflowY="auto">
      <VStack spacing="30px" maxW="1600px" mx="auto" align="stretch">
        {/* Header */}
        <HStack justify="space-between" w="full">
          <VStack align="start" spacing="5px">
            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
              Market Dashboard
            </Text>
            <Text fontSize="md" color="gray.600">
              Track trending stocks, crypto, and indices
            </Text>
          </VStack>

          <HStack spacing="12px">
            <Badge colorScheme="teal" fontSize="md" px="12px" py="6px" borderRadius="8px">
              {filteredData.length} Assets
            </Badge>
          </HStack>
        </HStack>

        {/* Filters and Search */}
        <HStack spacing="15px" w="full">
          <InputGroup flex="1" maxW="400px">
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search ticker or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="white"
              borderColor="gray.200"
              _focus={{
                borderColor: 'teal.600',
                boxShadow: '0 0 0 1px teal.600',
              }}
            />
          </InputGroup>

          <HStack spacing="8px">
            <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
              Type
            </Text>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              size="md"
              width="140px"
              bg="white"
              borderColor="gray.200"
              _focus={{
                borderColor: 'teal.600',
                boxShadow: '0 0 0 1px teal.600',
              }}
            >
              <option value="all">All</option>
              <option value="stock">Stocks</option>
              <option value="crypto">Crypto</option>
              <option value="index">Indices</option>
            </Select>
          </HStack>

          <HStack spacing="8px">
            <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
              Sort by
            </Text>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="md"
              width="140px"
              bg="white"
              borderColor="gray.200"
              _focus={{
                borderColor: 'teal.600',
                boxShadow: '0 0 0 1px teal.600',
              }}
            >
              <option value="ytd">% YTD</option>
              <option value="oneYear">1Y Return</option>
              <option value="delta52w">52W High</option>
              <option value="price">Price</option>
              <option value="marketCap">Market Cap</option>
            </Select>
          </HStack>

          <Button
            size="md"
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            borderColor="gray.200"
            _hover={{ bg: 'gray.50' }}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </HStack>

        {/* Table */}
        <Box
          bg="white"
          borderRadius="12px"
          border="1px solid"
          borderColor="gray.200"
          overflow="hidden"
        >
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontSize="xs" fontWeight="600" color="gray.700" textTransform="none">
                    Ticker
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color="gray.700" textTransform="none">
                    Company
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color="gray.700" textTransform="none" isNumeric>
                    Price
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color="gray.700" textTransform="none" isNumeric>
                    Market Cap
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color="gray.700" textTransform="none" isNumeric>
                    P/S
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color="gray.700" textTransform="none" isNumeric>
                    P/E
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color="gray.700" textTransform="none" isNumeric>
                    % YTD
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color="gray.700" textTransform="none" isNumeric>
                    1Y Return
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color="gray.700" textTransform="none" isNumeric>
                    Δ 52w High
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color="gray.700" textTransform="none">
                    Type
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredData.map((item, index) => (
                  <Tr
                    key={index}
                    _hover={{ bg: 'gray.50' }}
                    cursor="pointer"
                    transition="all 0.2s"
                  >
                    <Td fontWeight="600" color="gray.800" fontSize="sm">
                      <HStack spacing="6px">
                        <Text>{item.ticker}</Text>
                        {item.type === 'crypto' && (
                          <Badge colorScheme="purple" fontSize="10px">
                            Crypto
                          </Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td color="gray.600" fontSize="sm">
                      {item.company}
                    </Td>
                    <Td isNumeric fontWeight="500" fontSize="sm">
                      ${formatNumber(item.price)}
                    </Td>
                    <Td isNumeric fontSize="sm" color="gray.600">
                      {formatLargeNumber(item.marketCap)}
                    </Td>
                    <Td isNumeric fontSize="sm" color="gray.600">
                      {formatNumber(item.ps)}
                    </Td>
                    <Td isNumeric fontSize="sm" color="gray.600">
                      {typeof item.pe === 'number' ? formatNumber(item.pe) : item.pe}
                    </Td>
                    <Td
                      isNumeric
                      fontWeight="600"
                      fontSize="sm"
                      color={getColorForValue(item.ytd)}
                      bg={getBgColorForValue(item.ytd)}
                    >
                      <HStack justify="flex-end" spacing="4px">
                        <Icon
                          as={item.ytd > 0 ? MdTrendingUp : MdTrendingDown}
                          boxSize="14px"
                        />
                        <Text>{formatNumber(item.ytd)}%</Text>
                      </HStack>
                    </Td>
                    <Td
                      isNumeric
                      fontWeight="600"
                      fontSize="sm"
                      color={getColorForValue(item.oneYear)}
                      bg={getBgColorForValue(item.oneYear)}
                    >
                      <HStack justify="flex-end" spacing="4px">
                        <Icon
                          as={item.oneYear > 0 ? MdTrendingUp : MdTrendingDown}
                          boxSize="14px"
                        />
                        <Text>{formatNumber(item.oneYear)}%</Text>
                      </HStack>
                    </Td>
                    <Td
                      isNumeric
                      fontWeight="600"
                      fontSize="sm"
                      color={getColorForValue(item.delta52w)}
                      bg={getBgColorForValue(item.delta52w)}
                    >
                      <HStack justify="flex-end" spacing="4px">
                        <Icon
                          as={item.delta52w > 0 ? MdTrendingUp : MdTrendingDown}
                          boxSize="14px"
                        />
                        <Text>{formatNumber(item.delta52w)}%</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          item.type === 'stock'
                            ? 'blue'
                            : item.type === 'crypto'
                            ? 'purple'
                            : 'orange'
                        }
                        fontSize="10px"
                        textTransform="capitalize"
                      >
                        {item.type}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {filteredData.length === 0 && (
            <Box py="60px" textAlign="center">
              <Icon as={MdSearch} boxSize="48px" color="gray.300" mb="12px" />
              <Text fontSize="lg" fontWeight="600" color="gray.600" mb="8px">
                No assets found
              </Text>
              <Text fontSize="sm" color="gray.500">
                Try adjusting your filters or search query
              </Text>
            </Box>
          )}
        </Box>

        {/* Summary Cards */}
        <HStack spacing="20px" w="full">
          <Box
            flex="1"
            bg="white"
            p="20px"
            borderRadius="12px"
            border="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="sm" color="gray.600" mb="8px">
              Stocks Tracked
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              {mockData.filter((d) => d.type === 'stock').length}
            </Text>
          </Box>
          <Box
            flex="1"
            bg="white"
            p="20px"
            borderRadius="12px"
            border="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="sm" color="gray.600" mb="8px">
              Crypto Assets
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              {mockData.filter((d) => d.type === 'crypto').length}
            </Text>
          </Box>
          <Box
            flex="1"
            bg="white"
            p="20px"
            borderRadius="12px"
            border="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="sm" color="gray.600" mb="8px">
              Indices
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              {mockData.filter((d) => d.type === 'index').length}
            </Text>
          </Box>
        </HStack>
      </VStack>
    </Box>
  );
}
