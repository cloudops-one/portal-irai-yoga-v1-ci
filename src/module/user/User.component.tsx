import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridSortModel,
} from "@mui/x-data-grid";
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
  Tooltip,
  IconButton,
  InputAdornment,
  Checkbox,
  CardContent,
  Card,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import styles from "../../module/auth/Auth.module.css";
import {
  useGetUsers,
  useAddUser,
  useEditUser,
  useDeleteUser,
  useGetUserById,
  useUpdateUserStatus,
  useGetUserAoiById,
} from "./User.service";
import { UserType, formDataInitialState, UserAoiType } from "./User.type";
import {
  bloodGroupOptions,
  genderOptions,
  userValidationSchema,
} from "./User.const";
import MuiDataGridComponent from "../../component/DataGrid";
import FullHeightDataGridContainer from "../../component/DataGridContainerHeight";
import Loading from "../../component/Loading";
import { CustomModal } from "../../component/Modal";
import CountrySelect, {
  useCountryCurrencySettings,
} from "../../component/CountrySelect";
import OrganizationDropdown from "../organization/OrganizationDropdown.component";
import { ProfilePictureUpload } from "../../component/ProfilePictureUpload";
import ConfirmDelete from "../../component/ConfirmDelete.dialog";
import { SNACKBAR_SEVERITY, SnackbarSeverity } from "../../common/App.const";
import SnackBar from "../../component/SnackBar";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import dayjs from "dayjs";
import { UseFormattedDateTime, useUserStatus } from "../../common/App.hooks";
import BallotIcon from "@mui/icons-material/Ballot";
import theme from "../../common/App.theme";
import { FALLBACK_PROFILE } from "../../common/App.const";
export interface CountryOption {
  code: string;
  label: string;
  phone: string;
}

const User = () => {
  const { settings: userStatus } = useUserStatus();

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

  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>(
    [],
  );
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(
    null,
  );

  const [currentItems, setCurrentItems] = useState<UserType[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "createdAt", sort: "asc" },
  ]);

  const [rowCountState, setRowCountState] = useState(0);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<UserType | null>(null);
  const [viewAoiData, setViewAoiData] = useState<UserAoiType[] | null>(null);
  const [viewAoiModalOpen, setViewAoiModalOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<
    Record<string, CountryOption | null>
  >({});
  const [isAoiLoading, setIsAoiLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    userId: string | null;
  }>({ open: false, userId: null });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UserType>({
    resolver: yupResolver(userValidationSchema as Yup.ObjectSchema<UserType>),
    context: { isEdit: !!editData?.userId },
    defaultValues: formDataInitialState,
    mode: "onBlur",
  });
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Create a function to handle modal close safely
  const handleSafeClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    reset(formDataInitialState);
    setEditData(null);
    setSelectedCountries({});
    setViewMode(false);
  };
  const { isGetAllUsersPending, refetch } = useGetUsers(
    setCurrentItems,
    paginationModel,
    setPaginationModel,
    setRowCountState,
    searchTerm,
    sortModel,
  );
  const { addUser, isAddUserPending } = useAddUser();
  const { editUser, isEditUserPending } = useEditUser();
  const { deleteUser, isDeleteUserPending } = useDeleteUser();
  const { getUserById, isGetUserByIdPending } = useGetUserById();
  const { updateUserStatus, isUpdateUserStatusPending } = useUpdateUserStatus();
  const { getUserAoiById, isGetUserByAoiIdPending } = useGetUserAoiById();

  const handleView = (UserData: UserType) => {
    reset(UserData);
    setEditData(UserData);
    setViewMode(true);
    setOpen(true);

    const newSelectedCountries: Record<string, CountryOption | null> = {};
    UserData.addresses.forEach((address, index) => {
      const countryOption = countries.find((c) => c.label === address.country);
      const addressId = `addresses-${index}`;
      if (countryOption) {
        newSelectedCountries[addressId] = countryOption;
      }
    });
    setSelectedCountries(newSelectedCountries);
  };
  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };
  // Handle delete
  const handleRowDelete = (id: string) => {
    setDeleteConfirmation({ open: true, userId: id });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ open: false, userId: null });
  };
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<
    Record<string, boolean>
  >({
    bloodGroup: false,
    gender: false,
    dateOfBirth: false,
    createdAt: false,
    createdByName: false,
    updatedByName: false,
    updatedAt: false,
    lastLoginAt: false,
    mobileVerified: false,
    emailVerified: false,
  });
  const confirmDelete = () => {
    if (deleteConfirmation.userId) {
      deleteUser(
        { userId: deleteConfirmation.userId },
        {
          onSuccess: async () => {
            await refetch();
            showSnackbar(
              "User deleted successfully",
              SNACKBAR_SEVERITY.SUCCESS,
            );
            setDeleteConfirmation({ open: false, userId: null });
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ||
              error.message ||
              "Failed to delete event details";
            showSnackbar(errorMessage, SNACKBAR_SEVERITY.ERROR);
          },
        },
      );
    }
  };

  // Handle edit
  const handleEdit = (id: string) => {
    getUserById(
      { userId: id },
      {
        onSuccess: (response) => {
          const userData = response.data as UserType;
          const processedData = {
            ...userData,
            dateOfBirth: userData.dateOfBirth
              ? new Date(userData.dateOfBirth)
              : null,
          };

          setEditData(processedData);
          reset(processedData);
          // Set country selections for addresses
          const newSelectedCountries: Record<string, CountryOption | null> = {};
          userData.addresses.forEach((address, index) => {
            const countryOption = countries.find(
              (c) => c.label === address.country,
            );
            const addressId = `addresses-${index}`;
            if (countryOption) {
              newSelectedCountries[addressId] = countryOption;
            }
          });
          setSelectedCountries(newSelectedCountries);

          setOpen(true);
        },
        onError: (error) => {
          const errorMessage =
            (error.response?.data as { errorMessage?: string })?.errorMessage ||
            error.message ||
            "Failed to get event details";
          showSnackbar(errorMessage, SNACKBAR_SEVERITY.ERROR);
        },
      },
    );
  };
  const handleViewUserAoi = (id: string) => {
    setIsAoiLoading(true);
    setViewAoiModalOpen(true);

    getUserAoiById(
      { userId: id },
      {
        onSuccess: (response) => {
          setViewAoiData(response.data as UserAoiType[]);
          setIsAoiLoading(false);
        },
        onError: (error) => {
          const errorMessage =
            (error.response?.data as { errorMessage?: string })?.errorMessage ||
            error.message ||
            "Failed to load AOI data";
          showSnackbar(errorMessage, SNACKBAR_SEVERITY.ERROR);
          setIsAoiLoading(false);
          setViewAoiModalOpen(false);
        },
      },
    );
  };
  const handleAddUser = (formattedData: UserType) => {
    addUser(
      { ...formattedData },
      {
        onSuccess: () => {
          showSnackbar("User added successfully", SNACKBAR_SEVERITY.SUCCESS);
          refetch();
          setOpen(false);
          reset(formDataInitialState);
          refetch();
        },
        onError: (error) => {
          const errorMessage =
            (error.response?.data as { errorMessage?: string })?.errorMessage ||
            error.message ||
            "Failed to add user";
          showSnackbar(errorMessage, SNACKBAR_SEVERITY.ERROR);
        },
      },
    );
  };

  const handleUpdateUser = (formattedData: UserType) => {
    editUser(
      { ...formattedData, userId: editData!.userId },
      {
        onSuccess: () => {
          showSnackbar("User updated successfully", SNACKBAR_SEVERITY.SUCCESS);
          refetch();
          setOpen(false);
          reset(formDataInitialState);
          setEditData(null);
        },
        onError: (error) => {
          const errorMessage =
            (error.response?.data as { errorMessage?: string })?.errorMessage ||
            error.message ||
            "Failed to update user";
          showSnackbar(errorMessage, SNACKBAR_SEVERITY.ERROR);
        },
      },
    );
  };

  const onSubmit = (data: UserType) => {
    const isEdit = !!editData;
    const baseData = {
      ...data,
      addresses: data.addresses.map((address) => ({
        ...address,
        isPrimary: address.isPrimary || false,
      })),
      confirmPassword: undefined,
    };

    if (isEdit) {
      const updateData = { ...baseData };
      delete updateData.password;
      handleUpdateUser(updateData);
    } else {
      const addData = {
        ...baseData,
        password: data.password ? btoa(data.password) : btoa("defaultPassword"),
      };
      handleAddUser(addData);
    }
  };
  useEffect(() => {
    if (editData) {
      reset({
        ...editData,
        password: undefined,
        confirmPassword: undefined,
      });
    }
  }, [editData, reset]);

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };
  const renderAddressFields = (viewMode: boolean) => {
    const addresses = watch("addresses") || [];

    return (
      <Box sx={{ my: 2 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>ADDRESSES</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {addresses.map((address, index) => {
              const addressId = `addresses-${index}`;

              return (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  borderBottom="1px solid #ccc"
                  sx={{
                    backgroundColor: address.isPrimary
                      ? "rgba(25, 118, 210, 0.08)"
                      : "none",
                    borderLeft: address.isPrimary
                      ? "3px solid #1976d2"
                      : "none",
                    borderRadius: "4px",
                  }}
                >
                  <Controller
                    name={`addresses.${index}.addressLine1`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Address Line 1"
                        fullWidth
                        size="small"
                        margin="normal"
                        disabled={viewMode}
                        error={!!errors.addresses?.[index]?.addressLine1}
                        helperText={
                          errors.addresses?.[index]?.addressLine1?.message
                        }
                      />
                    )}
                  />

                  <Controller
                    name={`addresses.${index}.addressLine2`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Address Line 2"
                        fullWidth
                        size="small"
                        margin="normal"
                        disabled={viewMode}
                        error={!!errors.addresses?.[index]?.addressLine2}
                        helperText={
                          errors.addresses?.[index]?.addressLine2?.message
                        }
                      />
                    )}
                  />

                  <Controller
                    name={`addresses.${index}.city`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="City"
                        fullWidth
                        size="small"
                        margin="normal"
                        error={!!errors.addresses?.[index]?.city}
                        helperText={errors.addresses?.[index]?.city?.message}
                        disabled={viewMode}
                      />
                    )}
                  />

                  <Controller
                    name={`addresses.${index}.stateProvince`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="State/Province"
                        fullWidth
                        size="small"
                        margin="normal"
                        error={!!errors.addresses?.[index]?.stateProvince}
                        helperText={
                          errors.addresses?.[index]?.stateProvince?.message
                        }
                        disabled={viewMode}
                      />
                    )}
                  />

                  <Controller
                    name={`addresses.${index}.postalCode`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Postal Code"
                        fullWidth
                        size="small"
                        margin="normal"
                        error={!!errors.addresses?.[index]?.postalCode}
                        helperText={
                          errors.addresses?.[index]?.postalCode?.message
                        }
                        disabled={viewMode}
                      />
                    )}
                  />

                  <Box sx={{ mt: 2 }}>
                    <Controller
                      name={`addresses.${index}.country`}
                      control={control}
                      render={({ field }) => (
                        <CountrySelect
                          value={selectedCountries[addressId] || null}
                          onChange={(_, newValue) => {
                            setSelectedCountries((prev) => ({
                              ...prev,
                              [addressId]: newValue,
                            }));
                            field.onChange(newValue?.label || "");
                          }}
                          disabled={viewMode}
                        />
                      )}
                    />
                    {errors.addresses?.[index]?.country && (
                      <Typography color="error" variant="body2">
                        {errors.addresses?.[index]?.country?.message}
                      </Typography>
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Typography variant="body2">Primary</Typography>
                    <Controller
                      name={`addresses.${index}.isPrimary`}
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={!!field.value}
                          onChange={() => {
                            const updated = addresses.map((addr, i) => ({
                              ...addr,
                              isPrimary: i === index,
                            }));
                            setValue("addresses", updated);
                          }}
                          disabled={viewMode}
                        />
                      )}
                    />
                  </Box>

                  <MuiIconButton
                    onClick={() => {
                      if (!viewMode) {
                        const updated = [...addresses];
                        updated.splice(index, 1);
                        setValue("addresses", updated);

                        // Clean up country selection state
                        const newSelectedCountries = { ...selectedCountries };
                        delete newSelectedCountries[addressId];
                        setSelectedCountries(newSelectedCountries);
                      }
                    }}
                    disabled={viewMode}
                  >
                    <RemoveCircleIcon color="error" />
                  </MuiIconButton>
                </Box>
              );
            })}

            <Button
              onClick={() => {
                if (!viewMode) {
                  setValue("addresses", [
                    ...addresses,
                    {
                      isPrimary: false,
                      addressLine1: "",
                      addressLine2: "",
                      city: "",
                      stateProvince: "",
                      postalCode: "",
                      country: "",
                    },
                  ]);
                }
              }}
              startIcon={<AddCircleIcon />}
              disabled={viewMode}
            >
              Add Address
            </Button>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  };

  // Columns definition
  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 200,
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
              onClick={() => handleEdit(params.row.userId)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => handleRowDelete(params.row.userId)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="userAoi">
            <IconButton onClick={() => handleViewUserAoi(params.row.id)}>
              <BallotIcon color="primary" />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
    {
      field: "userFirstName",
      headerName: "Name",
      width: 210,
      renderCell: (params: GridRenderCellParams) => {
        const { userFirstName = "", userLastName = "" } = params.row;
        return <span>{`${userFirstName} ${userLastName}`.trim()}</span>;
      },
    },
    { field: "userEmail", headerName: "Email", width: 213 },
    {
      field: "mobile",
      headerName: "Mobile",
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        return <span>{params.row.userMobile}</span>;
      },
    },
    {
      field: "orgName",
      headerName: "Organization",
      width: 220,
      sortable: false,
    },
    { field: "userType", headerName: "User type", width: 140 },
    { field: "gender", headerName: "Gender", width: 120 },
    { field: "bloodGroup", headerName: "Blood Group", width: 120 },

    {
      field: "dateOfBirth",
      headerName: "DOB",
      width: 150,
      valueFormatter: (params: { value: string }) =>
        dayjs(params.value).format("MMMM D, YYYY"),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const formatted = UseFormattedDateTime(params.row?.createdAt);
        return formatted;
      },
    },
    {
      field: "createdByName",
      headerName: "Created By",
      width: 120,
      sortable: false,
    },
    {
      field: "updatedByName",
      headerName: "Updated By",
      width: 120,
      sortable: false,
    },
    {
      field: "updatedAt",
      headerName: "Updated On",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const formatted = UseFormattedDateTime(params.row?.updatedAt);
        return formatted;
      },
    },
    { field: "lastLoginAt", headerName: "Last Login On", width: 120 },
    { field: "mobileVerified", headerName: "Mobile Verified", width: 120 },
    { field: "emailVerified", headerName: "Email verified", width: 120 },
    {
      field: "userStatus",
      headerName: "Status",
      width: 140,
      renderCell: (params) => (
        <Select
          value={params.value}
          onChange={(e) => {
            const newStatus = e.target.value;
            updateUserStatus(
              { userId: params.row.userId, status: newStatus },
              {
                onSuccess: () => {
                  setCurrentItems((prev) =>
                    prev.map((user) =>
                      user.userId === params.row.userId
                        ? { ...user, userAccountStatus: newStatus }
                        : user,
                    ),
                  );
                  showSnackbar("Status updated", SNACKBAR_SEVERITY.SUCCESS);
                  refetch();
                },
                onError: (error) => {
                  const errorMessage =
                    (error.response?.data as { errorMessage?: string })
                      ?.errorMessage ||
                    error.message ||
                    "Failed to update status";
                  showSnackbar(errorMessage, SNACKBAR_SEVERITY.ERROR);
                },
              },
            );
          }}
          size="small"
          fullWidth
        >
          {userStatus.map((option) => (
            <MenuItem value={option.key} key={option.key}>
              {option.value}
            </MenuItem>
          ))}
        </Select>
      ),
    },
  ];

  const isLoading =
    isGetAllUsersPending ||
    isAddUserPending ||
    isEditUserPending ||
    isDeleteUserPending ||
    isGetUserByIdPending ||
    isUpdateUserStatusPending ||
    isGetUserByAoiIdPending;

  const itemsWithId = currentItems?.map((r) => ({ ...r, id: r.userId }));

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
            setSelectedRowIds={setSelectedRowIds}
            addButtonText="Add User"
            onAddClick={() => {
              setOpen(true);
              reset({
                ...formDataInitialState,
                userId: undefined, // Ensure userId is undefined in add mode
              });
              setEditData(null);
              setSelectedCountries({});
            }}
            pagination={true}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={rowCountState}
            loading={isGetAllUsersPending}
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
      {/* Add/Edit Modal */}

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
          viewMode ? "View User" : editData ? "Edit User" : "Add User"
        }
      >
        <Box className="p-4 w-full max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="orgId"
              control={control}
              render={({ field }) => (
                <Box>
                  <OrganizationDropdown
                    value={field.value ?? null}
                    onChange={field.onChange}
                    size="small"
                    disabled={viewMode}
                  />
                  {errors.orgId && (
                    <Typography color="error" variant="body2">
                      {errors.orgId.message}
                    </Typography>
                  )}
                </Box>
              )}
            />

            <Controller
              name="userFirstName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="First Name"
                  fullWidth
                  size="small"
                  margin="normal"
                  error={!!errors.userFirstName}
                  helperText={errors.userFirstName?.message}
                  disabled={viewMode}
                />
              )}
            />

            <Controller
              name="userLastName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Last Name"
                  fullWidth
                  size="small"
                  margin="normal"
                  error={!!errors.userLastName}
                  helperText={errors.userLastName?.message}
                  disabled={viewMode}
                />
              )}
            />

            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Gender"
                  fullWidth
                  margin="normal"
                  size="small"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.gender}
                  helperText={errors.gender?.message}
                  disabled={viewMode}
                >
                  {genderOptions.map((option) => (
                    <MenuItem value={option.id} key={option.id}>
                      {option.value}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="userEmail"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  fullWidth
                  size="small"
                  margin="normal"
                  error={!!errors.userEmail}
                  helperText={errors.userEmail?.message}
                  disabled={viewMode}
                />
              )}
            />

            {!editData && (
              <>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      fullWidth
                      size="small"
                      margin="normal"
                      type={showPasswords.password ? "text" : "password"}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                togglePasswordVisibility("password")
                              }
                              edge="end"
                            >
                              {showPasswords.password ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Confirm Password"
                      fullWidth
                      size="small"
                      margin="normal"
                      type={showPasswords.confirmPassword ? "text" : "password"}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                togglePasswordVisibility("confirmPassword")
                              }
                              edge="end"
                            >
                              {showPasswords.confirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </>
            )}

            <Box sx={{ mb: 1, mt: 1 }}>
              <Controller
                name="userMobile"
                control={control}
                render={({ field }) => (
                  <div className={styles["phone-input-wrapper"]}>
                    <PhoneInput
                      international
                      defaultCountry="IN"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value || "");
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
                        "--PhoneInputCountrySelectArrow-color": "#555",
                        "--PhoneInputCountrySelectArrow-opacity": "1",
                      }}
                    />
                  </div>
                )}
              />
              {errors.userMobile && (
                <Typography color="error" variant="body2">
                  {errors.userMobile?.message}
                </Typography>
              )}
            </Box>

            <Controller
              name="userIconStorageId"
              control={control}
              render={({ field }) => (
                <div>
                  <ProfilePictureUpload
                    onUploadSuccess={(fileId) => {
                      field.onChange(fileId);
                    }}
                    moduleType="USERS"
                    initialPreviewUrl={watch("userIconStorageUrl") || ""}
                    disabled={viewMode}
                    viewMode={viewMode}
                    fallbackImageUrl={FALLBACK_PROFILE}
                    width={150}
                    height={150}
                  />
                  {errors.userIconStorageId && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                      {errors.userIconStorageId.message}
                    </Typography>
                  )}
                </div>
              )}
            />

            <Controller
              name="bloodGroup"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Blood Group"
                  fullWidth
                  margin="normal"
                  size="small"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.bloodGroup}
                  helperText={errors.bloodGroup?.message}
                  disabled={viewMode}
                >
                  {bloodGroupOptions.map((option) => (
                    <MenuItem value={option.key} key={option.key}>
                      {option.value}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date of Birth"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    disabled={viewMode}
                    maxDate={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: "normal",
                        size: "small",
                        error: !!errors.dateOfBirth,
                        helperText: errors.dateOfBirth?.message,
                      },
                    }}
                  />
                </LocalizationProvider>
              )}
            />

            {renderAddressFields(viewMode)}
            {!viewMode && (
              <Box textAlign="center" mt={4}>
                <Button type="submit" variant="contained" color="primary">
                  {editData ? "Update User" : "Create User"}
                </Button>
              </Box>
            )}
          </form>
        </Box>
      </CustomModal>
      {/* AOI Details Dialog */}

      <CustomModal
        open={viewAoiModalOpen}
        handleClose={() => setViewAoiModalOpen(false)}
        headingText="Area of Interest"
      >
        <Box className="p-4 w-full max-h-[80vh] overflow-y-auto">
          {isAoiLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight={200}
            >
              <Loading />
            </Box>
          ) : viewAoiData ? (
            <Box sx={{ overflow: "auto", marginTop: "10px" }}>
              <Grid container spacing={2}>
                {/* Left column for questions */}
                <Grid item xs={6}>
                  {viewAoiData.map((question, index) => {
                    const questionId = question.questionId || index;
                    const isExpanded = expandedQuestionId === questionId;

                    return (
                      <Box
                        key={questionId}
                        onClick={() =>
                          setExpandedQuestionId(isExpanded ? null : questionId)
                        }
                      >
                        {isExpanded ? (
                          <Box
                            mb={3}
                            p={2}
                            sx={{
                              border: 1,
                              borderRadius: 1,
                              backgroundColor: "#e1e1e1",
                              cursor: "pointer",
                              "&:hover": { backgroundColor: "action.hover" },
                              borderColor: "#d6d6d6",
                            }}
                          >
                            <Typography>{question.questionName}</Typography>
                          </Box>
                        ) : (
                          <Box
                            mb={3}
                            p={2}
                            sx={{
                              border: 1,
                              borderRadius: 1,
                              backgroundColor: "background.paper",
                              cursor: "pointer",
                              "&:hover": { backgroundColor: "action.hover" },
                              borderColor: "#d6d6d6",
                            }}
                          >
                            <Typography>
                              {question.questionName}
                            </Typography>{" "}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Grid>

                {/* Right column for options */}
                <Grid item xs={6}>
                  {expandedQuestionId !== null && (
                    <Box
                      sx={{
                        position: "sticky",
                        top: 0,
                        height: "100%",
                        p: 2,
                        backgroundColor: "background.paper",
                        border: 1,
                        borderRadius: 1,
                        borderColor: "#d6d6d6",
                      }}
                    >
                      {(() => {
                        const question = viewAoiData.find(
                          (q) =>
                            (q.questionId || viewAoiData.indexOf(q)) ===
                            expandedQuestionId,
                        );

                        if (!question) return null;

                        return (
                          <>
                            <Typography variant="h3" sx={{ mb: 2 }}>
                              Answer
                            </Typography>

                            {question.options?.length > 0 ? (
                              <Box component="ul" sx={{ p: 0, m: 0 }}>
                                {question.options.map((option) => (
                                  <Box
                                    component="li"
                                    key={option.id}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      py: 1,
                                    }}
                                  >
                                    <Card
                                      sx={{
                                        width: "100%",
                                        boxShadow: 6,
                                        borderRadius: "6px",
                                        padding: "0px",
                                      }}
                                    >
                                      <CardContent
                                        sx={{
                                          display: "flex",
                                          flex: "row",
                                          alignItems: "center",
                                          padding: "5px !important", // Override default padding
                                          "&:last-child": {
                                            paddingBottom: "5px !important",
                                            // Explicitly remove bottom padding
                                          },
                                        }}
                                      >
                                        <Checkbox
                                          checked={option.selected}
                                          color="success"
                                        />
                                        <p>{option.value}</p>
                                      </CardContent>
                                    </Card>
                                  </Box>
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                No options available for this question
                              </Typography>
                            )}
                          </>
                        );
                      })()}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No areas of interest found
            </Typography>
          )}
        </Box>
      </CustomModal>

      {/* Delete Confirmation */}
      <ConfirmDelete
        open={deleteConfirmation.open}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

      {/* Snackbar */}
      <SnackBar
        openSnackbar={snackbar.open}
        closeSnackbar={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </>
  );
};

export default User;
