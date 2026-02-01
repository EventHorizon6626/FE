import {
  Box,
  Flex,
  VStack,
  Icon,
  Text,
  Image,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
} from '@chakra-ui/react';
import {
  MdTrendingUp,
  MdPerson,
  MdFileDownload,
  MdMenu,
} from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';

const SidebarItem = ({ icon, label, onClick, isActive }) => {
  return (
    <VStack
      as="button"
      spacing="4px"
      py="12px"
      px="8px"
      cursor="pointer"
      color={isActive ? 'teal.600' : 'gray.600'}
      bg={isActive ? 'teal.50' : 'transparent'}
      _hover={{ color: 'gray.900', bg: isActive ? 'teal.50' : 'gray.50' }}
      borderRadius="8px"
      transition="all 0.2s"
      onClick={onClick}
      w="full"
    >
      <Icon as={icon} boxSize="20px" />
      <Text fontSize="11px" fontWeight="500">
        {label}
      </Text>
    </VStack>
  );
};

const SidebarContent = ({ navigate, currentPath }) => {
  return (
    <VStack spacing="0" h="full" justify="space-between" py="16px">
      {/* Top Section */}
      <VStack spacing="4px" w="full" px="8px">
        {/* Logo */}
        <Box mb="12px" cursor="pointer" onClick={() => navigate('/')}>
          <Image src="/logo.svg" alt="Event Horizon" h="28px" w="28px" />
        </Box>

        <SidebarItem
          icon={MdTrendingUp}
          label="Portfolio"
          onClick={() => navigate('/portfolio')}
          isActive={currentPath === '/portfolio'}
        />
      </VStack>

      {/* Bottom Section */}
      <VStack spacing="4px" w="full" px="8px">
        <SidebarItem
          icon={MdPerson}
          label="Account"
          onClick={() => navigate('/profile')}
          isActive={currentPath === '/profile'}
        />
        <SidebarItem icon={MdFileDownload} label="Install" onClick={() => {}} />
      </VStack>
    </VStack>
  );
};

export default function EventHorizonLayout({ children, showMobileMenu = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex minH="100vh" bg="#FAFAFA">
      {/* Desktop Left Sidebar */}
      <Box
        w="68px"
        borderRight="1px solid"
        borderColor="gray.200"
        bg="white"
        position="fixed"
        h="100vh"
        left="0"
        top="0"
        zIndex="10"
        display={{ base: 'none', md: 'block' }}
      >
        <SidebarContent navigate={navigate} currentPath={location.pathname} />
      </Box>

      {/* Mobile Menu Button */}
      {showMobileMenu && (
        <IconButton
          icon={<MdMenu />}
          position="fixed"
          top="16px"
          left="16px"
          zIndex="20"
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          variant="ghost"
          aria-label="Open menu"
        />
      )}

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW="68px">
          <DrawerBody p="0">
            <SidebarContent navigate={navigate} currentPath={location.pathname} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box
        flex="1"
        ml={{ base: '0', md: '68px' }}
        pt={{ base: '60px', md: '0' }}
        minH="100vh"
      >
        {children}
      </Box>
    </Flex>
  );
}
