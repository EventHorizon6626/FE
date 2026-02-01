/**
 * AssetTable Component
 *
 * Displays assets in a table format with selection capabilities
 */

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Button,
  Badge,
  Text,
  HStack,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { MdShowChart } from 'react-icons/md';

export default function AssetTable({
  assets = [],
  selectedAssets = [],
  onToggleAsset,
  onToggleAll,
  onAnalyze,
  showSector = false,
  showHoldings = false,
}) {
  const textColor = '#1F2937';
  const textColorSecondary = 'gray.600';
  const borderColor = 'gray.200';

  const allSelected =
    assets.length > 0 && selectedAssets.length === assets.length;
  const someSelected = selectedAssets.length > 0 && !allSelected;

  return (
    <Box overflowX="auto">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th borderColor={borderColor} w="40px">
              <Checkbox
                isChecked={allSelected}
                isIndeterminate={someSelected}
                onChange={onToggleAll}
                colorScheme="teal"
              />
            </Th>
            <Th borderColor={borderColor} color={textColorSecondary}>
              Asset
            </Th>
            <Th borderColor={borderColor} color={textColorSecondary}>
              Ticker
            </Th>
            {showSector && (
              <Th borderColor={borderColor} color={textColorSecondary}>
                Sector
              </Th>
            )}
            {showHoldings && (
              <Th
                borderColor={borderColor}
                color={textColorSecondary}
                isNumeric
              >
                Holdings
              </Th>
            )}
            <Th borderColor={borderColor} w="120px"></Th>
          </Tr>
        </Thead>
        <Tbody>
          {assets.map((asset) => {
            const isSelected = selectedAssets.includes(asset.ticker);

            return (
              <Tr
                key={asset.ticker}
                bg={isSelected ? 'teal.50' : 'transparent'}
                _hover={{ bg: isSelected ? 'teal.50' : 'gray.50' }}
                cursor="pointer"
                onClick={() => onToggleAsset(asset.ticker)}
              >
                <Td borderColor={borderColor}>
                  <Checkbox
                    isChecked={isSelected}
                    onChange={() => onToggleAsset(asset.ticker)}
                    colorScheme="teal"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Td>

                <Td borderColor={borderColor}>
                  <VStack align="start" spacing="2px">
                    <HStack spacing="8px">
                      <Text fontSize="lg">{asset.icon}</Text>
                      <Text
                        color={textColor}
                        fontSize="sm"
                        fontWeight="600"
                      >
                        {asset.name}
                      </Text>
                    </HStack>
                    {asset.description && (
                      <Text
                        color={textColorSecondary}
                        fontSize="xs"
                        noOfLines={1}
                      >
                        {asset.description}
                      </Text>
                    )}
                  </VStack>
                </Td>

                <Td borderColor={borderColor}>
                  <Badge
                    colorScheme="teal"
                    fontSize="xs"
                    fontWeight="700"
                    px="8px"
                    py="2px"
                    borderRadius="4px"
                  >
                    {asset.ticker}
                  </Badge>
                </Td>

                {showSector && (
                  <Td borderColor={borderColor}>
                    <Badge
                      colorScheme="gray"
                      fontSize="xs"
                      variant="subtle"
                    >
                      {asset.sector || '-'}
                    </Badge>
                  </Td>
                )}

                {showHoldings && (
                  <Td borderColor={borderColor} isNumeric>
                    <Text color={textColorSecondary} fontSize="xs">
                      {asset.holdings ? `${asset.holdings} stocks` : '-'}
                    </Text>
                  </Td>
                )}

                <Td borderColor={borderColor}>
                  <Button
                    size="xs"
                    colorScheme="teal"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAnalyze([asset.ticker]);
                    }}
                    rightIcon={<Icon as={MdShowChart} />}
                  >
                    Analyze
                  </Button>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      {assets.length === 0 && (
        <Box p="40px" textAlign="center">
          <Text color={textColorSecondary} fontSize="sm">
            No assets found
          </Text>
        </Box>
      )}
    </Box>
  );
}
