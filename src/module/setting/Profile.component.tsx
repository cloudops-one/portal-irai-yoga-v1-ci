import { useEffect, useState } from "react";
import {
  ProfileFormElementsArray,
  profileAppButtonsArray,
  profileAppButtonsSecondaryArray,
} from "./Profile.const";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Box,
  Avatar,
  Typography,
  IconButton,
  Button,
  Tooltip,
  MenuItem,
  Switch,
} from "@mui/material";
import ProfileSettingButton from "../../component/ProfileSettingButton";
import { UserType } from "../user/User.type";
import Loading from "../../component/Loading";
import { ResetPasswordDialog } from "../../component/ResetPassword";
import { useGetUserDetails } from "./Profile.service";
import EditSharpIcon from "@mui/icons-material/EditSharp";
import { SNACKBAR_SEVERITY, SnackbarSeverity } from "../../common/App.const";
import SnackBar from "../../component/SnackBar";
import { CustomModal } from "../../component/Modal";
import CountrySelect, {
  useCountryCurrencySettings,
} from "../../component/CountrySelect";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import OrganizationDropdown from "../organization/OrganizationDropdown.component";
import { genderOptions, bloodGroupOptions } from "../user/User.const";
import { useEditUser } from "../user/User.service";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SettingProfilePictureUpload } from "../../component/settingProfilePicture";
export interface CountryOption {
  code: string;
  label: string;
  phone: string;
}

const Profile = () => {
  const [isResetOpen, setResetOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<
    Record<string, CountryOption | null>
  >({});

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: "",
    severity: SNACKBAR_SEVERITY.INFO,
  });

  const { getUserData, isGetUserDetailsPending } = useGetUserDetails();
  const { editUser, isEditUserPending } = useEditUser();
  const { countries } = useCountryCurrencySettings();

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserType>({
    // resolver: yupResolver(profileFormValidationSchema),
    defaultValues: {
      userFirstName: "",
      userLastName: "",
      userId: undefined,
      userEmail: "",
      dateOfBirth: null,
      userMobile: "",
      password: undefined,
      confirmPassword: undefined,
      orgId: "",
      orgName: "",
      addresses: [
        {
          addressLine1: "",
          addressLine2: "",
          city: "",
          stateProvince: "",
          postalCode: "",
          country: "",
          isPrimary: true,
        },
      ],
      userType: "",
      bloodGroup: "",
      gender: "",
      userIconStorageId: null,
      userIconStorageUrl: null,
    },
    mode: "onBlur",
  });

  // Function to map ProfileFormElementsArray field IDs to UserType fields
  const getDisplayValue = (fieldId: string) => {
    switch (fieldId) {
      case "mobile":
        return `${watch("userMobile") || ""}`.trim();
      case "bloodGroup":
        return watch("bloodGroup") || "";
      case "gender":
        return watch("gender") || "";
      case "organizationName":
        return watch("orgName") || "";
      case "city":
        return watch("addresses.0.city") || "";
      case "country":
        return watch("addresses.0.country") || "";
      case "pincode":
        return watch("addresses.0.postalCode") || "";
      case "state":
        return watch("addresses.0.stateProvince") || "";
      case "address":
        return `${watch("addresses.0.addressLine1") || ""} ${watch("addresses.0.addressLine2") || ""}`.trim();
      default:
        return "";
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      getUserData(
        { userId },
        {
          onSuccess: (data: Record<string, unknown>) => {
            const fetchedUserData = data.data as UserType;
            setUserData(fetchedUserData);
            const processedData = {
              ...fetchedUserData,
              dateOfBirth: fetchedUserData.dateOfBirth
                ? new Date(fetchedUserData.dateOfBirth)
                : null,
              addresses: fetchedUserData.addresses.length
                ? fetchedUserData.addresses
                : [
                    {
                      addressLine1: "",
                      addressLine2: "",
                      city: "",
                      stateProvince: "",
                      postalCode: "",
                      country: "",
                      isPrimary: true,
                    },
                  ],
            };
            reset(processedData);
            // Set country selections for addresses
            const newSelectedCountries: Record<string, CountryOption | null> =
              {};
            fetchedUserData.addresses.forEach((address, index) => {
              const countryOption = countries.find(
                (c) => c.label === address.country,
              );
              const addressId = `addresses-${index}`;
              if (countryOption) {
                newSelectedCountries[addressId] = countryOption;
              }
            });
            setSelectedCountries(newSelectedCountries);
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ||
              error.message ||
              "Failed to fetch user data";
            showSnackbar(errorMessage, SNACKBAR_SEVERITY.ERROR);
          },
        },
      );
    }
  }, [getUserData, reset, countries]);

  const handleProfileAppButtonClick = (id: string) => {
    switch (id) {
      case "deleteAccount":
        window.location.href = "/delete-account";
        break;
      case "reset-password":
        setResetOpen(true);
        break;
      default:
        break;
    }
  };

  const handleCloseReset = () => setResetOpen(false);
  const handleEditClick = () => {
    if (userData) {
      const userId = localStorage.getItem("userId");
      if (userId) {
        getUserData(
          { userId },
          {
            onSuccess: (response) => {
              const fetchedUserData = response.data as UserType;
              const processedData = {
                ...fetchedUserData,
                dateOfBirth: fetchedUserData.dateOfBirth
                  ? new Date(fetchedUserData.dateOfBirth)
                  : null,
                addresses: fetchedUserData.addresses.length
                  ? fetchedUserData.addresses
                  : [
                      {
                        addressLine1: "",
                        addressLine2: "",
                        city: "",
                        stateProvince: "",
                        postalCode: "",
                        country: "",
                        isPrimary: true,
                      },
                    ],
              };
              reset(processedData);
              // Set country selections for addresses
              const newSelectedCountries: Record<string, CountryOption | null> =
                {};
              fetchedUserData.addresses.forEach((address, index) => {
                const countryOption = countries.find(
                  (c) => c.label === address.country,
                );
                const addressId = `addresses-${index}`;
                if (countryOption) {
                  newSelectedCountries[addressId] = countryOption;
                }
              });
              setSelectedCountries(newSelectedCountries);
              setIsEditModalOpen(true);
            },
            onError: (error) => {
              const errorMessage =
                (error.response?.data as { errorMessage?: string })
                  ?.errorMessage ||
                error.message ||
                "Failed to fetch user data";
              showSnackbar(errorMessage, SNACKBAR_SEVERITY.ERROR);
            },
          },
        );
      }
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCountries({});
    if (userData) {
      reset({
        ...userData,
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth)
          : null,
        addresses: userData.addresses.length
          ? userData.addresses
          : [
              {
                addressLine1: "",
                addressLine2: "",
                city: "",
                stateProvince: "",
                postalCode: "",
                country: "",
                isPrimary: true,
              },
            ],
      });
    }
  };

  const onSubmit = (data: UserType) => {
    if (!userData?.userId) return;

    const baseData = {
      ...data,
      userId: userData.userId,
      addresses: data.addresses.map((address) => ({
        ...address,
        isPrimary: address.isPrimary || false,
      })),
      confirmPassword: undefined,
      password: undefined,
    };

    editUser(baseData, {
      onSuccess: (response) => {
        const updatedUserData = response.data as UserType; // Assume API returns updated user data
        const processedData = {
          ...updatedUserData,
          dateOfBirth: updatedUserData.dateOfBirth
            ? new Date(updatedUserData.dateOfBirth)
            : null,
          addresses: updatedUserData.addresses.length
            ? updatedUserData.addresses
            : [
                {
                  addressLine1: "",
                  addressLine2: "",
                  city: "",
                  stateProvince: "",
                  postalCode: "",
                  country: "",
                  isPrimary: true,
                },
              ],
        };
        // Update userData state and form values
        setUserData(processedData);
        reset(processedData);
        // Update country selections
        const newSelectedCountries: Record<string, CountryOption | null> = {};
        updatedUserData.addresses.forEach((address, index) => {
          const countryOption = countries.find(
            (c) => c.label === address.country,
          );
          const addressId = `addresses-${index}`;
          if (countryOption) {
            newSelectedCountries[addressId] = countryOption;
          }
        });
        setSelectedCountries(newSelectedCountries);
        showSnackbar("Profile updated successfully", SNACKBAR_SEVERITY.SUCCESS);
        setIsEditModalOpen(false);
      },
      onError: (error) => {
        const errorMessage =
          (error.response?.data as { errorMessage?: string })?.errorMessage ||
          error.message ||
          "Failed to update profile";
        showSnackbar(errorMessage, SNACKBAR_SEVERITY.ERROR);
      },
    });
  };

  const renderAddressFields = () => {
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
                        />
                      )}
                    />
                  </Box>

                  <IconButton
                    onClick={() => {
                      const updated = [...addresses];
                      updated.splice(index, 1);
                      setValue("addresses", updated);
                      const newSelectedCountries = { ...selectedCountries };
                      delete newSelectedCountries[addressId];
                      setSelectedCountries(newSelectedCountries);
                    }}
                  >
                    <RemoveCircleIcon color="error" />
                  </IconButton>
                </Box>
              );
            })}

            <Button
              onClick={() => {
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
              }}
              startIcon={<AddCircleIcon />}
            >
              Add Address
            </Button>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  };

  const loader = isGetUserDetailsPending || isEditUserPending;

  return (
    <>
      {loader ? (
        <Loading />
      ) : (
        <div className="px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
            <div className="flex items-center">
              <Box position="relative">
                <Avatar
                  alt="profile"
                  src={watch("userIconStorageUrl") || ""}
                  sx={{ width: 90, height: 90 }}
                />
              </Box>
              <div className="ml-5">
                <Typography variant="h5" fontWeight={800}>
                  {userData?.userFirstName + " " + userData?.userLastName}
                </Typography>
                <Typography variant="subtitle1">
                  {userData?.userEmail}
                </Typography>
              </div>
            </div>
            <div></div>
          </div>
          <div className=" grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 pb-6 w-full">
            <div>
              <Typography variant="h6" className=" !mb-5">
                Personal
                <Tooltip title="Edit Profile">
                  <IconButton
                    onClick={handleEditClick}
                    data-testid="edit-profile-button"
                  >
                    <EditSharpIcon
                      sx={{
                        color: "black",
                        // backgroundColor: "white",
                        size: "medium",
                        borderRadius: "6px",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {ProfileFormElementsArray.map((field) => (
                  <TextField
                    key={field.id}
                    label={field.label}
                    value={getDisplayValue(field.id)}
                    fullWidth
                    disabled
                  />
                ))}
              </Box>
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <Typography variant="h6" className="!mt-5 !mb-5">
                  App
                </Typography>
                <Box display="flex" flexDirection="column">
                  {profileAppButtonsArray.map((button) => (
                    <ProfileSettingButton
                      id={button?.id}
                      label={button?.label}
                      key={button?.id}
                      onClick={() => handleProfileAppButtonClick(button?.id)}
                    />
                  ))}
                </Box>
              </div>
              <div>
                <Box display="flex" flexDirection="column" className="">
                  {profileAppButtonsSecondaryArray.map((button) => (
                    <ProfileSettingButton
                      id={button?.id}
                      label={button?.label}
                      key={button?.id}
                      onClick={() => handleProfileAppButtonClick(button?.id)}
                    />
                  ))}
                </Box>
                <div>
                  <ResetPasswordDialog
                    open={isResetOpen}
                    onClose={handleCloseReset}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <CustomModal
        open={isEditModalOpen}
        handleClose={handleCloseEditModal}
        headingText="Edit Profile"
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
                    disabled={true}
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
                  disabled={false}
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
                  disabled={false}
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
                  disabled={false}
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
                  disabled={true}
                />
              )}
            />

            <Controller
              name="userMobile"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Mobile"
                  fullWidth
                  size="small"
                  margin="normal"
                  error={!!errors.userMobile}
                  helperText={errors.userMobile?.message}
                  disabled={true}
                />
              )}
            />

            <Controller
              name="userIconStorageId"
              control={control}
              render={({ field }) => (
                <SettingProfilePictureUpload
                  onUploadSuccess={(fileId) => {
                    field.onChange(fileId);
                  }}
                  moduleType="USERS"
                  initialPreviewUrl={watch("userIconStorageUrl") || ""}
                  disabled={false}
                  viewMode={false}
                />
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
                  disabled={false}
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
                    disabled={false}
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

            {renderAddressFields()}

            <Box textAlign="center" mt={4}>
              <Button type="submit" variant="contained" color="primary">
                Update
              </Button>
            </Box>
          </form>
        </Box>
      </CustomModal>

      <SnackBar
        openSnackbar={snackbar.open}
        closeSnackbar={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </>
  );
};

export default Profile;
