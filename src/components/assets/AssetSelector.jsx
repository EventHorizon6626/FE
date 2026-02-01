/**
 * AssetSelector Component
 *
 * Multi-tab asset selection interface
 * - US Indices
 * - Companies
 * - Sector ETFs
 * - International
 * - All Assets
 */

import { useState } from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  InputGroup,
  InputLeftElement,
  Input,
  HStack,
  Button,
  Text,
  Badge,
  Icon,
  VStack,
  Flex,
} from '@chakra-ui/react';
import {
  MdSearch,
  MdShowChart,
  MdBusiness,
  MdPieChart,
  MdPublic,
  MdList,
} from 'react-icons/md';

import AssetTable from './AssetTable';
import {
  US_INDICES,
  COMPANIES,
  SECTOR_ETFS,
  INTERNATIONAL,
  getAllAssets,
} from '../../data/assets';

export default function AssetSelector({ onAnalyze }) {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Colors
  const textColor = '#1F2937';
  const textColorSecondary = 'gray.600';
  const brandColor = 'teal.600';
  const cardBg = 'white';
  const borderColor = 'gray.200';

  // Handle asset selection toggle
  const handleToggleAsset = (ticker) => {
    setSelectedAssets((prev) =>
      prev.includes(ticker)
        ? prev.filter((t) => t !== ticker)
        : [...prev, ticker]
    );
  };

  // Handle select all for current tab
  const handleToggleAll = (assets) => {
    const tickers = assets.map((a) => a.ticker);
    const allSelected = tickers.every((t) => selectedAssets.includes(t));

    if (allSelected) {
      // Deselect all from this tab
      setSelectedAssets((prev) => prev.filter((t) => !tickers.includes(t)));
    } else {
      // Select all from this tab
      setSelectedAssets((prev) => [
        ...new Set([...prev, ...tickers]),
      ]);
    }
  };

  // Get filtered assets based on search
  const getFilteredAssets = (assets) => {
    if (!searchQuery) return assets;
    const lowerQuery = searchQuery.toLowerCase();
    return assets.filter(
      (asset) =>
        asset.ticker.toLowerCase().includes(lowerQuery) ||
        asset.name.toLowerCase().includes(lowerQuery) ||
        (asset.description &&
          asset.description.toLowerCase().includes(lowerQuery)) ||
        (asset.sector && asset.sector.toLowerCase().includes(lowerQuery))
    );
  };

  // Tab configurations
  const tabs = [
    {
      name: 'US Indices',
      icon: MdShowChart,
      assets: US_INDICES,
      showHoldings: true,
    },
    {
      name: 'Companies',
      icon: MdBusiness,
      assets: COMPANIES,
      showSector: true,
    },
    {
      name: 'Sector ETFs',
      icon: MdPieChart,
      assets: SECTOR_ETFS,
      showHoldings: true,
    },
    {
      name: 'International',
      icon: MdPublic,
      assets: INTERNATIONAL,
      showHoldings: true,
    },
    {
      name: 'All',
      icon: MdList,
      assets: getAllAssets(),
      showSector: true,
      showHoldings: true,
    },
  ];

  const currentTab = tabs[activeTab];
  const filteredAssets = getFilteredAssets(currentTab.assets);

  return (
    <Box>
      {/* Header with Search */}
      <VStack spacing="20px" align="stretch" mb="20px">
        <Flex justify="space-between" align="center">
          <Box>
            <Text color={textColor} fontSize="2xl" fontWeight="600">
              Select Assets to Analyze
            </Text>
            <Text color={textColorSecondary} fontSize="sm">
              Choose stocks, indices, or ETFs for AI-powered analysis
            </Text>
          </Box>

          {selectedAssets.length > 0 && (
            <Badge
              colorScheme="teal"
              fontSize="md"
              px="12px"
              py="6px"
              borderRadius="8px"
            >
              {selectedAssets.length} selected
            </Badge>
          )}
        </Flex>

        {/* Search Bar */}
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={MdSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search by ticker, company name, or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg={cardBg}
            borderColor={borderColor}
            _focus={{
              borderColor: brandColor,
              boxShadow: `0 0 0 1px ${brandColor}`,
            }}
          />
        </InputGroup>
      </VStack>

      {/* Tabs */}
      <Tabs
        index={activeTab}
        onChange={setActiveTab}
        colorScheme="teal"
        variant="enclosed"
      >
        <TabList borderColor={borderColor}>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              _selected={{
                color: brandColor,
                borderColor: borderColor,
                borderBottomColor: 'white',
                fontWeight: '600',
              }}
            >
              <HStack spacing="6px">
                <Icon as={tab.icon} />
                <Text fontSize="sm">{tab.name}</Text>
                <Badge
                  colorScheme="gray"
                  fontSize="xs"
                  variant="subtle"
                  ml="4px"
                >
                  {tab.assets.length}
                </Badge>
              </HStack>
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {tabs.map((tab, index) => (
            <TabPanel key={index} p="0" pt="20px">
              <Box
                bg={cardBg}
                borderRadius="12px"
                border="1px solid"
                borderColor={borderColor}
                overflow="hidden"
              >
                <AssetTable
                  assets={filteredAssets}
                  selectedAssets={selectedAssets}
                  onToggleAsset={handleToggleAsset}
                  onToggleAll={() => handleToggleAll(filteredAssets)}
                  onAnalyze={onAnalyze}
                  showSector={tab.showSector}
                  showHoldings={tab.showHoldings}
                />
              </Box>

              {/* Info Footer */}
              <Box mt="12px" px="4px">
                <Text color={textColorSecondary} fontSize="xs">
                  Showing {filteredAssets.length} of {tab.assets.length}{' '}
                  assets
                  {searchQuery && ` matching "${searchQuery}"`}
                </Text>
              </Box>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      {/* Action Bar (when assets selected) */}
      {selectedAssets.length > 0 && (
        <Box
          position="sticky"
          bottom="20px"
          mt="20px"
          bg={cardBg}
          p="20px"
          borderRadius="12px"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="lg"
        >
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing="4px">
              <Text color={textColor} fontSize="md" fontWeight="600">
                {selectedAssets.length} asset
                {selectedAssets.length !== 1 ? 's' : ''} selected
              </Text>
              <Text color={textColorSecondary} fontSize="xs">
                {selectedAssets.slice(0, 5).join(', ')}
                {selectedAssets.length > 5 &&
                  ` +${selectedAssets.length - 5} more`}
              </Text>
            </VStack>

            <HStack spacing="10px">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setSelectedAssets([])}
              >
                Clear
              </Button>
              <Button
                colorScheme="teal"
                size="md"
                onClick={() => onAnalyze(selectedAssets)}
                rightIcon={<Icon as={MdShowChart} />}
              >
                Analyze Selected
              </Button>
            </HStack>
          </Flex>
        </Box>
      )}
    </Box>
  );
}
