import { useEffect, useState } from "react";
import {
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridSortModel,
} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
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
  FormControlLabel,
  RadioGroup,
  FormLabel,
  Radio,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import {
  useGetEvents,
  useDeleteEvent,
  useAddEvent,
  useEditEvent,
  useGetEventById,
  useUpdateEventStatus,
} from "./Events.service";
import { EventType, EventFieldPath } from "./Events.type";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { eventValidationSchema, formDataInitialState } from "./Events.const";
import { TiptapEditor } from "../../component/TipTapTextEditor";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import * as yup from "yup";
import CountrySelect, {
  useCountryCurrencySettings,
} from "../../component/CountrySelect";
import {
  SNACKBAR_SEVERITY,
  SnackbarSeverity,
  FALLBACK_BANNER,
  FALLBACK_LOGO,
} from "../../common/App.const";
import OrganizationDropdown from "../organization/OrganizationDropdown.component";
import { ProfilePictureUpload } from "../../component/ProfilePictureUpload";
import ConfirmDelete from "../../component/ConfirmDelete.dialog";
import SnackBar from "../../component/SnackBar";
import { EventViewModal } from "./EventViewModal";
import { useEventStatus, UseFormattedDateTime } from "../../common/App.hooks";
import { SettingItem, CountryOption } from "../../common/App.type";
import { useGetSetting } from "../../common/App.service";
import theme from "../../common/App.theme";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import styles from "../../module/auth/Auth.module.css";

interface FormContext {
  bannerInputType: "file" | "url";
  iconInputType: "file" | "url";
}

const EventsComponent = () => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: "",
    severity: SNACKBAR_SEVERITY.INFO,
  });
  const { settings: Eventstatus } = useEventStatus();
  const [urlType, setUrlType] = useState<SettingItem[]>([]);
  const { getSetting } = useGetSetting();
  const { countries } = useCountryCurrencySettings();
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
  const [currentItems, setCurrentItems] = useState<EventType[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "createdAt", sort: "asc" },
  ]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentViewEvent, setCurrentViewEvent] = useState<EventType | null>(
    null,
  );
  const [rowCountState, setRowCountState] = useState(0);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<EventType | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<
    Record<string, CountryOption | null>
  >({});

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    eventId: string | null;
  }>({
    open: false,
    eventId: null,
  });

  const [iconInputType, setIconInputType] = useState<"file" | "url">("file");
  const [bannerInputType, setBannerInputType] = useState<"file" | "url">(
    "file",
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<
    Record<string, boolean>
  >({
    createdByName: false,
    updatedByName: false,
  });

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Create handleCloseModal function
  const handleCloseModal = () => {
    setOpen(false);
    reset(formDataInitialState);
    setEditData(null);
    setSelectedCountries({});
  };

  // Create handleSafeClose function
  const handleSafeClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      handleCloseModal();
    }
  };
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPaginationModel((prev) => ({
      ...prev,
      page: 0, // Reset to first page on new search
    }));
  };
  const { isGetAllEventsPending, refetch } = useGetEvents(
    setCurrentItems,
    paginationModel,
    setPaginationModel,
    setRowCountState,
    searchTerm,
    sortModel,
  );
  const { deleteEvent, isDeleteEventPending } = useDeleteEvent();
  const { addEvent, isAddEventPending } = useAddEvent();
  const { editEvent, isEditEventPending } = useEditEvent();
  const { getEventById, isGetEventByIdPending } = useGetEventById();
  const { updateEventStatus, isUpdateEventStatusPending } =
    useUpdateEventStatus();

  // Debounce search term
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
  } = useForm<EventType>({
    resolver: yupResolver(eventValidationSchema as yup.ObjectSchema<EventType>),
    defaultValues: formDataInitialState,
    mode: "onBlur",
    context: {
      bannerInputType,
      iconInputType,
    } as FormContext,
  });

  const handleView = (eventData: EventType) => {
    setCurrentViewEvent(eventData);
    setViewModalOpen(true);
  };

  const handleRowDelete = (id: string) => {
    // Show the confirmation modal
    setDeleteConfirmation({ open: true, eventId: id });
  };

  const cancelDelete = () => {
    // Close the confirmation modal without deleting
    setDeleteConfirmation({ open: false, eventId: null });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.eventId) {
      deleteEvent(
        { eventId: deleteConfirmation.eventId },
        {
          onSuccess: (response: { message?: string }) => {
            try {
              refetch();
              const successMessage =
                response.message ?? "Event deleted successfully";
              showSuccess(successMessage);
            } catch (refetchError) {
              console.error("Failed to refetch after deletion:", refetchError);
              // Still show success since deletion worked
              showSuccess("Event deleted successfully");
            } finally {
              setDeleteConfirmation({ open: false, eventId: null });
            }
          },

          onError: (error) => {
            // Type-safe error handling
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ??
              error.message ??
              "Failed to get Organization details";
            console.error("Failed to get Organization details:", errorMessage);
            showError(errorMessage);
            setDeleteConfirmation({ open: false, eventId: null });
          },
        },
      );
    }
  };

  // Helper function to set address countries
  const setAddressCountries = (addresses: EventType["addresses"]) => {
    addresses.forEach((address, index) => {
      const countryOption = countries.find(
        (c) => c.code === address.country || c.label === address.country,
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
  };

  const handleEdit = (id: string) => {
    getEventById(
      { eventId: id },
      {
        onSuccess: (response) => {
          const eventData = response.data;
          setEditData(eventData);
          reset(eventData);
          setAddressCountries(eventData.addresses);
          setOpen(true);
          showSnackbar(
            response.message ?? "Event details loaded successfully",
            SNACKBAR_SEVERITY.SUCCESS,
          );
        },
        onError: (error) => {
          const errorMessage =
            (error.response?.data as { errorMessage?: string })?.errorMessage ??
            error.message ??
            "Failed to get event details";
          console.error("Failed to get event details:", errorMessage);
          showError(errorMessage);
        },
      },
    );
  };
  const AddClick = () => {
    setOpen(true);
    reset(formDataInitialState);
    setEditData(null);
    setSelectedCountries({});
  };

  const handleAdd = async (data: EventType) => {
    const cleanedData = {
      ...data,
      addresses: data.addresses.map(({ ...rest }) => rest),
      contacts: data.contacts.map(({ ...rest }) => rest),
      urls: data.urls.map(({ ...rest }) => rest),
      orgId: data.orgId,
      eventBannerStorageId:
        bannerInputType === "file"
          ? (data.eventBannerStorageId ?? undefined)
          : undefined,

      eventBannerExternalUrl:
        bannerInputType === "url"
          ? (data.eventBannerExternalUrl ?? undefined)
          : undefined,

      eventIconStorageId:
        iconInputType === "file"
          ? (data.eventIconStorageId ?? undefined)
          : undefined,

      eventIconExternalUrl:
        iconInputType === "url"
          ? (data.eventIconExternalUrl ?? undefined)
          : undefined,
    };
    try {
      addEvent(
        { ...cleanedData },
        {
          onSuccess: (response: { message?: string }) => {
            refetch();
            setOpen(false);
            reset(formDataInitialState);
            setSelectedCountries({});
            showSuccess(response.message ?? "Event added successfully");
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ??
              error.message ??
              "Failed to add event";
            showSnackbar(errorMessage, SNACKBAR_SEVERITY.ERROR);
          },
        },
      );
    } catch (error) {
      console.error("Add event error:", error);
    }
  };

  const handleUpdate = async (data: EventType) => {
    if (!editData?.eventId) return;

    const cleanedData = {
      ...data,
      eventId: editData.eventId,
      addresses: data.addresses.map(({ ...rest }) => rest),
      contacts: data.contacts.map(({ ...rest }) => rest),
      urls: data.urls.map(({ ...rest }) => rest),
      orgId: data.orgId,
      eventBannerStorageId: data.eventBannerExternalUrl
        ? null
        : data.eventBannerStorageId,
      eventBannerExternalUrl: data.eventBannerStorageId
        ? null
        : data.eventBannerExternalUrl,
      eventBannerStorageUrl: data.eventBannerExternalUrl
        ? null
        : data.eventBannerExternalUrl,
      eventIconStorageId: data.eventIconExternalUrl
        ? null
        : data.eventIconStorageId,
      eventIconExternalUrl: data.eventIconStorageId
        ? null
        : data.eventIconExternalUrl,
      eventIconStorageUrl: data.eventIconExternalUrl
        ? null
        : data.eventIconExternalUrl,
    };

    try {
      editEvent(
        { ...cleanedData },
        {
          onSuccess: (response: { message?: string }) => {
            showSuccess(response.message ?? "Event updated successfully");
            refetch();
            setOpen(false);
            reset(formDataInitialState);
            setEditData(null);
            setSelectedCountries({});
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ??
              error.message ??
              "Failed to update event";
            console.error("Failed to update event:", errorMessage);
            showError(errorMessage);
          },
        },
      );
    } catch (error) {
      console.error("Update event error:", error);
    }
  };

  const onSubmit = (data: EventType) => {
    if (editData) {
      handleUpdate(data);
    } else {
      handleAdd(data);
    }
  };

  type ArrayType<T extends keyof EventType> = T extends "addresses"
    ? EventType["addresses"]
    : T extends "contacts"
      ? EventType["contacts"]
      : T extends "urls"
        ? EventType["urls"]
        : never;

  const humanizeField = (field: string): string => {
    // Insert spaces before capital letters or numbers
    const words = field
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → camel Case
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // acronyms → split APIResponse → API Response
      .replace(/(\d+)/g, " $1") // numbers → split order123 → order 123
      .split(/[\s_]+/); // also split snake_case or kebab-case

    return words
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  const renderFieldArray = (key: "addresses" | "contacts" | "urls") => {
    const array = watch(key);

    // Define the fields for each type
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

    // Filter out any undefined values to prevent index errors
    const fields = fieldDefinitions[key].filter((f) => f !== undefined);

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
                  key={item.id}
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
                  {fields.map((field) => {
                    const fieldName =
                      `${key}.${index}.${field}` as EventFieldPath;
                    if (field === "country" && key === "addresses") {
                      return (
                        <Box key={field} sx={{ mt: 2 }}>
                          <Controller
                            name={fieldName}
                            control={control}
                            render={({ field: controllerField }) => {
                              const currentCountry =
                                selectedCountries[contactId];
                              const handleCountryChange = (
                                _event: unknown,
                                newValue: CountryOption | null,
                              ) => {
                                const newSelectedCountries: Record<
                                  string,
                                  CountryOption | null
                                > = {
                                  ...selectedCountries,
                                  [contactId]: newValue,
                                };
                                setSelectedCountries(newSelectedCountries);
                                controllerField.onChange(newValue?.label ?? "");
                              };

                              return (
                                <CountrySelect
                                  value={currentCountry ?? null}
                                  onChange={handleCountryChange}
                                />
                              );
                            }}
                          />

                          {errors.addresses?.[index]?.country && (
                            <Typography color="error" variant="body2">
                              {errors.addresses?.[index]?.country?.message}
                            </Typography>
                          )}
                        </Box>
                      );
                    }

                    // Render CountrySelect for mobile country code
                    if (field === "mobile" && key === "contacts") {
                      return (
                        <Box key={field} sx={{ mb: 1, mt: 1 }}>
                          <Controller
                            name={fieldName}
                            control={control}
                            render={({ field: controllerField }) => {
                              const value =
                                typeof controllerField.value === "string"
                                  ? controllerField.value
                                  : "";

                              const handlePhoneChange = (
                                newValue: string | undefined,
                              ) => {
                                controllerField.onChange(newValue ?? "");
                              };

                              return (
                                <div className={styles["phone-input-wrapper"]}>
                                  <PhoneInput
                                    international
                                    defaultCountry="IN"
                                    value={value}
                                    onChange={handlePhoneChange}
                                    withCountryCallingCode
                                    countryCallingCodeEditable={false}
                                    placeholder="Enter phone number"
                                    className={styles.PhoneInput}
                                    inputClassName={styles.PhoneInputInput}
                                    dropdownClassName={
                                      styles.PhoneInputCountryDropdown
                                    }
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
                              );
                            }}
                          />

                          {errors.contacts?.[index]?.mobile && (
                            <Typography color="error" variant="body2">
                              {errors.contacts?.[index]?.mobile?.message}
                            </Typography>
                          )}
                        </Box>
                      );
                    }
                    // Render dropdown for URL type
                    if (field === "type" && key === "urls") {
                      return (
                        <Controller
                          key={field}
                          name={fieldName}
                          control={control}
                          render={({ field: controllerField }) => {
                            const fieldErrors = Array.isArray(errors[key])
                              ? errors[key]?.[index]
                              : undefined;
                            const fieldError = fieldErrors?.[field];
                            const isError = !!fieldError;
                            const helperText = fieldError?.message;

                            return (
                              <TextField
                                {...controllerField}
                                select
                                label="URL Type"
                                fullWidth
                                size="small"
                                margin="normal"
                                error={isError}
                                helperText={helperText}
                              >
                                {urlType.map((option) => (
                                  <MenuItem key={option.key} value={option.key}>
                                    {option.value}
                                  </MenuItem>
                                ))}
                              </TextField>
                            );
                          }}
                        />
                      );
                    }
                    return (
                      <Controller
                        key={field}
                        name={fieldName}
                        control={control}
                        render={({ field: controllerField }) => {
                          const fieldErrors = Array.isArray(errors[key])
                            ? errors[key]?.[index]
                            : undefined;
                          const fieldError = fieldErrors?.[field];
                          const isError = !!fieldError;
                          const helperText = fieldError?.message;

                          return (
                            <TextField
                              {...controllerField}
                              label={humanizeField(field ?? "")}
                              fullWidth
                              size="small"
                              margin="normal"
                              error={isError}
                              helperText={helperText}
                            />
                          );
                        }}
                      />
                    );
                  })}

                  {"isPrimary" in item && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Typography variant="body2">Primary</Typography>
                      <Controller
                        name={`${key}.${index}.isPrimary` as EventFieldPath}
                        control={control}
                        render={({ field }) => {
                          return (
                            <Switch
                              checked={!!field.value}
                              onChange={() => {
                                const updated = array.map((item, i) => ({
                                  ...item,
                                  isPrimary: i === index,
                                })) as ArrayType<typeof key>;

                                setValue(key, updated);
                              }}
                            />
                          );
                        }}
                      />
                    </Box>
                  )}

                  <MuiIconButton
                    onClick={() => {
                      const updated = [...array];
                      updated.splice(index, 1);
                      // Clean up country selection state
                      const newSelectedCountries = { ...selectedCountries };
                      delete newSelectedCountries[contactId];
                      setSelectedCountries(newSelectedCountries);
                      setValue(key, updated as ArrayType<typeof key>);
                    }}
                  >
                    <RemoveCircleIcon color="error" />
                  </MuiIconButton>
                </Box>
              );
            })}

            <Button
              onClick={() => {
                let empty;
                if (key === "addresses") {
                  empty = {
                    addressLine1: "",
                    addressLine2: "",
                    city: "",
                    stateProvince: "",
                    postalCode: "",
                    country: "",
                    isPrimary: array.length === 0,
                  };
                } else if (key === "contacts") {
                  empty = {
                    name: "",
                    mobile: "",
                    email: "",
                    country: "",
                    isPrimary: array.length === 0,
                  };
                } else {
                  empty = {
                    url: "",
                    type: "",
                  };
                }

                setValue(key, [...array, empty] as ArrayType<typeof key>);
              }}
              startIcon={<AddCircleIcon />}
            >
              Add {key.slice(0, -2)}
            </Button>
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
                handleEdit(params.row.eventId);
              }}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                handleRowDelete(params.row.eventId);
              }}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
    { field: "orgName", headerName: "Organization", flex: 1, minWidth: 150 },
    { field: "eventName", headerName: "Event Name", flex: 1, minWidth: 150 },
    {
      field: "eventStartDateTime",
      headerName: "Start Date & Time",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const formatted = UseFormattedDateTime(params.row?.eventStartDateTime);
        return formatted;
      },
    },
    {
      field: "eventEndDateTime",
      headerName: "End Date & Time",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const formatted = UseFormattedDateTime(params.row?.eventEndDateTime);
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
      field: "eventStatus",
      headerName: "Status",
      flex: 1,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<EventType, string>) => {
        const eventId = params.row.eventId;
        const currentStatus = params.value;

        const handleStatusChange = (eventId: string, newStatus: string) => {
          updateEventStatus(
            { eventId, status: newStatus },
            {
              onSuccess: (response: { message?: string }) => {
                // Update local state optimistically
                setCurrentItems((prevItems) =>
                  prevItems.map((item) =>
                    item.eventId === eventId
                      ? { ...item, eventStatus: newStatus }
                      : item,
                  ),
                );
                const successMessage =
                  response.message ?? "Status updated successfully";
                showSuccess(successMessage);

                // Refetch to ensure data consistency
                refetch();
              },

              onError: (error) => {
                // Type-safe error handling
                const errorMessage =
                  (error.response?.data as { errorMessage?: string })
                    ?.errorMessage ??
                  error.message ??
                  "Failed to update status";
                console.error("Failed to update status:", errorMessage);
                showError(errorMessage);
              },
            },
          );
        };

        return (
          <Select
            value={currentStatus}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleStatusChange(eventId, e.target.value)}
            size="small"
            fullWidth
            disabled={isUpdateEventStatusPending}
          >
            {Eventstatus.map((option) => (
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
    isGetAllEventsPending ||
    isDeleteEventPending ||
    isAddEventPending ||
    isEditEventPending ||
    isGetEventByIdPending ||
    isUpdateEventStatusPending;

  const itemsWithId = currentItems?.map((r) => ({ ...r, id: r?.eventId }));

  const [urlTypeFetched, setUrlTypeFetched] = useState(false);

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
            addButtonText="Add Event"
            onAddClick={AddClick}
            pagination={true}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={rowCountState}
            loading={isGetAllEventsPending}
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
        headingText={editData ? "Edit Event" : "Add Event"}
      >
        <Box className="p-4 w-full max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="orgId"
              control={control}
              render={({ field }) => (
                <Box sx={{ mb: 3 }}>
                  <OrganizationDropdown
                    size="small"
                    value={field.value ?? null}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                  />
                  {errors.orgId && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                      {errors.orgId.message}
                    </Typography>
                  )}
                </Box>
              )}
            />

            <Controller
              name="eventName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Event Name"
                  size="small"
                  className="mb-4"
                  error={!!errors.eventName}
                  helperText={errors.eventName?.message}
                />
              )}
            />
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Event Description
              </Typography>
              <Controller
                name="eventDescription"
                control={control}
                render={({ field }) => (
                  <Box sx={{ mb: 3 }}>
                    <TiptapEditor
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {errors.eventDescription && (
                      <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        {errors.eventDescription.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Box>
            {/* event banner */}
            <Box mt={2}>
              <FormLabel>Banner</FormLabel>
              <RadioGroup
                row
                value={bannerInputType}
                onChange={(e) => {
                  const value = e.target.value as "file" | "url";
                  setBannerInputType(value);
                  if (value === "url") {
                    setValue("eventBannerExternalUrl", "");
                    setValue("eventBannerStorageId", "");
                  } else {
                    setValue("eventBannerStorageId", "");
                    setValue("eventBannerExternalUrl", "");
                  }
                }}
              >
                <FormControlLabel
                  value="file"
                  control={<Radio />}
                  label="Upload File"
                />
                <FormControlLabel
                  value="url"
                  control={<Radio />}
                  label="Provide URL"
                />
              </RadioGroup>

              {bannerInputType === "file" ? (
                <Controller
                  name="eventBannerStorageId"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <ProfilePictureUpload
                        onUploadSuccess={(fileId) => {
                          field.onChange(fileId);
                        }}
                        moduleType="EVENT"
                        initialPreviewUrl={
                          editData?.eventBannerStorageUrl ??
                          editData?.eventBannerExternalUrl ??
                          ""
                        }
                        existingFileId={editData?.eventBannerStorageId ?? ""}
                        fallbackImageUrl={FALLBACK_BANNER}
                        width={1024}
                        height={500}
                      />
                      {errors.eventBannerStorageId && (
                        <Typography
                          color="error"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          {errors.eventBannerStorageId.message}
                        </Typography>
                      )}
                    </div>
                  )}
                />
              ) : (
                <Controller
                  name="eventBannerExternalUrl"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ""}
                      label="Banner URL"
                      fullWidth
                      margin="normal"
                      error={!!errors.eventBannerExternalUrl}
                      helperText={errors.eventBannerExternalUrl?.message}
                    />
                  )}
                />
              )}
            </Box>
            {/* event */}
            <Box mt={2}>
              <FormLabel>Icon</FormLabel>
              <RadioGroup
                row
                value={iconInputType}
                onChange={(e) => {
                  const value = e.target.value as "file" | "url";
                  setIconInputType(value);
                  if (value === "url") {
                    setValue("eventIconExternalUrl", "");
                    setValue("eventIconStorageId", ""); // Clear URL field
                  } else {
                    setValue("eventIconStorageId", "");
                    setValue("eventIconExternalUrl", ""); // Optionally clear file field
                  }
                }}
              >
                <FormControlLabel
                  value="file"
                  control={<Radio />}
                  label="Upload File"
                />
                <FormControlLabel
                  value="url"
                  control={<Radio />}
                  label="Provide URL"
                />
              </RadioGroup>

              {iconInputType === "file" ? (
                <Controller
                  name="eventIconStorageId"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <ProfilePictureUpload
                        onUploadSuccess={(fileId) => {
                          field.onChange(fileId);
                        }}
                        moduleType="EVENT"
                        initialPreviewUrl={
                          editData?.eventIconStorageUrl ??
                          editData?.eventIconExternalUrl ??
                          ""
                        }
                        existingFileId={editData?.eventIconStorageId ?? ""}
                        fallbackImageUrl={FALLBACK_LOGO}
                        width={150}
                        height={150}
                      />
                      {errors.eventIconStorageId && (
                        <Typography
                          color="error"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          {errors.eventIconStorageId.message}
                        </Typography>
                      )}
                    </div>
                  )}
                />
              ) : (
                <Controller
                  name="eventIconExternalUrl"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ""}
                      label="Icon URL"
                      fullWidth
                      margin="normal"
                      error={!!errors.eventIconExternalUrl}
                      helperText={errors.eventIconExternalUrl?.message}
                    />
                  )}
                />
              )}
            </Box>

            <Box my={3}>
              <Controller
                name="eventStartDateTime"
                control={control}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Event Start Date & Time"
                      disablePast
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(newValue) => {
                        field.onChange(newValue ? newValue.toISOString() : "");
                      }}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          error: !!errors.eventStartDateTime,
                          helperText: errors.eventStartDateTime?.message,
                        },
                      }}
                    />
                  </LocalizationProvider>
                )}
              />
            </Box>
            <Controller
              name="eventEndDateTime"
              control={control}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Event End Date & Time"
                    disablePast
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(newValue) => {
                      field.onChange(newValue ? newValue.toISOString() : "");
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        error: !!errors.eventEndDateTime,
                        helperText: errors.eventEndDateTime?.message,
                      },
                    }}
                  />
                </LocalizationProvider>
              )}
            />

            {renderFieldArray("addresses")}
            {renderFieldArray("contacts")}
            {renderFieldArray("urls")}
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
          </form>
        </Box>
      </CustomModal>

      <ConfirmDelete
        open={deleteConfirmation.open}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
      <SnackBar
        openSnackbar={snackbar.open}
        closeSnackbar={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
        duration={3000}
      />
      {currentViewEvent && (
        <EventViewModal
          event={currentViewEvent}
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
        />
      )}
    </>
  );
};

export default EventsComponent;
