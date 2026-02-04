/* eslint-disable */
import {
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdAdd,
  MdDelete,
  MdHub,
} from 'react-icons/md';
import { request } from 'lib/api';

export default function PipelineList() {
  const [savedHorizons, setSavedHorizons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

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

  const handleDeleteHorizon = async (e, horizonId) => {
    e.stopPropagation();
    try {
      await request.delete(`/horizons/${horizonId}`);

      setSavedHorizons(savedHorizons.filter(h => h.id !== horizonId));

      toast({
        title: 'Horizon disabled',
        description: 'The horizon has been marked as inactive',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to disable horizon:', error);
      toast({
        title: 'Failed to disable horizon',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
    <Box h="100vh" bg="gray.50" p="40px">
      <VStack spacing="30px" maxW="1200px" mx="auto">
        <HStack justify="space-between" w="full">
          <VStack align="start" spacing="5px">
            <HStack spacing="12px">
              <Icon as={MdHub} color="teal.600" boxSize="32px" />
              <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                Horizons
              </Text>
            </HStack>
            <Text fontSize="md" color="gray.600">
              Select a horizon to work on or create a new one
            </Text>
          </VStack>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            colorScheme="teal"
            size="lg"
            onClick={handleNewHorizon}
          >
            New Horizon
          </Button>
        </HStack>

        {savedHorizons.length === 0 ? (
          <Box
            w="full"
            py="80px"
            textAlign="center"
            bg="white"
            borderRadius="16px"
            border="2px dashed"
            borderColor="gray.300"
          >
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
          </Box>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
            gap="20px"
            w="full"
          >
            {savedHorizons.map((horizon) => (
              <Box
                key={horizon.id}
                p="20px"
                bg="white"
                borderRadius="12px"
                border="2px solid"
                borderColor="gray.200"
                cursor="pointer"
                _hover={{ borderColor: 'teal.400', boxShadow: 'lg', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
                onClick={() => handleLoadHorizon(horizon)}
              >
                <HStack justify="space-between" mb="12px">
                  <HStack spacing="10px">
                    <Icon as={MdHub} color="teal.600" boxSize="24px" />
                    <Text fontSize="lg" fontWeight="bold" color="gray.800" noOfLines={1}>
                      {horizon.name}
                    </Text>
                  </HStack>
                  <IconButton
                    icon={<Icon as={MdDelete} />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={(e) => handleDeleteHorizon(e, horizon.id)}
                    aria-label="Disable horizon"
                  />
                </HStack>
                <Text fontSize="sm" color="gray.600" mb="12px">
                  Last modified: {new Date(horizon.updatedAt || horizon.savedAt).toLocaleDateString()}
                </Text>
                <HStack spacing="8px">
                  <Badge colorScheme="blue" fontSize="xs">
                    {horizon.nodes?.length || 0} nodes
                  </Badge>
                  <Badge colorScheme="purple" fontSize="xs">
                    {horizon.edges?.length || 0} connections
                  </Badge>
                </HStack>
              </Box>
            ))}
          </Box>
        )}
      </VStack>
    </Box>
  );
}
