// /component/CountrySelect.tsx
import React from "react";
import Box from "@mui/material/Box";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Autocomplete, {
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
} from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import {
  useCountryCurrencySettings,
  CountryOption,
  CurrencyOption,
} from "./country.service";

type CountrySelectProps = {
  value: CountryOption | null;
  onChange: (
    event: React.SyntheticEvent<Element, Event>,
    value: CountryOption | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<CountryOption>,
  ) => void;
  textFieldProps?: TextFieldProps;
  disabled?: boolean;
};

type CurrencySelectProps = {
  value: CurrencyOption | null;
  onChange: (
    event: React.SyntheticEvent<Element, Event>,
    value: CurrencyOption | null,
  ) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
};

export default function CountrySelect({
  value,
  onChange,
  textFieldProps,
  disabled,
}: CountrySelectProps) {
  const { countries, loading } = useCountryCurrencySettings();
  if (loading) return <CircularProgress size={24} />;

  return (
    <Autocomplete
      id="country-select"
      options={countries}
      fullWidth
      autoHighlight
      disablePortal
      disabled={disabled}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : (option?.label ?? "")
      }
      value={value}
      onChange={onChange}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <img
            loading="lazy"
            width="20"
            srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
            src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
            alt=""
          />
          {option.label} ({option.code}) {option.phone}
        </Box>
      )}
      slotProps={{
        paper: {
          sx: { maxHeight: 300 },
        },
        ...textFieldProps?.slotProps,
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Country"
          size="small"
          {...textFieldProps}
          slotProps={{
            htmlInput: {
              ...params.inputProps,
              autoComplete: "new-password",
              ...(textFieldProps?.slotProps?.htmlInput || {}),
              "data-testid":
                textFieldProps?.inputProps?.["data-testid"] || "country",
            },
            ...textFieldProps?.slotProps,
          }}
        />
      )}
    />
  );
}

export function CurrencySelect({
  value,
  onChange,
  error,
  helperText,
  disabled,
}: CurrencySelectProps) {
  const { currencies, loading } = useCountryCurrencySettings();

  if (loading) return <CircularProgress size={24} />;

  return (
    <Autocomplete
      options={currencies}
      getOptionLabel={(option) =>
        option ? `${option.code} - ${option.name} (${option.symbol})` : ""
      }
      value={value}
      onChange={onChange}
      isOptionEqualToValue={(option, val) => !!val && option.code === val.code}
      disabled={disabled}
      autoHighlight
      renderInput={(params) => (
        <TextField
          {...params}
          label="Bank Currency"
          size="small"
          error={error}
          helperText={helperText}
          inputProps={{
            ...params.inputProps,
            "data-testid": "bankcurrency",
          }}
        />
      )}
      slotProps={{
        paper: { sx: { maxHeight: 300 } },
      }}
    />
  );
}

export { useCountryCurrencySettings };
