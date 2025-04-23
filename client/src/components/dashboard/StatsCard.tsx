import React from 'react';
import { Card, CardContent, Typography, Box, SvgIconProps, useTheme, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatsCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactElement<SvgIconProps>;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'tertiary' | 'danger';
  isLoading?: boolean;
}

const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<{ bgColor: string }>(({ theme, bgColor }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
  width: 56,
  height: 56,
  backgroundColor: bgColor,
  color: theme.palette.common.white,
  marginRight: theme.spacing(2),
}));

const StyledCard = styled(Card)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  trend,
  trendLabel,
  icon,
  color = 'primary',
  isLoading = false,
}) => {
  const theme = useTheme();

  // Determine icon background color based on props
  const getIconBackgroundColor = () => {
    switch (color) {
      case 'primary':
        return theme.palette.primary.main;
      case 'secondary':
        return theme.palette.secondary.main;
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'tertiary':
        return theme.palette.tertiary.main;
      case 'danger':
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };

  // Get trend color
  const getTrendColor = () => {
    if (!trend) return theme.palette.text.secondary;
    return trend > 0 ? theme.palette.success.main : theme.palette.error.main;
  };

  // Trend icon
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend > 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />;
  };

  const displayPrefix = prefix ? `${prefix} ` : '';
  const displaySuffix = suffix ? ` ${suffix}` : '';

  return (
    <StyledCard>
      <CardContent sx={{ height: '100%', padding: theme.spacing(2) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {isLoading ? (
            <Skeleton variant="rounded" width={56} height={56} sx={{ mr: 2 }} />
          ) : (
            <IconWrapper bgColor={getIconBackgroundColor()}>
              {React.cloneElement(icon, { fontSize: 'medium' })}
            </IconWrapper>
          )}
          
          <Box>
            {isLoading ? (
              <>
                <Skeleton width={100} height={24} />
                <Skeleton width={120} height={36} />
              </>
            ) : (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  {title}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {displayPrefix}{value}{displaySuffix}
                </Typography>
              </>
            )}
          </Box>
        </Box>
        
        {trend !== undefined && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: getTrendColor(),
            }}
          >
            {isLoading ? (
              <Skeleton width={80} height={24} />
            ) : (
              <>
                {getTrendIcon()}
                <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                  {trend > 0 ? '+' : ''}{trend}%
                </Typography>
                {trendLabel && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {trendLabel}
                  </Typography>
                )}
              </>
            )}
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default StatsCard; 