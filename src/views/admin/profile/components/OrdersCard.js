/* eslint-disable */
import React from 'react';
import {
  Text,
  Badge,
  HStack,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Box,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';

// -------- helpers --------
const formatVND = n =>
  (typeof n === 'number' ? n : Number(n || 0)).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });

const StatusPill = ({ value }) => {
  const map = {
    completed: { color: 'green', label: 'Completed' },
    refunded: { color: 'purple', label: 'Refunded' },
    pending: { color: 'orange', label: 'Pending' },
    failed: { color: 'red', label: 'Failed' },
  };

  const s = map[value] || { color: 'gray', label: value || 'N/A' };

  return <Badge colorScheme={s.color}>{s.label}</Badge>;
};

export default function OrdersCard({ orders = [], loading }) {
  // Colors
  const cardBg = useColorModeValue('white', 'navy.800');
  const textPrimary = useColorModeValue('secondaryGray.900', 'white');
  const subtext = useColorModeValue('gray.600', 'gray.400');

  return (
    <Card bg={cardBg} p="20px">
      {/* ----------- Header ----------- */}
      <Box mb="20px">
        <Text fontSize="xl" fontWeight="700" color={textPrimary}>
          Orders
        </Text>
        <Text mt="2px" fontSize="sm" color={subtext}>
          Recent order list
        </Text>
      </Box>

      {/* ----------- Loading ----------- */}
      {loading ? (
        <HStack spacing={3}>
          <Spinner size="sm" />
          <Text color={subtext}>Loading orders…</Text>
        </HStack>
      ) : (
        /* ----------- Table ----------- */
        <TableContainer>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Order ID</Th>
                <Th>Purchase Date</Th>
                <Th>Vendor</Th>
                <Th>Item</Th>
                <Th isNumeric>Quantity</Th>
                <Th isNumeric>Total</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>

            <Tbody>
              {orders.length === 0 ? (
                <Tr>
                  <Td colSpan={7}>
                    <Text color={subtext} fontStyle="italic">
                      No orders yet.
                    </Text>
                  </Td>
                </Tr>
              ) : (
                orders.map(o => (
                  <Tr key={o.id || o.code}>
                    <Td fontWeight="600">{o.code || o.id}</Td>

                    <Td>
                      {new Date(o.createdAt || o.date).toLocaleString('vi-VN')}
                    </Td>

                    <Td>{o.sellerName || o.vendor || '-'}</Td>
                    <Td>{o.productName || o.itemName || '-'}</Td>

                    <Td isNumeric>{o.quantity ?? 1}</Td>

                    <Td isNumeric>{formatVND(o.total)}</Td>

                    <Td>
                      <StatusPill value={o.status} />
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
