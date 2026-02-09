/* eslint-disable */
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Icon,
  IconButton,
  Progress,
  Text,
  VStack,
  Badge,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MdPlayArrow,
  MdPause,
  MdSkipNext,
  MdSkipPrevious,
  MdTimer,
  MdFullscreen,
  MdFullscreenExit,
  MdRestartAlt,
  MdSpeakerNotes,
} from 'react-icons/md';

// ---------------------------------------------------------------------------
// Speech data — each slide has a section title, duration hint, and body lines.
// Body lines use light markup:  **bold**  is rendered as <strong>.
// ---------------------------------------------------------------------------

const SLIDES = [
  {
    id: 'opening',
    section: 'Opening — The Name',
    duration: 20,
    color: 'brand.500',
    lines: [
      'In physics, an **event horizon** is the boundary of a black hole — the point beyond which information cannot escape. In finance, every investor faces their own event horizon: the overwhelming flood of market data, news, earnings reports, and technical signals that no single human can process fast enough to make confident decisions.',
      '**Event Horizon** is our answer — an AI multi-agent platform that crosses that boundary for you.',
    ],
    note: 'Pause briefly after the name explanation for impact.',
  },
  {
    id: 'problem',
    section: 'The Problem',
    duration: 20,
    color: 'red.500',
    lines: [
      "Today's retail investors face an impossible challenge. To make one informed trade on a single stock, you need to analyze candlestick patterns, read earnings reports, scan news sentiment, study technical indicators, and evaluate fundamentals — across dozens of stocks, in real time.",
      'Professional hedge funds solve this with teams of specialized analysts. We asked: **what if AI agents could form that team for you?**',
    ],
    note: 'Emphasize the scale of the problem — dozens of stocks, real time.',
  },
  {
    id: 'solution',
    section: 'The Solution — How It Works',
    duration: 40,
    color: 'green.500',
    lines: [
      'Event Horizon is a **visual multi-agent pipeline builder** for financial analysis. It works in two systems — just like how the human brain processes decisions.',
      '**System 1: Data Pipeline.** Five specialized AI agents work in parallel — Candlestick, Earnings, News, Technical, and Fundamentals — each pulling real-time data from Yahoo Finance and NewsAPI. They normalize everything into a unified format.',
      "**System 2: Decision Engine.** This is where it gets interesting. We run a **Bull vs. Bear debate**. One AI agent builds the strongest case to buy. Another builds the strongest case to sell. Then a Research Manager synthesizes both sides, weighs the evidence, and delivers a final recommendation with a confidence score and position size.",
      "It's not one AI giving you an answer — it's a **team of AI agents arguing and reasoning** to reach the best decision.",
    ],
    note: 'Slow down for System 1 & 2 — let the audience absorb the architecture.',
  },
  {
    id: 'demo-dashboard',
    section: 'Live Demo — Dashboard',
    duration: 12,
    color: 'brand.500',
    lines: [
      'Let me show you how it works.',
      "**[Dashboard]** Here's our market dashboard — tracking stocks, crypto, and indices with real-time metrics.",
    ],
    note: 'Point at the dashboard screen.',
  },
  {
    id: 'demo-builder',
    section: 'Live Demo — Horizon Builder',
    duration: 12,
    color: 'brand.500',
    lines: [
      '**[Horizon Builder]** This is the heart of Event Horizon — a drag-and-drop pipeline builder. I drag a portfolio with AAPL and NVDA onto the canvas. I click the **plus button** — and connect a Data Agent and an Analyzer.',
    ],
    note: 'Demonstrate dragging nodes onto the canvas.',
  },
  {
    id: 'demo-run',
    section: 'Live Demo — Run Agent',
    duration: 12,
    color: 'brand.500',
    lines: [
      '**[Run Agent]** I hit play. Watch — the data agents fetch live market data in parallel. Within seconds, we have candlestick charts, news articles, technical indicators, all flowing through the pipeline.',
    ],
    note: 'Click play and let the audience watch data flow in.',
  },
  {
    id: 'demo-custom',
    section: 'Live Demo — Custom Agent',
    duration: 12,
    color: 'orange.500',
    lines: [
      "**[Custom Agent]** Now here's what makes this powerful — I can create my **own custom agent**. I describe what I want: 'Analyze semiconductor supply chain risks.' The AI auto-generates a specialized system prompt. My agent can even **request additional data it needs** — the system automatically spins up new data agents on the fly.",
    ],
    note: 'Show the custom agent creation flow.',
  },
  {
    id: 'demo-bullbear',
    section: 'Live Demo — Bull-Bear Debate',
    duration: 12,
    color: 'yellow.500',
    lines: [
      "**[Bull-Bear Debate]** And here's the final output — our Bull vs. Bear debate. The Bull agent says NVDA is a strong buy based on AI demand growth. The Bear agent counters with valuation concerns. The Manager synthesizes: **BUY with 72% confidence, recommended 8% portfolio allocation.**",
      "Every step is **fully traceable** — you can inspect every edge, every agent's reasoning, every data flow.",
    ],
    note: 'Give the Bull-Bear debate the most demo time — this is the wow moment.',
  },
  {
    id: 'closing',
    section: 'Closing — Why It Matters',
    duration: 20,
    color: 'brand.500',
    lines: [
      'Event Horizon democratizes institutional-grade analysis. Instead of a black-box AI giving you a buy or sell, you get **a transparent team of AI agents that debate, reason, and show their work.**',
      'You can build custom pipelines, create your own specialized agents, and watch AI analysts argue about your portfolio — all from a visual drag-and-drop interface.',
      "**Event Horizon — crossing the boundary of what's possible in AI-powered investing.**",
      'Thank you.',
    ],
    note: 'End confidently on the tagline. Hold eye contact.',
  },
];

const TOTAL_DURATION = SLIDES.reduce((s, sl) => s + sl.duration, 0);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render **bold** markdown fragments as <strong> */
function renderLine(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text as="strong" key={i} fontWeight="700" color="gray.900">
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DemoPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [slideElapsed, setSlideElapsed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const containerRef = useRef(null);
  const toast = useToast();

  const slide = SLIDES[currentSlide];
  const progress = ((currentSlide + 1) / SLIDES.length) * 100;
  const slideOvertime = slideElapsed > slide.duration;

  // Timer tick
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setElapsed((e) => e + 1);
      setSlideElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // Navigation
  const goTo = useCallback((idx) => {
    if (idx < 0 || idx >= SLIDES.length) return;
    setCurrentSlide(idx);
    setSlideElapsed(0);
  }, []);

  const next = useCallback(() => goTo(currentSlide + 1), [currentSlide, goTo]);
  const prev = useCallback(() => goTo(currentSlide - 1), [currentSlide, goTo]);

  const reset = useCallback(() => {
    setCurrentSlide(0);
    setElapsed(0);
    setSlideElapsed(0);
    setIsRunning(false);
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'f') {
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (isFullscreen) toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, isFullscreen, toggleFullscreen]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Warn when total time exceeds 3 min
  useEffect(() => {
    if (elapsed === 180 && isRunning) {
      toast({
        title: '3 minutes reached',
        description: 'You have hit the target speech duration.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
    }
  }, [elapsed, isRunning, toast]);

  return (
    <Box
      ref={containerRef}
      bg={isFullscreen ? '#0a0e1a' : 'secondaryGray.300'}
      minH={isFullscreen ? '100vh' : 'calc(100vh - 80px)'}
      transition="background 0.3s"
    >
      <Container maxW="container.lg" py={isFullscreen ? '40px' : '24px'}>
        {/* ---- Top bar ---- */}
        <Flex justify="space-between" align="center" mb="24px">
          <HStack spacing="12px">
            <Text
              fontSize="20px"
              fontWeight="700"
              color={isFullscreen ? 'white' : 'gray.900'}
              letterSpacing="-0.02em"
            >
              Demo Teleprompter
            </Text>
            <Badge
              colorScheme={elapsed > TOTAL_DURATION ? 'red' : 'green'}
              fontSize="xs"
              px="8px"
              py="2px"
              borderRadius="full"
            >
              {formatTime(elapsed)} / {formatTime(TOTAL_DURATION)}
            </Badge>
          </HStack>

          <HStack spacing="6px">
            <Tooltip label={showNotes ? 'Hide speaker notes' : 'Show speaker notes'}>
              <IconButton
                icon={<MdSpeakerNotes />}
                size="sm"
                variant={showNotes ? 'solid' : 'ghost'}
                colorScheme="teal"
                borderRadius="8px"
                aria-label="Toggle notes"
                onClick={() => setShowNotes((n) => !n)}
              />
            </Tooltip>
            <Tooltip label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              <IconButton
                icon={isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
                size="sm"
                variant="ghost"
                color={isFullscreen ? 'white' : 'gray.600'}
                borderRadius="8px"
                aria-label="Toggle fullscreen"
                onClick={toggleFullscreen}
              />
            </Tooltip>
            <Tooltip label="Reset">
              <IconButton
                icon={<MdRestartAlt />}
                size="sm"
                variant="ghost"
                color={isFullscreen ? 'white' : 'gray.600'}
                borderRadius="8px"
                aria-label="Reset presentation"
                onClick={reset}
              />
            </Tooltip>
          </HStack>
        </Flex>

        {/* ---- Progress bar ---- */}
        <Box mb="24px">
          <Progress
            value={progress}
            size="xs"
            borderRadius="full"
            colorScheme="brand"
            bg={isFullscreen ? 'whiteAlpha.200' : 'gray.200'}
          />
          <Flex justify="space-between" mt="6px">
            {SLIDES.map((sl, i) => (
              <Box
                key={sl.id}
                as="button"
                onClick={() => goTo(i)}
                w={`${100 / SLIDES.length}%`}
                textAlign="center"
                cursor="pointer"
                opacity={i <= currentSlide ? 1 : 0.4}
                transition="opacity 0.2s"
              >
                <Text
                  fontSize="10px"
                  fontWeight={i === currentSlide ? '700' : '500'}
                  color={
                    i === currentSlide
                      ? isFullscreen
                        ? 'white'
                        : 'brand.600'
                      : isFullscreen
                        ? 'whiteAlpha.600'
                        : 'gray.500'
                  }
                  isTruncated
                >
                  {i + 1}
                </Text>
              </Box>
            ))}
          </Flex>
        </Box>

        {/* ---- Slide card ---- */}
        <Box
          bg={isFullscreen ? 'whiteAlpha.50' : 'white'}
          borderRadius="16px"
          border="1px solid"
          borderColor={isFullscreen ? 'whiteAlpha.100' : 'gray.200'}
          overflow="hidden"
          mb="24px"
          shadow={isFullscreen ? 'dark-lg' : 'sm'}
        >
          {/* Section header */}
          <Flex
            align="center"
            justify="space-between"
            px="28px"
            py="14px"
            borderBottom="1px solid"
            borderColor={isFullscreen ? 'whiteAlpha.100' : 'gray.100'}
            bg={isFullscreen ? 'whiteAlpha.50' : 'gray.50'}
          >
            <HStack spacing="12px">
              <Box w="10px" h="10px" borderRadius="full" bg={slide.color} />
              <Text
                fontSize="14px"
                fontWeight="700"
                color={isFullscreen ? 'white' : 'gray.800'}
                textTransform="uppercase"
                letterSpacing="0.05em"
              >
                {slide.section}
              </Text>
              <Badge fontSize="xs" colorScheme="gray" borderRadius="full">
                {currentSlide + 1} / {SLIDES.length}
              </Badge>
            </HStack>

            {/* Slide timer */}
            <HStack spacing="6px">
              <Icon
                as={MdTimer}
                boxSize="16px"
                color={slideOvertime ? 'red.400' : isFullscreen ? 'whiteAlpha.700' : 'gray.500'}
              />
              <Text
                fontSize="13px"
                fontWeight="600"
                fontFamily="mono"
                color={slideOvertime ? 'red.400' : isFullscreen ? 'whiteAlpha.700' : 'gray.600'}
              >
                {formatTime(slideElapsed)} / {formatTime(slide.duration)}
              </Text>
            </HStack>
          </Flex>

          {/* Speech body */}
          <Box px="32px" py="28px">
            <VStack spacing="20px" align="stretch">
              {slide.lines.map((line, i) => (
                <Text
                  key={i}
                  fontSize={isFullscreen ? '22px' : '17px'}
                  lineHeight="1.75"
                  color={isFullscreen ? 'whiteAlpha.900' : 'gray.700'}
                  fontWeight="400"
                >
                  {renderLine(line)}
                </Text>
              ))}
            </VStack>
          </Box>

          {/* Speaker notes */}
          {showNotes && slide.note && (
            <Box
              px="28px"
              py="14px"
              borderTop="1px solid"
              borderColor={isFullscreen ? 'whiteAlpha.100' : 'gray.100'}
              bg={isFullscreen ? 'whiteAlpha.50' : 'orange.50'}
            >
              <HStack spacing="8px">
                <Icon
                  as={MdSpeakerNotes}
                  boxSize="14px"
                  color={isFullscreen ? 'orange.300' : 'orange.500'}
                />
                <Text
                  fontSize="13px"
                  fontStyle="italic"
                  color={isFullscreen ? 'orange.200' : 'orange.700'}
                >
                  {slide.note}
                </Text>
              </HStack>
            </Box>
          )}
        </Box>

        {/* ---- Controls ---- */}
        <Flex justify="center" align="center" gap="12px">
          <IconButton
            icon={<MdSkipPrevious />}
            size="lg"
            variant="ghost"
            color={isFullscreen ? 'white' : 'gray.600'}
            borderRadius="full"
            aria-label="Previous slide"
            onClick={prev}
            isDisabled={currentSlide === 0}
          />
          <Button
            leftIcon={isRunning ? <MdPause /> : <MdPlayArrow />}
            size="lg"
            colorScheme="brand"
            borderRadius="full"
            px="32px"
            fontWeight="600"
            onClick={() => setIsRunning((r) => !r)}
          >
            {isRunning ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start Timer'}
          </Button>
          <IconButton
            icon={<MdSkipNext />}
            size="lg"
            variant="ghost"
            color={isFullscreen ? 'white' : 'gray.600'}
            borderRadius="full"
            aria-label="Next slide"
            onClick={next}
            isDisabled={currentSlide === SLIDES.length - 1}
          />
        </Flex>

        {/* ---- Keyboard hint ---- */}
        <Text
          textAlign="center"
          fontSize="11px"
          color={isFullscreen ? 'whiteAlpha.400' : 'gray.400'}
          mt="16px"
        >
          Arrow keys or Space to navigate &middot; F for fullscreen &middot; Esc to exit
        </Text>

        {/* ---- Slide overview strip ---- */}
        <Flex mt="32px" gap="8px" overflowX="auto" pb="8px">
          {SLIDES.map((sl, i) => (
            <Box
              key={sl.id}
              as="button"
              onClick={() => goTo(i)}
              flex="0 0 auto"
              w="140px"
              p="10px"
              borderRadius="10px"
              border="2px solid"
              borderColor={
                i === currentSlide
                  ? 'brand.500'
                  : isFullscreen
                    ? 'whiteAlpha.100'
                    : 'gray.200'
              }
              bg={
                i === currentSlide
                  ? isFullscreen
                    ? 'whiteAlpha.100'
                    : 'brand.50'
                  : isFullscreen
                    ? 'whiteAlpha.50'
                    : 'white'
              }
              opacity={i < currentSlide ? 0.5 : 1}
              transition="all 0.2s"
              _hover={{
                borderColor: 'brand.400',
                transform: 'translateY(-2px)',
              }}
            >
              <HStack spacing="6px" mb="4px">
                <Box w="6px" h="6px" borderRadius="full" bg={sl.color} />
                <Text
                  fontSize="10px"
                  fontWeight="600"
                  color={isFullscreen ? 'whiteAlpha.700' : 'gray.600'}
                  isTruncated
                >
                  {sl.section}
                </Text>
              </HStack>
              <Text
                fontSize="9px"
                color={isFullscreen ? 'whiteAlpha.500' : 'gray.400'}
              >
                ~{sl.duration}s
              </Text>
            </Box>
          ))}
        </Flex>
      </Container>
    </Box>
  );
}
