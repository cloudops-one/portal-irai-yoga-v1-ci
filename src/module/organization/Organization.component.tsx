import { useEffect, useState } from "react";
import {
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridSortModel,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import MuiDataGridComponent from "../../component/DataGrid";
import FullHeightDataGridContainer from "../../component/DataGridContainerHeight";
import Loading from "../../component/Loading";
import { CustomModal } from "../../component/Modal";
import {
  Button,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton as MuiIconButton,
  Box,
  Switch,
  MenuItem,
  Select,
  Avatar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { ProfilePictureUpload } from "../../component/ProfilePictureUpload";
import SnackBar from "../../component/SnackBar";
import * as yup from "yup";
import CountrySelect, {
  CurrencySelect,
  useCountryCurrencySettings,
} from "../../component/CountrySelect";
import {
  SNACKBAR_SEVERITY,
  SnackbarSeverity,
  FALLBACK_LOGO,
} from "../../common/App.const";
import {
  organizationSchema,
  organizationFormInitialState,
  status,
} from "./Organization.const";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { OrganizationType, OrganizationFieldPath } from "./Organization.type";
import {
  useAddOrganization,
  useEditOrganization,
  useGetOrganizations,
  useGetOrganizationById,
  useUpdateOrganizationStatus,
} from "./Organization.service";
import { TiptapEditor } from "../../component/TipTapTextEditor";
import {
  UseFormattedDateTime,
  useOrganizationStatus,
} from "../../common/App.hooks";
import { useGetSetting } from "../../common/App.service";
import { SettingItem, CountryOption } from "../../common/App.type";
import theme from "../../common/App.theme";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import styles from "../../module/auth/Auth.module.css";
const OrganizationComponent = () => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: "",
    severity: SNACKBAR_SEVERITY.INFO,
  });

  const { countries } = useCountryCurrencySettings();
  const { currencies } = useCountryCurrencySettings();
  const { getSetting } = useGetSetting();
  const { settings: Orgstatus } = useOrganizationStatus();

  const [urlTypeFetched, setUrlTypeFetched] = useState(false);

  const [urlType, setUrlType] = useState<SettingItem[]>([]);

  // View mode (read-only) for modal
  const [viewMode, setViewMode] = useState(false);

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };
  const showSuccess = (message: string) => {
    showSnackbar(message, SNACKBAR_SEVERITY.SUCCESS);
  };
  const showError = (message: string) =>
    showSnackbar(message, SNACKBAR_SEVERITY.ERROR);

  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>(
    [],
  );
  const [currentItems, setCurrentItems] = useState<OrganizationType[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "createdAt", sort: "asc" },
  ]);
  const [rowCountState, setRowCountState] = useState(0);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<OrganizationType | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<
    Record<string, CountryOption | null>
  >({});
  const [selectedCountryCodes, setSelectedCountryCodes] = useState<
    Record<string, CountryOption | null>
  >({});

  const [searchTerm, setSearchTerm] = useState<string>("");

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<
    Record<string, boolean>
  >({
    createdByName: false,
    createdAt: false,
    updatedAt: false,
    updatedByName: false,
  });
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPaginationModel((prev) => ({
      ...prev,
      page: 0,
    }));
  };
  const { isGetOrganizationsPending, refetch } = useGetOrganizations(
    setCurrentItems,
    paginationModel,
    setPaginationModel,
    setRowCountState,
    searchTerm,
    sortModel,
  );
  const { addOrganization, isAddOrganizationPending } = useAddOrganization();
  const { editOrganization, isEditOrganizationPending } = useEditOrganization();
  const { getOrganizationId, isGetOrganizationByIdPending } =
    useGetOrganizationById();
  const { updateOrganizationStatus, isUpdateOrganizationStatusPending } =
    useUpdateOrganizationStatus();
  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [searchTerm, sortModel]);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<OrganizationType>({
    resolver: yupResolver(
      organizationSchema as yup.ObjectSchema<OrganizationType>,
    ),
    defaultValues: organizationFormInitialState,
    mode: "onBlur",
  });

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Create handleCloseModal function
  const handleCloseModal = () => {
    setOpen(false);
    reset(organizationFormInitialState);
    setEditData(null);
    setSelectedCountries({});
    setSelectedCountryCodes({});
    setViewMode(false);
  };

  // Create handleSafeClose function
  const handleSafeClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      handleCloseModal();
    }
  };

  // View handler - disables fields
  const handleView = (OrganizationData: OrganizationType) => {
    reset(OrganizationData);
    setEditData(OrganizationData);
    setViewMode(true);
    setOpen(true);

    const newSelectedCountries: Record<string, CountryOption | null> = {};
    OrganizationData.addresses.forEach((address, index) => {
      const countryOption = countries.find((c) => c.label === address.country);
      const addressId = `addresses-${index}`;
      const contactId = `contacts-${index}`;
      if (countryOption) {
        newSelectedCountries[addressId] = countryOption;
        setSelectedCountryCodes((prev) => ({
          ...prev,
          [contactId]: countryOption,
        }));
      }
    });
    setSelectedCountries(newSelectedCountries);
  };
  // Edit handler - enables fields
  const handleEdit = (id: string) => {
    getOrganizationId(
      { orgId: id },
      {
        onSuccess: (response) => {
          const OrganizationData = response.data;

          setEditData(OrganizationData);
          reset(OrganizationData);
          setViewMode(false);
          OrganizationData.addresses.forEach((address, index) => {
            const countryOption = countries.find(
              (c) => c.label === address.country,
            );
            if (countryOption) {
              const contactId = `addresses-${index}`;
              setSelectedCountries((prev) => ({
                ...prev,
                [contactId]: countryOption,
              }));
              setValue(`addresses.${index}.country`, countryOption.label);
            }
          });
          OrganizationData.contacts.forEach((contact, index) => {
            setValue(`contacts.${index}.mobile`, contact.mobile);
          });
          setOpen(true);
        },
        onError: (error) => {
          const errorMessage =
            (error.response?.data as { errorMessage?: string })?.errorMessage ||
            error.message ||
            "Failed to get Organization details";
          console.error("Failed to get Organization details:", errorMessage);
          showError(errorMessage);
        },
      },
    );
  };
  const handleAdd = async (data: OrganizationType) => {
    const cleanedData = {
      ...data,
      addresses: data.addresses.map(({ ...rest }) => rest),
      contacts: data.contacts.map(({ ...rest }) => rest),
      urls: data.urls.map(({ ...rest }) => rest),
      orgId: data.orgId,
    };
    try {
      addOrganization(
        { ...cleanedData },
        {
          onSuccess: (response: { message?: string }) => {
            refetch();
            setOpen(false);
            reset(organizationFormInitialState);
            setSelectedCountries({});
            setSelectedCountryCodes({});
            showSuccess(response.message || "Organization added successfully");
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ||
              error.message ||
              "Failed to add Organization";
            console.error("Failed to add Organization:", errorMessage);
            showError(errorMessage);
          },
        },
      );
    } catch (error) {
      console.error("Add Organization error:", error);
    }
  };
  const handleUpdate = async (data: OrganizationType) => {
    if (!editData?.orgId) return;
    const cleanedData = {
      ...data,
      orgId: editData.orgId,
      addresses: data.addresses.map(({ ...rest }) => rest),
      contacts: data.contacts.map(({ ...rest }) => rest),
      urls: data.urls.map(({ ...rest }) => rest),
      orgId_: data.orgId,
    };
    try {
      editOrganization(
        { ...cleanedData },
        {
          onSuccess: (response: { message?: string }) => {
            showSuccess(
              response.message || "Organization updated successfully",
            );
            refetch();
            setOpen(false);
            reset(organizationFormInitialState);
            setEditData(null);
            setSelectedCountries({});
            setSelectedCountryCodes({});
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ||
              error.message ||
              "Failed to update Organization";
            console.error("Failed to update Organization:", errorMessage);
            showError(errorMessage);
          },
        },
      );
    } catch (error) {
      console.error("Update  Organization:", error);
    }
  };
  const onSubmit = (data: OrganizationType) => {
    if (editData) {
      handleUpdate(data);
    } else {
      handleAdd(data);
    }
  };

  type ArrayType<T extends keyof OrganizationType> = T extends "addresses"
    ? OrganizationType["addresses"]
    : T extends "contacts"
      ? OrganizationType["contacts"]
      : T extends "urls"
        ? OrganizationType["urls"]
        : never;

  const humanizeField = (field: string): string => {
    const words = field.match(
      /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
    );
    if (!words) return field;
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };
  const renderFieldArray = (key: "addresses" | "contacts" | "urls") => {
    const array = watch(key);
    const fieldDefinitions = {
      addresses: [
        "addressLine1",
        "addressLine2",
        "city",
        "stateProvince",
        "postalCode",
        "country",
      ] as const,
      contacts: ["name", "mobile", "email"] as const,
      urls: ["url", "type"] as const,
    };
    return (
      <Box sx={{ my: 2 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{key.toUpperCase()}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {array?.map((item, index) => {
              const contactId = `${key}-${index}`;
              return (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  borderBottom="1px solid #ccc"
                  sx={{
                    backgroundColor:
                      "isPrimary" in item && item.isPrimary
                        ? "rgba(25, 118, 210, 0.08)"
                        : "none",
                    borderLeft:
                      "isPrimary" in item && item.isPrimary
                        ? "3px solid #1976d2"
                        : "none",
                    borderRadius: "4px",
                  }}
                >
                  {fieldDefinitions[key].map((field) => {
                    const fieldName =
                      `${key}.${index}.${field}` as OrganizationFieldPath;
                    if (field === "country" && key === "addresses") {
                      return (
                        <Box key={field} sx={{ mt: 2 }}>
                          <Controller
                            name={fieldName}
                            control={control}
                            render={({ field: controllerField }) =>
                              viewMode ? (
                                <TextField
                                  value={
                                    selectedCountries[contactId]?.label || ""
                                  }
                                  label="Country"
                                  fullWidth
                                  size="small"
                                  margin="normal"
                                  slotProps={{
                                    input: {
                                      readOnly: true,
                                      style: { color: "#757575" },
                                    },
                                  }}
                                />
                              ) : (
                                <CountrySelect
                                  value={selectedCountries[contactId] || null}
                                  onChange={(_event, newValue) => {
                                    const newSelectedCountries = {
                                      ...selectedCountries,
                                      [contactId]: newValue,
                                    };
                                    setSelectedCountries(newSelectedCountries);
                                    controllerField.onChange(
                                      newValue?.label || "",
                                    );
                                  }}
                                  // showCurrency={false}
                                  disabled={viewMode}
                                />
                              )
                            }
                          />
                          {errors.addresses?.[index]?.country && (
                            <Typography color="error" variant="body2">
                              {errors.addresses?.[index]?.country?.message}
                            </Typography>
                          )}
                        </Box>
                      );
                    }
                    if (field === "mobile" && key === "contacts") {
                      return (
                        <Box key={field} sx={{ mb: 1, mt: 1 }}>
                          <Controller
                            name={fieldName}
                            control={control}
                            render={({ field: controllerField }) => (
                              <div className={styles["phone-input-wrapper"]}>
                                <PhoneInput
                                  international
                                  defaultCountry="IN"
                                  value={
                                    typeof controllerField.value === "string"
                                      ? controllerField.value
                                      : ""
                                  }
                                  onChange={(value) => {
                                    controllerField.onChange(value || "");
                                  }}
                                  withCountryCallingCode
                                  countryCallingCodeEditable={false}
                                  placeholder="Enter phone number"
                                  className={styles.PhoneInput}
                                  inputClassName={styles.PhoneInputInput}
                                  disabled={viewMode}
                                  style={{
                                    "--PhoneInput-color--focus": "#1976d2",
                                    "--PhoneInputCountryFlag-height": "24px",
                                    "--PhoneInputCountryFlag-width": "24px",
                                    "--PhoneInputCountrySelectArrow-color":
                                      "#555",
                                    "--PhoneInputCountrySelectArrow-opacity":
                                      "1",
                                  }}
                                />
                              </div>
                            )}
                          />
                          {errors.contacts?.[index]?.mobile && (
                            <Typography color="error" variant="body2">
                              {errors.contacts?.[index]?.mobile?.message}
                            </Typography>
                          )}
                        </Box>
                      );
                    }
                    if (field === "type" && key === "urls") {
                      return (
                        <Controller
                          key={field}
                          name={fieldName}
                          control={control}
                          render={({ field: controllerField }) => (
                            <TextField
                              {...controllerField}
                              select
                              label="URL Type"
                              fullWidth
                              size="small"
                              margin="normal"
                              error={
                                Array.isArray(errors[key]) &&
                                !!errors[key]?.[index]?.[field]
                              }
                              helperText={
                                Array.isArray(errors[key])
                                  ? errors[key]?.[index]?.[field]?.message
                                  : undefined
                              }
                              disabled={viewMode}
                            >
                              {urlType.map((option) => (
                                <MenuItem key={option.key} value={option.key}>
                                  {option.value}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />
                      );
                    }
                    return (
                      <Controller
                        key={field}
                        name={fieldName}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            {...controllerField}
                            label={humanizeField(field ?? "")}
                            fullWidth
                            size="small"
                            margin="normal"
                            error={
                              Array.isArray(errors[key]) &&
                              !!errors[key]?.[index]?.[field]
                            }
                            helperText={
                              Array.isArray(errors[key])
                                ? errors[key]?.[index]?.[field]?.message
                                : undefined
                            }
                            disabled={viewMode}
                            inputProps={{
                              "data-testid": `${field}-${contactId}`,
                            }}
                          />
                        )}
                      />
                    );
                  })}
                  {"isPrimary" in item && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Typography variant="body2">Primary</Typography>
                      <Controller
                        name={
                          `${key}.${index}.isPrimary` as OrganizationFieldPath
                        }
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={!!field.value}
                            onChange={() => {
                              if (viewMode) return;
                              const updated = array.map((item, i) => ({
                                ...item,
                                isPrimary: i === index,
                              })) as ArrayType<typeof key>;
                              setValue(key, updated);
                            }}
                            disabled={viewMode}
                          />
                        )}
                      />
                    </Box>
                  )}

                  {!viewMode && (
                    <MuiIconButton
                      onClick={() => {
                        const updated = [...array];
                        updated.splice(index, 1);
                        const newSelectedCountries = { ...selectedCountries };
                        delete newSelectedCountries[contactId];
                        setSelectedCountries(newSelectedCountries);
                        const newSelectedCountryCodes = {
                          ...selectedCountryCodes,
                        };
                        delete newSelectedCountryCodes[contactId];
                        setSelectedCountryCodes(newSelectedCountryCodes);
                        setValue(key, updated as ArrayType<typeof key>);
                      }}
                    >
                      <RemoveCircleIcon color="error" />
                    </MuiIconButton>
                  )}
                </Box>
              );
            })}
            {!viewMode && (
              <Button
                onClick={() => {
                  const empty =
                    key === "addresses"
                      ? {
                          addressLine1: "",
                          addressLine2: "",
                          city: "",
                          stateProvince: "",
                          postalCode: "",
                          country: "",
                          isPrimary: array.length === 0,
                        }
                      : key === "contacts"
                        ? {
                            name: "",
                            mobile: "",
                            email: "",
                            isPrimary: array.length === 0,
                          }
                        : { url: "", type: "" };
                  setValue(key, [...array, empty] as ArrayType<typeof key>);
                }}
                startIcon={<AddCircleIcon />}
              >
                Add {key.slice(0, -1)}
              </Button>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  };
  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <Tooltip title="View">
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                handleView(params.row);
              }}
              color="primary"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit">
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                handleEdit(params.row.orgId);
              }}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
    {
      field: "orgIconStorageUrl",
      headerName: "Logo",
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <Avatar
          src={params.value}
          alt={params.row.categoryName}
          sx={{ marginTop: 1, width: 40, height: 40 }}
        />
      ),
    },
    {
      field: "orgName",
      headerName: "Organization",
      minWidth: 150,
      sortable: true,
    },
    {
      field: "orgRegistrationNumber",
      headerName: "Organization Register Number",
      minWidth: 300,
      sortable: false,
    },
    {
      field: "orgEmail",
      headerName: "Organization E-mail",
      minWidth: 300,
      sortable: false,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      renderCell: (params) => {
        const formatted = UseFormattedDateTime(params.row?.createdAt);
        return formatted;
      },
    },
    {
      field: "createdByName",
      headerName: "Created By",
      width: 180,
      sortable: false,
    },
    {
      field: "updatedByName",
      headerName: "Updated By",
      width: 180,
      sortable: false,
    },
    {
      field: "updatedAt",
      headerName: "Updated On",
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const formatted = UseFormattedDateTime(params.row?.updatedAt);
        return formatted;
      },
    },
    {
      field: "orgStatus",
      headerName: "Status",

      minWidth: 150,
      renderCell: (params: GridRenderCellParams<OrganizationType, string>) => {
        const orgId = params.row.orgId;
        const currentStatus = params.value;
        return (
          <Select
            value={currentStatus}
            onClick={(event) => event.stopPropagation()}
            onChange={(e) => {
              const newStatus = e.target.value;
              updateOrganizationStatus(
                { orgId, status: newStatus },
                {
                  onSuccess: (response: { message?: string }) => {
                    setCurrentItems((prevItems) =>
                      prevItems.map((item) =>
                        item.orgId === orgId
                          ? { ...item, orgStatus: newStatus }
                          : item,
                      ),
                    );
                    showSuccess(
                      response.message || "Status updated successfully",
                    );
                    refetch();
                  },
                  onError: (error) => {
                    const errorMessage =
                      (error.response?.data as { errorMessage?: string })
                        ?.errorMessage ||
                      error.message ||
                      "Failed to update status";
                    console.error("Failed to update status:", errorMessage);
                    showError(errorMessage);
                  },
                },
              );
            }}
            size="small"
            fullWidth
            disabled={isUpdateOrganizationStatusPending}
          >
            {Orgstatus.map((option) => (
              <MenuItem value={option.key} key={option.key}>
                {option.value}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },
  ];

  const isLoading =
    isGetOrganizationsPending ||
    isAddOrganizationPending ||
    isEditOrganizationPending ||
    isGetOrganizationByIdPending;
  const itemsWithId = currentItems?.map((r) => ({ ...r, id: r?.orgId }));

  useEffect(() => {
    if (!open || urlTypeFetched) return;
    getSetting(
      { settingName: "URL_TYPE" },
      {
        onSuccess: (res) => {
          const options = res?.data?.settingValue ?? [];
          setUrlType(options);
          setUrlTypeFetched(true);
        },
        onError: (err) => {
          console.error("Failed to fetch URL_TYPE:", err);
        },
      },
    );
  }, [open, urlTypeFetched]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <FullHeightDataGridContainer>
          <MuiDataGridComponent
            rows={itemsWithId}
            columns={columns}
            selectedRowIds={selectedRowIds}
            getRowId={(row) => row.id}
            setSelectedRowIds={setSelectedRowIds}
            addButtonText="Add Organization"
            onAddClick={() => {
              setOpen(true);
              reset(organizationFormInitialState);
              setEditData(null);
              setSelectedCountries({});
              setSelectedCountryCodes({});
              setViewMode(false);
            }}
            pagination={true}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={rowCountState}
            onSearchChange={handleSearch}
            searchTerm={searchTerm}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            sortingMode="server"
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(model) =>
              setColumnVisibilityModel(model)
            }
          />
        </FullHeightDataGridContainer>
      )}

      {showDiscardConfirm && (
        <CustomModal
          open={showDiscardConfirm}
          handleClose={() => setShowDiscardConfirm(false)}
          headingText="Unsaved Changes"
          width="500px"
        >
          <Box className="p-4">
            <Typography>
              You have unsaved changes. What would you like to do?
            </Typography>
            <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
              <Button
                variant="outlined"
                onClick={() => setShowDiscardConfirm(false)}
              >
                Continue Editing
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleSubmit(onSubmit)();
                  setShowDiscardConfirm(false);
                }}
              >
                Save Changes
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: theme.palette.error.main }}
                onClick={() => {
                  handleCloseModal();
                  setShowDiscardConfirm(false);
                }}
              >
                Discard
              </Button>
            </Box>
          </Box>
        </CustomModal>
      )}

      <CustomModal
        open={open}
        handleClose={handleSafeClose}
        headingText={
          viewMode
            ? "View Organization"
            : editData
              ? "Edit Organization"
              : "Add Organization"
        }
      >
        <Box className="p-4 w-full max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="orgName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Organization Name"
                  size="small"
                  className="mb-4"
                  error={!!errors.orgName}
                  helperText={errors.orgName?.message}
                  disabled={viewMode}
                  inputProps={{ "data-testid": "orgName" }}
                />
              )}
            />
            <Box sx={{ my: 2 }}>
              <Controller
                name="orgRegistrationNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Registration Number"
                    size="small"
                    className="mb-4"
                    error={!!errors.orgRegistrationNumber}
                    helperText={errors.orgRegistrationNumber?.message}
                    disabled={viewMode}
                    inputProps={{
                      "data-testid": "orgRegistrationNumber",
                    }}
                  />
                )}
              />
            </Box>
            <Box sx={{ my: 2 }}>
              <Controller
                name="orgEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    size="small"
                    className="mb-4"
                    error={!!errors.orgEmail}
                    helperText={errors.orgEmail?.message}
                    disabled={viewMode}
                    inputProps={{ "data-testid": "orgEmail" }}
                  />
                )}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Logo
              </Typography>

              {viewMode ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Avatar
                    src={watch("orgIconStorageUrl") || ""}
                    alt="Organization Logo"
                    sx={{
                      width: 100,
                      height: 100,
                      border: "1px solid #eee",
                      mb: 1,
                    }}
                  />
                </Box>
              ) : (
                <Controller
                  name="orgIconStorageId"
                  control={control}
                  render={({ field }) => (
                    <ProfilePictureUpload
                      onUploadSuccess={(fileId) => {
                        field.onChange(fileId);
                      }}
                      moduleType="ORGANIZATION"
                      initialPreviewUrl={watch("orgIconStorageUrl") || ""}
                      fallbackImageUrl={FALLBACK_LOGO}
                      width={150}
                      height={150}
                    />
                  )}
                />
              )}
              {errors.orgIconStorageId && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {errors.orgIconStorageId.message}
                </Typography>
              )}
            </Box>
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Description
              </Typography>
              <Controller
                name="orgDescription"
                control={control}
                render={({ field }) =>
                  viewMode ? (
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #eee",
                        borderRadius: 1,
                        background: "#fafafa",
                        minHeight: 80,
                        color: "#555",
                      }}
                      // dangerouslySetInnerHTML is OK here if orgDescription is trusted HTML
                      dangerouslySetInnerHTML={{
                        __html: field.value || "<i>No description</i>",
                      }}
                    />
                  ) : (
                    <Box sx={{ mb: 3 }}>
                      <TiptapEditor
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                      {errors.orgDescription && (
                        <Typography
                          color="error"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          {errors.orgDescription.message}
                        </Typography>
                      )}
                    </Box>
                  )
                }
              />
            </Box>
            {editData && !viewMode && (
              <Controller
                name="orgStatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Status"
                    fullWidth
                    size="small"
                    margin="normal"
                    error={!!errors.orgStatus}
                    helperText={errors.orgStatus?.message}
                    disabled={viewMode}
                  >
                    {status.map((option) => (
                      <MenuItem key={option.key} value={option.key}>
                        {option.value}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}
            {renderFieldArray("addresses")}
            {renderFieldArray("contacts")}
            {renderFieldArray("urls")}
            <Box sx={{ my: 2 }}>
              <Controller
                name="bankName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Bank Name"
                    size="small"
                    className="mb-4"
                    error={!!errors.bankName}
                    helperText={errors.bankName?.message}
                    disabled={viewMode}
                    inputProps={{ "data-testid": "org-bankName" }}
                  />
                )}
              />
            </Box>
            <Box sx={{ my: 2 }}>
              <Controller
                name="bankAccountNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Bank Account Number"
                    size="small"
                    className="mb-4"
                    error={!!errors.bankAccountNumber}
                    helperText={errors.bankAccountNumber?.message}
                    disabled={viewMode}
                    inputProps={{
                      "data-testid": "org-bankAccountNumber",
                    }}
                  />
                )}
              />
            </Box>
            <Box sx={{ my: 2 }}>
              <Controller
                name="bankAccountType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Bank Account Type"
                    size="small"
                    className="mb-4"
                    error={!!errors.bankAccountType}
                    helperText={errors.bankAccountType?.message}
                    disabled={viewMode}
                    inputProps={{
                      "data-testid": "org-bankAccountType",
                    }}
                  />
                )}
              />
            </Box>
            <Box sx={{ my: 2 }}>
              <Controller
                name="bankIdentifierCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Bank Identifier Code (IFSC/BIC/Other)"
                    size="small"
                    className="mb-4"
                    error={!!errors.bankIdentifierCode}
                    helperText={errors.bankIdentifierCode?.message}
                    disabled={viewMode}
                    inputProps={{
                      "data-testid": "org-bankIdentifierCode",
                    }}
                  />
                )}
              />
            </Box>
            <Box sx={{ my: 2 }}>
              <Controller
                name="bankBranch"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Bank Branch"
                    size="small"
                    className="mb-4"
                    error={!!errors.bankBranch}
                    helperText={errors.bankBranch?.message}
                    disabled={viewMode}
                    inputProps={{ "data-testid": "org-bankBranch" }}
                  />
                )}
              />
            </Box>
            <Box sx={{ my: 2 }}>
              <Controller
                name="bankAddress"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Bank Address"
                    size="small"
                    className="mb-4"
                    error={!!errors.bankAddress}
                    helperText={errors.bankAddress?.message}
                    disabled={viewMode}
                    inputProps={{ "data-testid": "org-bankAddress" }}
                  />
                )}
              />
            </Box>
            <Controller
              name="bankCurrency"
              control={control}
              render={({ field }) =>
                viewMode ? (
                  <TextField
                    value={
                      currencies.find((c) => c.code === field.value)
                        ? `${currencies.find((c) => c.code === field.value)?.code} - ${currencies.find((c) => c.code === field.value)?.name} (${currencies.find((c) => c.code === field.value)?.symbol})`
                        : ""
                    }
                    label="Bank Currency"
                    fullWidth
                    size="small"
                    margin="normal"
                    disabled
                    slotProps={{
                      input: {
                        readOnly: true,
                        style: { color: "#757575" },
                      },
                    }}
                  />
                ) : (
                  <CurrencySelect
                    value={
                      currencies.find((c) => c.code === field.value) || null
                    }
                    onChange={(_e, newValue) =>
                      field.onChange(newValue?.code || "")
                    }
                    error={!!errors.bankCurrency}
                    helperText={errors.bankCurrency?.message}
                    disabled={viewMode}
                  />
                )
              }
            />
            <Box sx={{ my: 2 }}>
              <Controller
                name="taxIdentificationNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Tax Identification Number"
                    size="small"
                    className="mb-4"
                    error={!!errors.taxIdentificationNumber}
                    helperText={errors.taxIdentificationNumber?.message}
                    disabled={viewMode}
                    inputProps={{
                      "data-testid": "org-taxIdentificationNumber",
                    }}
                  />
                )}
              />
            </Box>
            <Box sx={{ my: 2 }}>
              <Controller
                name="permanentAccountNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Permanent Account Number (PAN)"
                    size="small"
                    className="mb-4"
                    error={!!errors.permanentAccountNumber}
                    helperText={errors.permanentAccountNumber?.message}
                    disabled={viewMode}
                    inputProps={{
                      "data-testid": "org-permanentAccountNumber",
                    }}
                  />
                )}
              />
            </Box>
            <Box sx={{ my: 2 }}>
              <Controller
                name="goodsServicesTaxNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Goods and Service Tax (GST)"
                    size="small"
                    className="mb-4"
                    error={!!errors.goodsServicesTaxNumber}
                    helperText={errors.goodsServicesTaxNumber?.message}
                    disabled={viewMode}
                    inputProps={{
                      "data-testid": "org-goodsServicesTaxNumber",
                    }}
                  />
                )}
              />
            </Box>
            {!viewMode && (
              <Box textAlign="center" mt={4}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                >
                  {editData ? "Update" : "Submit"}
                </Button>
              </Box>
            )}
          </form>
        </Box>
      </CustomModal>
      <SnackBar
        openSnackbar={snackbar.open}
        closeSnackbar={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
        duration={3000}
      />
    </>
  );
};

export default OrganizationComponent;
