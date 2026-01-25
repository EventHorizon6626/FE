// src/views/admin/profile/index.jsx
/* eslint-disable */
import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Stack,
  HStack,
  Button,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { FiPlusCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Storage from 'views/admin/profile/components/Storage';

import { useAuth } from 'context/AuthContext';
// ⚠️ nếu bạn để axios wrapper ở chỗ khác, sửa lại import này cho đúng
import { request } from 'lib/api';

// (Giữ nguyên Banner hiện tại của dự án bạn)
// Nếu dự án dùng component Banner riêng, hãy giữ import cũ của bạn:
import Banner from './components/Banner'; // <-- nếu khác path, sửa lại cho khớp
import banner from 'assets/img/auth/banner.png';
import BalanceCard from './components/BalanceCard';
// import OrdersCard from './components/OrdersCard';
import Projects from './components/Projects';
import Notifications from './components/Notifications';
import GeneralInformation from './components/General';

// ---------------- helpers ----------------
const formatVND = (n) =>
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

// ---------------- main ----------------
export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [balance, setBalance] = React.useState(0);
  // const [orders, setOrders] = React.useState([]);

  const cardBg = useColorModeValue('white', 'navy.800');
  const border = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');
  const subtext = useColorModeValue('gray.600', 'gray.400');
  const textPrimary = useColorModeValue('secondaryGray.900', 'white');

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    try {
      // BE endpoints gợi ý (đã bàn trước):
      //  - GET /wallet/balance  -> { balance: number }
      const b = await request.get('/wallet/balance').catch(() => ({ balance: 0 }));

      setBalance(b?.balance ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* ===== Banner gốc của bạn ===== */}
      <Grid
        templateColumns={{
          base: '1fr',
          lg: '1.34fr 1fr 1.62fr',
        }}
        templateRows={{
          base: 'repeat(3, 1fr)',
          lg: '1fr',
        }}
        gap={{ base: '20px', xl: '20px' }}
      >
        <Banner gridArea="1 / 1 / 2 / 2" banner={banner} />
        {/* <Storage
          gridArea={{ base: '2 / 1 / 3 / 2', lg: '1 / 2 / 2 / 3' }}
          used={25.6}
          total={50}
        /> */}
        <BalanceCard />
      </Grid>

      {/* Orders section removed */}
    </Box>
  );
}
