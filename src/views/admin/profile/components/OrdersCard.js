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
    completed: { color: 'green', label: 'Hoàn thành' },
    refunded: { color: 'purple', label: 'Hoàn tiền' },
    pending: { color: 'orange', label: 'Chờ xử lý' },
    failed: { color: 'red', label: 'Thất bại' },
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
          Danh sách đơn hàng gần đây
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
                <Th>Mã đơn</Th>
                <Th>Ngày mua</Th>
                <Th>Gian hàng</Th>
                <Th>Mặt hàng</Th>
                <Th isNumeric>Số lượng</Th>
                <Th isNumeric>Tổng tiền</Th>
                <Th>Trạng thái</Th>
              </Tr>
            </Thead>

            <Tbody>
              {orders.length === 0 ? (
                <Tr>
                  <Td colSpan={7}>
                    <Text color={subtext} fontStyle="italic">
                      Chưa có đơn hàng.
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
