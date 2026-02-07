import {
  Box,
  Flex,
  VStack,
  HStack,
  Icon,
  Text,
  Image,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Avatar,
  Divider,
} from '@chakra-ui/react';
import {
  MdAccountTree,
  MdMenu,
  MdShowChart,
  MdChevronLeft,
  MdChevronRight,
  MdSettings,
  MdLanguage,
  MdLogout,
} from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const SidebarItem = ({ icon, label, onClick, isActive, isCollapsed, onExpand }) => {
  const handleClick = () => {
    if (isCollapsed) {
      // If collapsed, expand the sidebar first
      onExpand();
    } else {
      // If expanded, navigate normally
      onClick();
    }
  };

  if (isCollapsed) {
    // Collapsed mode: Show only icon centered
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
        onClick={handleClick}
        w="full"
      >
        <Icon as={icon} boxSize="20px" />
      </VStack>
    );
  }

  // Expanded mode: Show icon and label horizontally
  return (
    <HStack
      as="button"
      spacing="12px"
      py="10px"
      px="12px"
      cursor="pointer"
      color={isActive ? 'teal.600' : 'gray.700'}
      bg={isActive ? 'teal.50' : 'transparent'}
      _hover={{ color: 'gray.900', bg: isActive ? 'teal.50' : 'gray.50' }}
      borderRadius="8px"
      transition="all 0.2s"
      onClick={handleClick}
      w="full"
      justify="flex-start"
    >
      <Icon as={icon} boxSize="20px" />
      <Text fontSize="14px" fontWeight="500">
        {label}
      </Text>
    </HStack>
  );
};

const AccountMenu = ({ isCollapsed }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any auth tokens
    localStorage.removeItem('token');
    // Navigate to sign in
    navigate('/auth/sign-in');
  };

  return (
    <Popover placement="right-end">
      <PopoverTrigger>
        <Box
          cursor="pointer"
          p={isCollapsed ? "8px" : "10px"}
          borderRadius="8px"
          _hover={{ bg: 'gray.50' }}
          transition="all 0.2s"
          w="full"
        >
          {isCollapsed ? (
            <Flex justify="center">
              <Avatar size="sm" name="User" bg="teal.500" />
            </Flex>
          ) : (
            <HStack spacing="10px">
              <Avatar size="sm" name="User" bg="teal.500" />
              <VStack align="start" spacing="0" flex="1">
                <Text fontSize="13px" fontWeight="600" color="gray.800">
                  Account
                </Text>
                <Text fontSize="11px" color="gray.500">
                  user@email.com
                </Text>
              </VStack>
            </HStack>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent w="200px" borderRadius="12px" boxShadow="lg">
        <PopoverBody p="8px">
          <VStack spacing="4px" align="stretch">
            <Box
              as="button"
              p="10px"
              borderRadius="8px"
              _hover={{ bg: 'gray.50' }}
              transition="all 0.2s"
              onClick={() => navigate('/profile')}
            >
              <HStack spacing="10px">
                <Icon as={MdSettings} boxSize="18px" color="gray.600" />
                <Text fontSize="14px" color="gray.800">
                  Settings
                </Text>
              </HStack>
            </Box>

            <Box
              as="button"
              p="10px"
              borderRadius="8px"
              _hover={{ bg: 'gray.50' }}
              transition="all 0.2s"
            >
              <HStack spacing="10px">
                <Icon as={MdLanguage} boxSize="18px" color="gray.600" />
                <Text fontSize="14px" color="gray.800">
                  Language
                </Text>
              </HStack>
            </Box>

            <Divider />

            <Box
              as="button"
              p="10px"
              borderRadius="8px"
              _hover={{ bg: 'red.50' }}
              transition="all 0.2s"
              onClick={handleLogout}
            >
              <HStack spacing="10px">
                <Icon as={MdLogout} boxSize="18px" color="red.600" />
                <Text fontSize="14px" color="red.600">
                  Log out
                </Text>
              </HStack>
            </Box>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const SidebarContent = ({ navigate, currentPath, isCollapsed, onToggleCollapse }) => {
  const handleExpand = () => {
    if (isCollapsed) {
      onToggleCollapse();
    }
  };

  return (
    <VStack spacing="0" h="full" justify="space-between" py="16px">
      {/* Top Section */}
      <VStack spacing="4px" w="full" px="8px">
        {/* Logo and Toggle */}
        <HStack justify="space-between" w="full" mb="12px">
          <Box
            cursor="pointer"
            onClick={isCollapsed ? handleExpand : () => navigate('/')}
          >
            <Image src="/logo.svg" alt="Event Horizon" h="28px" w="28px" />
          </Box>
          {!isCollapsed && (
            <IconButton
              icon={<Icon as={MdChevronLeft} />}
              size="xs"
              variant="ghost"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
            />
          )}
        </HStack>

        <SidebarItem
          icon={MdAccountTree}
          label="Horizon"
          onClick={() => navigate('/pipeline')}
          isActive={currentPath === '/pipeline' || currentPath.startsWith('/pipeline/')}
          isCollapsed={isCollapsed}
          onExpand={handleExpand}
        />
        <SidebarItem
          icon={MdShowChart}
          label="Dashboard"
          onClick={() => navigate('/dashboard')}
          isActive={currentPath === '/dashboard'}
          isCollapsed={isCollapsed}
          onExpand={handleExpand}
        />
      </VStack>

      {/* Bottom Section */}
      <VStack spacing="8px" w="full" px="8px">
        {isCollapsed && (
          <IconButton
            icon={<Icon as={MdChevronRight} />}
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            mb="8px"
          />
        )}
        <Box
          cursor="pointer"
          onClick={isCollapsed ? handleExpand : undefined}
        >
          <AccountMenu isCollapsed={isCollapsed} />
        </Box>
      </VStack>
    </VStack>
  );
};

export default function EventHorizonLayout({ children, showMobileMenu = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarWidth = isCollapsed ? '68px' : '200px';

  return (
    <Flex minH="100vh" bg="#FAFAFA">
      {/* Desktop Left Sidebar */}
      <Box
        w={sidebarWidth}
        borderRight="1px solid"
        borderColor="gray.200"
        bg="white"
        position="fixed"
        h="100vh"
        left="0"
        top="0"
        zIndex="10"
        display={{ base: 'none', md: 'block' }}
        transition="width 0.3s ease"
      >
        <SidebarContent
          navigate={navigate}
          currentPath={location.pathname}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
        />
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
        <DrawerContent maxW="200px">
          <DrawerBody p="0">
            <SidebarContent
              navigate={navigate}
              currentPath={location.pathname}
              isCollapsed={false}
              onToggleCollapse={() => {}}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box
        flex="1"
        ml={{ base: '0', md: sidebarWidth }}
        pt={{ base: '60px', md: '0' }}
        minH="100vh"
        transition="margin-left 0.3s ease"
      >
        {children}
      </Box>
    </Flex>
  );
}
