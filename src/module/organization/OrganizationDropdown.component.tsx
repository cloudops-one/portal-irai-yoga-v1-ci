import React from "react";
import { useGetOrganizationDropdown } from "./Organization.service";
import { TextField, CircularProgress, Autocomplete } from "@mui/material";

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  disabled?: boolean;
  size?: "small" | "medium";
  error?: boolean;
};

const OrganizationDropdown: React.FC<Props> = ({
  value,
  onChange,
  label = "Select Organization",
  disabled = false,
  size = "medium",
  error = false,
}) => {
  const { organizations, isPending } = useGetOrganizationDropdown();

  return (
    <Autocomplete
      options={organizations}
      getOptionLabel={(option) =>
        `${option.orgName} (${option.orgRegistrationNumber})`
      }
      value={organizations.find((org) => org.orgId === value) ?? null}
      onChange={(_, newValue) => onChange(newValue?.orgId ?? null)}
      loading={isPending}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          size={size}
          fullWidth
          error={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isPending ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default OrganizationDropdown;
