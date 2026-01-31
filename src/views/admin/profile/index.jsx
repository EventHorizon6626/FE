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
import { request } from 'lib/api';

import Banner from './components/Banner';
import banner from 'assets/img/auth/banner.png';
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
    completed: { color: 'green', label: 'Completed' },
    refunded: { color: 'purple', label: 'Refunded' },
    pending: { color: 'orange', label: 'Pending' },
    failed: { color: 'red', label: 'Failed' },
  };
  const s = map[value] || { color: 'gray', label: value || 'N/A' };
  return <Badge colorScheme={s.color}>{s.label}</Badge>;
};

// ---------------- main ----------------
export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Clean white theme colors (Perplexity style)
  const cardBg = 'white';
  const border = 'gray.200';
  const subtext = 'gray.600';
  const textPrimary = '#1F2937';

  return (
    <Box minH="100vh" bg="#FAFAFA" p={{ base: '20px', md: '40px' }}>
      <Box maxW="1400px" mx="auto">
      <Banner banner={banner} />

      {/* Orders section removed */}
      </Box>
    </Box>
  );
}
