import {
  Box,
  Flex,
  VStack,
  HStack,
  Icon,
  Text,
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
  useColorModeValue,
} from '@chakra-ui/react';
import {
  MdAccountTree,
  MdLibraryBooks,
  MdMenu,
  MdShowChart,
  MdSettings,
  MdLanguage,
  MdLogout,
} from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SidebarToggleIcon } from './SidebarToggleIcon';
import { useAuth } from 'context/AuthContext';
import { IDshorten } from 'utils'

const SidebarItem = ({ icon, label, onClick, isActive, isCollapsed, onExpand }) => {
  const activeColor = useColorModeValue('teal.600', 'teal.300');
  const inactiveColor = useColorModeValue('gray.700', 'gray.400');
  const iconColor = useColorModeValue('gray.600', 'gray.500');
  const hoverColor = useColorModeValue('gray.900', 'white');
  const activeBg = useColorModeValue('teal.50', 'whiteAlpha.200');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

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
        color={isActive ? activeColor : iconColor}
        bg={isActive ? activeBg : 'transparent'}
        _hover={{ color: hoverColor, bg: isActive ? activeBg : hoverBg }}
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
      color={isActive ? activeColor : inactiveColor}
      bg={isActive ? activeBg : 'transparent'}
      _hover={{ color: hoverColor, bg: isActive ? activeBg : hoverBg }}
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
  const { user = {}, logout } = useAuth();
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorLight = useColorModeValue('gray.500', 'gray.400');
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const popoverBg = useColorModeValue('white', 'gray.800');
  const logoutHoverBg = useColorModeValue('red.50', 'rgba(245, 101, 101, 0.1)');

  const {
    email = '',
    name = '',
    avatar = '',
  } = user || {};
  const navigate = useNavigate();

  const handleLogout = () => {
    logout()
  };

  return (
    <Popover placement="right-end">
      <PopoverTrigger>
        <Box
          cursor="pointer"
          p={isCollapsed ? "8px" : "10px"}
          borderRadius="8px"
          _hover={{ bg: hoverBg }}
          transition="all 0.2s"
          w="full"
        >
          {isCollapsed ? (
            <Flex justify="center">
              <Avatar src={avatar} size="sm" name={name || email} bg="teal.500" />
            </Flex>
          ) : (
            <HStack spacing="10px" w="full" >
              <Avatar src={avatar} size="sm" name={name || email} bg="teal.500" />
              <VStack align="start" spacing="0" flex="1">
                <Text fontSize="13px" fontWeight="600" color={textColor}>
                  Account
                </Text>
                <Text fontSize="11px" color={textColorLight}>
                  {IDshorten(email)}
                </Text>
              </VStack>
            </HStack>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent w="200px" borderRadius="12px" boxShadow="lg" bg={popoverBg}>
        <PopoverBody p="8px">
          <VStack spacing="4px" align="stretch">
            <Box
              as="button"
              p="10px"
              borderRadius="8px"
              _hover={{ bg: hoverBg }}
              transition="all 0.2s"
              onClick={() => navigate('/profile')}
            >
              <HStack spacing="10px">
                <Icon as={MdSettings} boxSize="18px" color={iconColor} />
                <Text fontSize="14px" color={textColor}>
                  Settings
                </Text>
              </HStack>
            </Box>

            <Box
              as="button"
              p="10px"
              borderRadius="8px"
              _hover={{ bg: hoverBg }}
              transition="all 0.2s"
            >
              <HStack spacing="10px">
                <Icon as={MdLanguage} boxSize="18px" color={iconColor} />
                <Text fontSize="14px" color={textColor}>
                  Language
                </Text>
              </HStack>
            </Box>

            <Divider />

            <Box
              as="button"
              p="10px"
              borderRadius="8px"
              _hover={{ bg: logoutHoverBg }}
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
  const textColor = useColorModeValue('gray.800', 'white');
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  const hoverColor = useColorModeValue('teal.600', 'teal.300');

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
        {isCollapsed ? (
          // Collapsed: Sidebar toggle icon only
          <VStack spacing="8px" w="full" mb="12px">
            <IconButton
              icon={<SidebarToggleIcon />}
              size="sm"
              variant="ghost"
              onClick={handleExpand}
              aria-label="Expand sidebar"
              color={iconColor}
              _hover={{ bg: hoverBg }}
            />
          </VStack>
        ) : (
          // Expanded: "Event Horizon" text + toggle icon
          <HStack justify="space-between" w="full" mb="16px" px="12px">
            <Text
              fontSize="16px"
              fontWeight="700"
              color={textColor}
              cursor="pointer"
              onClick={() => navigate('/')}
              _hover={{ color: hoverColor }}
              transition="color 0.2s"
            >
              Event Horizon
            </Text>
            <IconButton
              icon={<SidebarToggleIcon />}
              size="sm"
              variant="ghost"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              color={iconColor}
              _hover={{ bg: hoverBg }}
            />
          </HStack>
        )}

        <SidebarItem
          icon={MdAccountTree}
          label="Horizon"
          onClick={() => navigate('/pipeline')}
          isActive={currentPath === '/pipeline' || currentPath.startsWith('/pipeline/')}
          isCollapsed={isCollapsed}
          onExpand={handleExpand}
        />
        <SidebarItem
          icon={MdLibraryBooks}
          label="Library"
          onClick={() => navigate('/library')}
          isActive={currentPath === '/library'}
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
      <VStack spacing="8px" w="full" px="8px" >
        <Box
          cursor="pointer"
          onClick={isCollapsed ? handleExpand : undefined} w="full"
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
              onToggleCollapse={() => { }}
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
