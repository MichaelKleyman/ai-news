import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ChatBubbleOutline as ChatIcon,
  Shield as ShieldIcon,
} from "@mui/icons-material";
import { ChatSession } from "../utils/types";

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  open,
  onClose,
  drawerWidth,
}) => {
  const theme = useTheme();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShieldIcon sx={{ color: "white", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontWeight: 700,
              fontSize: "1.1rem",
              letterSpacing: "-0.02em",
              background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            VERITAS
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
            }}
          >
            TRUTH ENGINE v2.0
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "divider", opacity: 0.5 }} />

      {/* New Chat Button */}
      <Box sx={{ p: 2 }}>
        <Tooltip title="Start a new investigation" placement="right">
          <Box
            onClick={onNewChat}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderColor: theme.palette.primary.main,
                borderStyle: "solid",
              },
            }}
          >
            <AddIcon sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography
              variant="body2"
              sx={{ color: "primary.main", fontWeight: 500 }}
            >
              New Investigation
            </Typography>
          </Box>
        </Tooltip>
      </Box>

      {/* Sessions List */}
      <Box sx={{ flex: 1, overflow: "auto", px: 1 }}>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            display: "block",
            color: "text.disabled",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontSize: "0.65rem",
          }}
        >
          Recent Investigations
        </Typography>
        <List disablePadding>
          {sessions.map((session) => (
            <ListItemButton
              key={session.id}
              selected={session.id === currentSessionId}
              onClick={() => onSelectSession(session.id)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                py: 1,
                px: 1.5,
                "&.Mui-selected": {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: "60%",
                    bgcolor: "primary.main",
                    borderRadius: "0 4px 4px 0",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ChatIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              </ListItemIcon>
              <ListItemText
                primary={session.title}
                secondary={formatDate(session.updatedAt)}
                primaryTypographyProps={{
                  variant: "body2",
                  noWrap: true,
                  sx: {
                    fontWeight: session.id === currentSessionId ? 500 : 400,
                  },
                }}
                secondaryTypographyProps={{
                  variant: "caption",
                  sx: { fontSize: "0.65rem" },
                }}
              />
              <IconButton
                size="small"
                onClick={(e) => onDeleteSession(session.id, e)}
                sx={{
                  opacity: 0,
                  transition: "opacity 0.2s",
                  ".MuiListItemButton-root:hover &": { opacity: 1 },
                  color: "text.secondary",
                  "&:hover": { color: "error.main" },
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Divider sx={{ borderColor: "divider", opacity: 0.5 }} />
      <Box sx={{ p: 2 }}>
        <Typography
          variant="caption"
          sx={{
            color: "text.disabled",
            fontSize: "0.6rem",
            display: "block",
            textAlign: "center",
          }}
        >
          Powered by Gemini AI
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
