import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Tooltip,
  InputAdornment,
  alpha,
  useMediaQuery,
  Fade,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  AutoAwesome as SparklesIcon,
  Send as SendIcon,
  StopCircle as StopIcon,
  Circle as DotIcon,
} from "@mui/icons-material";
import { theme } from "./theme/appTheme";
import { Sidebar } from "./components/Sidebar";
import { ChatMessage } from "./components/ChatMessage";
import { GeminiModel, ChatSession, Message, MessageRole } from "./utils/types";
import { geminiService } from "./utils/aiConnect";

const STORAGE_KEY = "veritas_chat_sessions_v1";
const DRAWER_WIDTH = 280;

export default function App() {
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(
    GeminiModel.FLASH
  );
  const [enableNewsMode, setEnableNewsMode] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Load chats on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        } else {
          createNewSession();
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
        createNewSession();
      }
    } else {
      createNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save chats on update
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, currentSessionId, isProcessing]);

  const getCurrentSession = () =>
    sessions.find((s) => s.id === currentSessionId);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: "New Investigation",
      model: selectedModel,
      messages: [
        {
          id: uuidv4(),
          role: MessageRole.SYSTEM,
          content: "System initialized. Welcome to Veritas.",
          timestamp: Date.now(),
        },
        {
          id: uuidv4(),
          role: MessageRole.MODEL,
          content:
            "I am Veritas, your bias-aware news analyst. Enter a topic, and I will search mainstream and alternative sources to provide a unified truth-line.",
          timestamp: Date.now(),
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter((s) => s.id !== id);
    setSessions(newSessions);
    if (currentSessionId === id) {
      setCurrentSessionId(newSessions.length > 0 ? newSessions[0].id : null);
      if (newSessions.length === 0) {
        setTimeout(() => createNewSession(), 0);
      }
    }
  };

  const updateCurrentSession = (
    updater: (session: ChatSession) => ChatSession
  ) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === currentSessionId ? updater(s) : s))
    );
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !currentSessionId || isProcessing) return;

    const currentSession = getCurrentSession();
    if (!currentSession) return;

    const userMsgId = uuidv4();
    const userMsg: Message = {
      id: userMsgId,
      role: MessageRole.USER,
      content: input,
      timestamp: Date.now(),
    };

    // Update title if first user message
    const isFirstUserMsg =
      currentSession.messages.filter((m) => m.role === MessageRole.USER)
        .length === 0;
    const newTitle = isFirstUserMsg
      ? input.slice(0, 30) + (input.length > 30 ? "..." : "")
      : currentSession.title;

    updateCurrentSession((s) => ({
      ...s,
      title: newTitle,
      messages: [...s.messages, userMsg],
      updatedAt: Date.now(),
    }));

    setInput("");
    setIsProcessing(true);

    // Create placeholder bot message
    const botMsgId = uuidv4();
    const botPlaceholder: Message = {
      id: botMsgId,
      role: MessageRole.MODEL,
      content: "",
      timestamp: Date.now(),
      isLoading: true,
    };

    updateCurrentSession((s) => ({
      ...s,
      messages: [...s.messages, botPlaceholder],
    }));

    try {
      const history = getCurrentSession()?.messages || [];
      const contextMessages = [...history, userMsg];

      await geminiService.streamChatResponse(
        selectedModel,
        contextMessages,
        input,
        enableNewsMode,
        (text, grounding, metrics) => {
          updateCurrentSession((s) => ({
            ...s,
            messages: s.messages.map((m) =>
              m.id === botMsgId
                ? {
                    ...m,
                    content: text,
                    groundingSources: grounding,
                    metrics: metrics,
                    isLoading: true,
                  }
                : m
            ),
          }));
        }
      );

      // Finalize loading state
      updateCurrentSession((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === botMsgId ? { ...m, isLoading: false } : m
        ),
      }));
    } catch (error) {
      console.error(error);
      updateCurrentSession((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                content: "Error: Unable to analyze sources. Please try again.",
                isLoading: false,
              }
            : m
        ),
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeSession = getCurrentSession();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* Sidebar */}
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={(id) => {
            setCurrentSessionId(id);
            setIsSidebarOpen(false);
          }}
          onNewChat={createNewSession}
          onDeleteSession={deleteSession}
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          drawerWidth={DRAWER_WIDTH}
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { md: 0 },
          }}
        >
          {/* App Bar */}
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
              ml: { md: `${DRAWER_WIDTH}px` },
            }}
          >
            <Toolbar sx={{ gap: 2 }}>
              {/* Mobile Menu Button */}
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setIsSidebarOpen(true)}
                sx={{ display: { md: "none" } }}
              >
                <MenuIcon />
              </IconButton>

              {/* Title Section */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    lineHeight: 1.2,
                  }}
                  noWrap
                >
                  {activeSession?.title || "Veritas"}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {selectedModel === GeminiModel.PRO
                      ? "Reasoning Model"
                      : "Speed Model"}
                  </Typography>
                  <DotIcon sx={{ fontSize: 6, color: "text.disabled" }} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: enableNewsMode
                        ? "secondary.main"
                        : "text.disabled",
                    }}
                  >
                    {enableNewsMode ? "Live Search Active" : "Offline Mode"}
                  </Typography>
                </Box>
              </Box>

              {/* Model Selector */}
              <FormControl
                size="small"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                <Select
                  value={selectedModel}
                  onChange={(e) =>
                    setSelectedModel(e.target.value as GeminiModel)
                  }
                  sx={{
                    fontSize: "0.75rem",
                    "& .MuiSelect-select": { py: 0.75, px: 1.5 },
                  }}
                >
                  <MenuItem value={GeminiModel.FLASH}>
                    Gemini 2.5 Flash
                  </MenuItem>
                  <MenuItem value={GeminiModel.PRO}>Gemini 3.0 Pro</MenuItem>
                </Select>
              </FormControl>

              {/* News Mode Toggle */}
              <Tooltip title="Toggle Live Web Search">
                <Chip
                  icon={<SparklesIcon sx={{ fontSize: 16 }} />}
                  label={isMobile ? undefined : "Web Analyst"}
                  onClick={() => setEnableNewsMode(!enableNewsMode)}
                  variant={enableNewsMode ? "filled" : "outlined"}
                  color={enableNewsMode ? "success" : "default"}
                  size="small"
                  sx={{
                    cursor: "pointer",
                    fontWeight: 500,
                    ...(enableNewsMode && {
                      bgcolor: alpha(theme.palette.success.main, 0.15),
                      color: "success.main",
                      borderColor: alpha(theme.palette.success.main, 0.3),
                    }),
                  }}
                />
              </Tooltip>

              {/* Settings Button */}
              <IconButton color="inherit" size="small">
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* Chat Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              px: { xs: 2, md: 4 },
              py: 3,
            }}
          >
            <Box sx={{ maxWidth: 800, mx: "auto" }}>
              {activeSession?.messages.map((msg) => (
                <Fade in key={msg.id} timeout={300}>
                  <div>
                    <ChatMessage message={msg} />
                  </div>
                </Fade>
              ))}
              <div ref={messagesEndRef} />
            </Box>
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Box sx={{ maxWidth: 800, mx: "auto" }}>
              <TextField
                fullWidth
                multiline
                maxRows={6}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a topic (e.g., 'Election results', 'Climate policy')..."
                disabled={isProcessing}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    pr: 1,
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isProcessing}
                        color="primary"
                        sx={{
                          bgcolor:
                            input.trim() && !isProcessing
                              ? "primary.main"
                              : "transparent",
                          color:
                            input.trim() && !isProcessing
                              ? "primary.contrastText"
                              : "text.disabled",
                          "&:hover": {
                            bgcolor:
                              input.trim() && !isProcessing
                                ? "primary.dark"
                                : "transparent",
                          },
                          "&.Mui-disabled": {
                            bgcolor: "transparent",
                          },
                        }}
                      >
                        {isProcessing ? (
                          <StopIcon
                            sx={{
                              animation: "pulse 1.5s infinite",
                              "@keyframes pulse": {
                                "0%, 100%": { opacity: 1 },
                                "50%": { opacity: 0.5 },
                              },
                            }}
                          />
                        ) : (
                          <SendIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "center",
                  mt: 1,
                  color: "text.disabled",
                  fontSize: "0.6rem",
                }}
              >
                Veritas may display inaccurate info, including about people, so
                double-check its responses.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
