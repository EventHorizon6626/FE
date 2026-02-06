/* eslint-disable */
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdAdd,
  MdDelete,
  MdHub,
  MdSearch,
} from 'react-icons/md';
import { request } from 'lib/api';
import { formatRelativeTime } from 'utils/formatTime';

export default function PipelineList() {
  const [savedHorizons, setSavedHorizons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [horizonToDelete, setHorizonToDelete] = useState(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated'); // 'updated', 'created', 'name'

  useEffect(() => {
    const loadHorizons = async () => {
      try {
        setIsLoading(true);
        const result = await request.get('/horizons');
        if (result.success && result.data) {
          console.log('[PipelineList] Loaded horizons:', result.data);
          console.log('[PipelineList] First horizon keys:', result.data[0] ? Object.keys(result.data[0]) : 'No horizons');
          setSavedHorizons(result.data);
        }
      } catch (error) {
        console.error('Failed to load horizons:', error);
        toast({
          title: 'Failed to load horizons',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadHorizons();
  }, [toast]);

  const handleNewHorizon = async () => {
    const newHorizonName = `Untitled ${savedHorizons.length + 1}`;

    try {
      const horizonData = {
        name: newHorizonName,
        description: '', // Add empty description
        edges: [],
        viewport: { x: 0, y: 0, zoom: 0.9 },
      };

      const response = await request.post('/horizons', horizonData);
      const createdHorizon = response.data;

      console.log('[PipelineList] Created horizon:', createdHorizon);

      setSavedHorizons([...savedHorizons, createdHorizon]);

      navigate(`/pipeline/${createdHorizon.id}`);

      toast({
        title: 'New horizon created',
        description: newHorizonName,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to create horizon:', error);
      toast({
        title: 'Failed to create horizon',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLoadHorizon = (horizon) => {
    const horizonId = horizon.id;
    if (!horizonId) {
      console.error('Horizon ID not found:', horizon);
      toast({
        title: 'Error',
        description: 'Horizon ID is missing',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    console.log('Navigating to horizon:', horizonId);
    navigate(`/pipeline/${horizonId}`);
  };

  const handleDeleteClick = (e, horizon) => {
    e.stopPropagation();
    setHorizonToDelete(horizon);
    onDeleteOpen();
  };

  const handleConfirmDelete = async () => {
    if (!horizonToDelete) return;

    try {
      await request.delete(`/horizons/${horizonToDelete.id}`);

      setSavedHorizons(savedHorizons.filter(h => h.id !== horizonToDelete.id));

      toast({
        title: 'Horizon deleted',
        description: `"${horizonToDelete.name}" has been deleted`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to delete horizon:', error);
      toast({
        title: 'Failed to delete horizon',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setHorizonToDelete(null);
      onDeleteClose();
    }
  };

  // Filter and sort horizons
  const filteredAndSortedHorizons = savedHorizons
    .filter((horizon) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        horizon.name.toLowerCase().includes(query) ||
        (horizon.description && horizon.description.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'updated':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

  if (isLoading) {
    return (
      <Box h="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <VStack spacing="20px">
          <Icon as={MdHub} boxSize="64px" color="teal.500" />
          <Text fontSize="xl" fontWeight="600" color="gray.700">Loading horizons...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box h="100vh" bg="#FAFAFA" p="40px">
      <VStack spacing="30px" maxW="1200px" mx="auto">
        <HStack justify="space-between" w="full" mb="20px">
          <Text fontSize="3xl" fontWeight="bold" color="gray.800">
            Horizons
          </Text>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            colorScheme="teal"
            size="md"
            onClick={handleNewHorizon}
          >
            New Horizon
          </Button>
        </HStack>

        <HStack spacing="15px" w="full" mb="25px">
          <InputGroup flex="1">
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search horizons..."
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
              <option value="updated">Updated</option>
              <option value="created">Created</option>
              <option value="name">Name</option>
            </Select>
          </HStack>
        </HStack>

        {filteredAndSortedHorizons.length === 0 ? (
          <Box
            w="full"
            py="80px"
            textAlign="center"
            bg="white"
            borderRadius="16px"
            border="2px dashed"
            borderColor="gray.300"
          >
            {searchQuery ? (
              <>
                <Icon as={MdSearch} boxSize="64px" color="gray.300" mb="20px" />
                <Text fontSize="xl" fontWeight="600" color="gray.600" mb="10px">
                  No horizons found
                </Text>
                <Text fontSize="md" color="gray.500" mb="20px">
                  No horizons match "{searchQuery}"
                </Text>
                <Button
                  variant="outline"
                  colorScheme="teal"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              </>
            ) : (
              <>
                <Icon as={MdHub} boxSize="64px" color="gray.300" mb="20px" />
                <Text fontSize="xl" fontWeight="600" color="gray.600" mb="10px">
                  No horizons yet
                </Text>
                <Text fontSize="md" color="gray.500" mb="20px">
                  Create your first horizon to get started
                </Text>
                <Button
                  leftIcon={<Icon as={MdAdd} />}
                  colorScheme="teal"
                  size="lg"
                  onClick={handleNewHorizon}
                >
                  Create First Horizon
                </Button>
              </>
            )}
          </Box>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))"
            gap="20px"
            w="full"
          >
            {filteredAndSortedHorizons.map((horizon) => (
              <Box
                key={horizon.id}
                p="24px"
                bg="white"
                borderRadius="12px"
                border="1px solid"
                borderColor="gray.200"
                cursor="pointer"
                _hover={{
                  borderColor: 'gray.300',
                  boxShadow: 'md',
                  transform: 'translateY(-2px)'
                }}
                transition="all 0.2s"
                onClick={() => handleLoadHorizon(horizon)}
                position="relative"
                role="group"
              >
                {/* Delete button - shows on hover */}
                <IconButton
                  icon={<Icon as={MdDelete} />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={(e) => handleDeleteClick(e, horizon)}
                  aria-label="Delete horizon"
                  position="absolute"
                  top="16px"
                  right="16px"
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                />

                {/* Horizon Title */}
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color="gray.800"
                  mb="12px"
                  noOfLines={1}
                  pr="40px"
                >
                  {horizon.name}
                </Text>

                {/* Description */}
                <Text
                  fontSize="sm"
                  color="gray.600"
                  mb="16px"
                  noOfLines={3}
                  minHeight="60px"
                >
                  {horizon.description || 'No description'}
                </Text>

                {/* Updated timestamp */}
                <Text fontSize="sm" color="gray.500">
                  Updated {formatRelativeTime(horizon.updatedAt)}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </VStack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Horizon
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{horizonToDelete?.name}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
