import React from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Link,
  Collapse,
  IconButton,
  alpha,
  useTheme,
  Skeleton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Psychology as AIIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as AgreeIcon,
  TrendingUp as ConfidenceIcon,
} from "@mui/icons-material";
import {
  Message,
  MessageRole,
  GroundingSource,
  AnalysisMetrics,
} from "../utils/types";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const theme = useTheme();
  const [showSources, setShowSources] = React.useState(false);

  const isUser = message.role === MessageRole.USER;
  const isSystem = message.role === MessageRole.SYSTEM;
  //   const isModel = message.role === MessageRole.MODEL;

  if (isSystem) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          my: 2,
        }}
      >
        <Chip
          icon={<InfoIcon sx={{ fontSize: 14 }} />}
          label={message.content}
          size="small"
          variant="outlined"
          sx={{
            bgcolor: alpha(theme.palette.info.main, 0.08),
            borderColor: alpha(theme.palette.info.main, 0.2),
            color: "text.secondary",
            fontSize: "0.7rem",
          }}
        />
      </Box>
    );
  }

  const renderMetrics = (metrics: AnalysisMetrics) => (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        flexWrap: "wrap",
        mt: 2,
        p: 1.5,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.5),
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {metrics.confidenceScore !== undefined && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ConfidenceIcon sx={{ fontSize: 16, color: "secondary.main" }} />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Confidence:
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color:
                metrics.confidenceScore > 70
                  ? "success.main"
                  : metrics.confidenceScore > 40
                  ? "warning.main"
                  : "error.main",
            }}
          >
            {metrics.confidenceScore}%
          </Typography>
        </Box>
      )}
      {metrics.agreementScore !== undefined && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AgreeIcon sx={{ fontSize: 16, color: "primary.main" }} />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Agreement:
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {metrics.agreementScore}%
          </Typography>
        </Box>
      )}
      {metrics.sourcesAnalyzed !== undefined && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Sources analyzed:
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {metrics.sourcesAnalyzed}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderSources = (sources: GroundingSource[]) => (
    <Box sx={{ mt: 2 }}>
      <Box
        onClick={() => setShowSources(!showSources)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          cursor: "pointer",
          color: "text.secondary",
          "&:hover": { color: "text.primary" },
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 500 }}>
          {sources.length} sources referenced
        </Typography>
        <IconButton size="small" sx={{ p: 0.25 }}>
          {showSources ? (
            <ExpandLessIcon sx={{ fontSize: 16 }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 16 }} />
          )}
        </IconButton>
      </Box>
      <Collapse in={showSources}>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          {sources.map((source, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1.5,
              }}
            >
              <Link
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "primary.light",
                  textDecoration: "none",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {source.title}
                <OpenInNewIcon sx={{ fontSize: 12 }} />
              </Link>
              {source.snippet && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", display: "block", mt: 0.5 }}
                >
                  {source.snippet}
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      </Collapse>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 3,
        flexDirection: isUser ? "row-reverse" : "row",
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 36,
          height: 36,
          bgcolor: isUser
            ? "primary.main"
            : alpha(theme.palette.secondary.main, 0.15),
          color: isUser ? "primary.contrastText" : "secondary.main",
          flexShrink: 0,
        }}
      >
        {isUser ? (
          <PersonIcon sx={{ fontSize: 20 }} />
        ) : (
          <AIIcon sx={{ fontSize: 20 }} />
        )}
      </Avatar>

      {/* Message Content */}
      <Box
        sx={{
          flex: 1,
          maxWidth: "85%",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: isUser
              ? alpha(theme.palette.primary.main, 0.12)
              : alpha(theme.palette.background.paper, 0.6),
            border: `1px solid ${
              isUser
                ? alpha(theme.palette.primary.main, 0.2)
                : theme.palette.divider
            }`,
            borderRadius: 2.5,
            borderTopRightRadius: isUser ? 4 : 20,
            borderTopLeftRadius: isUser ? 20 : 4,
          }}
        >
          {/* Loading State */}
          {message.isLoading && !message.content ? (
            <Box>
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="75%" />
              <Skeleton variant="text" width="60%" />
            </Box>
          ) : (
            <>
              {/* Message Text */}
              <Typography
                variant="body2"
                sx={{
                  color: "text.primary",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  "& strong": { fontWeight: 600 },
                  "& em": { fontStyle: "italic" },
                }}
              >
                {message.content}
              </Typography>

              {/* Streaming indicator */}
              {message.isLoading && message.content && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    sx={{
                      height: 2,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "primary.main",
                      },
                    }}
                  />
                </Box>
              )}

              {/* Metrics */}
              {message.metrics &&
                !message.isLoading &&
                renderMetrics(message.metrics)}

              {/* Sources */}
              {message.groundingSources &&
                message.groundingSources.length > 0 &&
                !message.isLoading &&
                renderSources(message.groundingSources)}
            </>
          )}
        </Paper>

        {/* Timestamp */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            px: 1,
            color: "text.disabled",
            fontSize: "0.65rem",
            textAlign: isUser ? "right" : "left",
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      </Box>
    </Box>
  );
};
