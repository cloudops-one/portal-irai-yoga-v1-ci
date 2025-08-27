import { Box, TextField } from "@mui/material";

// Convert milliseconds to HumanText
export function msToTimeString(ms: number): string {
  if (isNaN(ms) || ms === null) return "0 sec";
  let totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  totalSeconds = totalSeconds % 3600;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;

  const parts: string[] = [];
  if (h > 0) parts.push(`${h} hour${h > 1 ? "s" : ""}`);
  if (m > 0) parts.push(`${m} min`);
  if (s > 0 || parts.length === 0) parts.push(`${s} sec`);
  return parts.join(" ");
}

// Convert hh:mm:ss to milliseconds
export function hmsToMs(hms: string): number {
  if (!hms) return 0;
  const parts = hms.split(":").map(Number);
  let h = 0,
    m = 0,
    s = 0;
  if (parts.length === 3) [h, m, s] = parts;
  else if (parts.length === 2) [m, s] = parts;
  else if (parts.length === 1) [s] = parts;
  return (h * 3600 + m * 60 + s) * 1000;
}

// Convert milliseconds to hh:mm:ss (for input field)
export function msToHms(ms: number = 0): string {
  if (!ms || isNaN(ms)) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

interface DurationPickerProps {
  value: number; // duration in milliseconds
  onChange: (durationMs: number) => void;
  error?: boolean;
}
export const DurationInput: React.FC<DurationPickerProps> = ({
  value,
  onChange,
  error = false,
}) => {
  const totalSeconds = Math.floor(value / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const handleChange = (
    newHours: number,
    newMinutes: number,
    newSeconds: number,
  ) => {
    const newDuration = (newHours * 3600 + newMinutes * 60 + newSeconds) * 1000;
    onChange(newDuration);
  };

  return (
    <Box display="flex" gap={1}>
      <TextField
        label="Minutes"
        type="number"
        size="small"
        value={minutes}
        onChange={(e) => handleChange(hours, Number(e.target.value), seconds)}
        inputProps={{ min: 0, max: 59 }}
      />
      <TextField
        label="Seconds"
        size="small"
        type="number"
        value={seconds}
        error={error}
        onChange={(e) => handleChange(hours, minutes, Number(e.target.value))}
        inputProps={{ min: 0, max: 59 }}
      />
    </Box>
  );
};
