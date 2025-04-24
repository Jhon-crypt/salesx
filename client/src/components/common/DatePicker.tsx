import React from 'react';
import { TextField, SxProps, Theme } from '@mui/material';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: SxProps<Theme>;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  sx = {},
  size = 'medium',
  fullWidth = false,
  disabled = false,
  minDate,
  maxDate
}) => {
  return (
    <TextField
      label={label}
      type="date"
      value={value}
      onChange={onChange}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.paper',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        },
        '& input[type="date"]::-webkit-calendar-picker-indicator': {
          cursor: 'pointer',
          padding: '8px',
          filter: 'invert(0.4)',
          opacity: 1,
          '&:hover': {
            opacity: 0.7
          }
        },
        ...sx
      }}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      InputLabelProps={{ shrink: true }}
      inputProps={{
        min: minDate,
        max: maxDate
      }}
    />
  );
};

export default DatePicker; 