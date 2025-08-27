import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  CircularProgress,
  Chip,
  Autocomplete,
  FormControl,
  Divider,
  Collapse,
  IconButton,
} from "@mui/material";
import { Add, ExpandMore, ExpandLess, Edit, Delete } from "@mui/icons-material";
import {
  useAddProgram,
  useAddSection,
  useAddLesson,
  useEditProgram,
  useEditSection,
  useEditLesson,
  useDeleteSection,
  useDeleteLesson,
  useGetLessonsBySectionId,
  useGetSectionById,
  useGetLessonById,
  useGetSectionsByProgramId,
} from "./Program.service";
import {
  ProgramFormData,
  SectionFormData,
  LessonFormData,
  Program,
  Section,
  Lesson,
} from "./Program.type";
import { ProfilePictureUpload } from "../../component/ProfilePictureUpload";
import { TiptapEditor } from "../../component/TipTapTextEditor";
import OrganizationDropdown from "../organization/OrganizationDropdown.component";
import { hmsToMs, msToHms } from "../../component/Duration";
import { CustomModal } from "../../component/Modal";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  programValidationSchema,
  sectionValidationSchema,
  lessonValidationSchema,
  initialLessonFormState,
} from "./Program.const";
import * as yup from "yup";
import ConfirmDelete from "../../component/ConfirmDelete.dialog";
import {
  SNACKBAR_SEVERITY,
  SnackbarSeverity,
  FALLBACK_BANNER,
} from "../../common/App.const";
import SnackBar from "../../component/SnackBar";
import { get } from "lodash";
import { useGetTag } from "../../common/App.service";
interface ProgramModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (program: Program) => void;
  program?: Program;
}

const ProgramModal: React.FC<ProgramModalProps> = ({
  open,
  onClose,
  onSave,
  program,
}) => {
  const [bannerInputType, setBannerInputType] = useState<"file" | "url">(
    "file",
  );
  const [lessonInputType, setLessonInputType] = useState<"file" | "url">(
    "file",
  );
  const [tag, setTag] = useState<string[]>([]);
  const [programId, setProgramId] = useState<string>("");
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isProgramDirty, setIsProgramDirty] = useState(false);
  const [isSectionDirty, setIsSectionDirty] = useState(false);
  const [isLessonDirty, setIsLessonDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: "",
    severity: SNACKBAR_SEVERITY.INFO,
  });

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const showSuccess = (message: string) =>
    showSnackbar(message, SNACKBAR_SEVERITY.SUCCESS);
  const showError = (message: string) =>
    showSnackbar(message, SNACKBAR_SEVERITY.ERROR);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    id: string | null;
    type: "section" | "lesson" | null;
  }>({ open: false, id: null, type: null });

  const handleDeleteSection = (sectionId: string) => {
    setDeleteConfirmation({ open: true, id: sectionId, type: "section" });
  };

  const handleDeleteLesson = (lessonId: string) => {
    setDeleteConfirmation({ open: true, id: lessonId, type: "lesson" });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ open: false, id: null, type: null });
  };

  const { getTags } = useGetTag();

  useEffect(() => {
    getTags(
      { settingName: "PROGRAM_TAGS" },
      {
        onSuccess: (res) => {
          const options = res?.data?.settingValue ?? [];
          setTag(options);
        },
        onError: (err) => {
          console.error("Failed to fetch Program Tags:", err);
        },
      },
    );
  }, []);
  // Program form
  const {
    control: programControl,
    handleSubmit: handleProgramSubmit,
    register: registerProgram,
    formState: { errors: programErrors, isDirty: programIsDirty },
    setValue: setProgramValue,
    reset: resetProgram,
  } = useForm<ProgramFormData>({
    resolver: yupResolver(
      programValidationSchema as yup.ObjectSchema<ProgramFormData>,
    ),
  });

  // Section form
  const {
    control: sectionControl,
    handleSubmit: handleSectionSubmit,
    formState: { errors: sectionErrors, isDirty: sectionIsDirty },
    reset: resetSection,
    setValue: setSectionValue,
  } = useForm<SectionFormData>({
    resolver: yupResolver(
      sectionValidationSchema as yup.ObjectSchema<SectionFormData>,
    ),
  });

  // Lesson form
  const {
    control: lessonControl,
    handleSubmit: handleLessonSubmit,
    formState: { errors: lessonErrors, isDirty: lessonIsDirty },
    reset: resetLesson,
    setValue: setLessonValue,
  } = useForm<LessonFormData>({
    resolver: yupResolver(
      lessonValidationSchema as yup.ObjectSchema<LessonFormData>,
    ),
    defaultValues: initialLessonFormState,
  });

  useEffect(() => {
    setIsProgramDirty(programIsDirty);
  }, [programIsDirty]);

  useEffect(() => {
    setIsSectionDirty(sectionIsDirty);
  }, [sectionIsDirty]);

  useEffect(() => {
    setIsLessonDirty(lessonIsDirty);
  }, [lessonIsDirty]);
  const { addProgram, isAddProgramPending } = useAddProgram();
  const { editProgram, isEditProgramPending } = useEditProgram();
  const { addSection, isAddSectionPending } = useAddSection();
  const { editSection, isEditSectionPending } = useEditSection();
  const { deleteSection } = useDeleteSection();
  const { getLessons } = useGetLessonsBySectionId();
  const { addLesson, isAddLessonPending } = useAddLesson();
  const { editLesson, isEditLessonPending } = useEditLesson();
  const { deleteLesson } = useDeleteLesson();
  const { getSectionById } = useGetSectionById();
  const { getLessonById } = useGetLessonById();
  const { getSections } = useGetSectionsByProgramId();

  useEffect(() => {
    if (program) {
      // Fill program form when editing
      setProgramValue("programName", program.programName ?? "");
      setProgramValue("orgId", program.orgId ?? "");
      setProgramValue("programDescription", program.programDescription ?? "");
      setProgramValue("programAuthor", program.programAuthor ?? "");
      setProgramValue(
        "programBannerStorageId",
        program.programBannerStorageId ?? "",
      );
      setProgramValue(
        "programBannerExternalUrl",
        program.programBannerExternalUrl ?? "",
      );
      setProgramValue("tags", program.tags || []);
      setProgramId(program.programId ?? "");

      // Load sections for the program
      getSections(
        { programId: program.programId },
        {
          onSuccess: (response) => {
            setSections(response.data);
          },
        },
      );
    } else {
      resetProgram();
      setProgramId("");
      setSections([]);
    }
  }, [program]);

  const handleClose = () => {
    if (isProgramDirty || isSectionDirty || isLessonDirty) {
      setShowDiscardConfirm(true);
    } else {
      performClose();
    }
  };

  const performClose = () => {
    resetProgram();
    resetSection();
    resetLesson();
    setProgramId("");
    setShowSectionForm(false);
    setSections([]);
    setSelectedSectionId(null);
    setShowLessonForm(false);
    setLessons([]);
    setExpandedSection(null);
    setEditingSection(null);
    setEditingLesson(null);
    onClose();
    setShowDiscardConfirm(false);
  };

  const onSubmitProgram = async (data: ProgramFormData) => {
    if (program) {
      // Update existing program
      editProgram(
        { ...data, programId: program.programId },
        {
          onSuccess: (response) => {
            const updatedProgram = response.data;
            onSave(updatedProgram);
            showSuccess(response.message || "Program updated successfully");
          },
        },
      );
    } else {
      // Create new program
      addProgram(data as unknown as Record<string, unknown>, {
        onSuccess: (response) => {
          const newProgram = response.data;
          setProgramId(newProgram.programId);
          onSave(newProgram);
          showSuccess(response.message || "Program created successfully");
        },
      });
    }
  };

  const onSubmitSection = async (data: SectionFormData) => {
    if (!programId) return;

    if (editingSection) {
      // Update existing section
      editSection(
        { ...data, sectionId: editingSection.sectionId, programId: programId },
        {
          onSuccess: (response) => {
            getSections(
              { programId },
              {
                onSuccess: (response) => {
                  setSections(response.data);
                },
              },
            );
            resetSection();
            setShowSectionForm(false);
            setEditingSection(null);
            showSuccess(response.message || "Section updated successfully");
          },
        },
      );
    } else {
      // Create new section
      const sectionData = {
        programId,
        sectionName: data.sectionName,
        sectionDescription: data.sectionDescription,
      };

      addSection(sectionData, {
        onSuccess: (response) => {
          getSections(
            { programId },
            {
              onSuccess: (response) => {
                setSections(response.data);
              },
            },
          );
          resetSection();
          setShowSectionForm(false);
          showSuccess(response.message || "Section created successfully");
        },
      });
    }
  };

  const handleAddLesson = async (data: LessonFormData) => {
    if (!selectedSectionId) {
      showError("Please select a section for this lesson");
      return;
    }

    const lessonPayload = {
      sectionId: selectedSectionId,
      lessonName: data.lessonName,
      lessonDescription: data.lessonDescription || "",
      lessonText: data.lessonText || "",
      duration: data.duration || 0,
      ...(data.lessonStorageId
        ? { lessonStorageId: data.lessonStorageId }
        : undefined),
      ...(data.lessonExternalUrl
        ? { lessonExternalUrl: data.lessonExternalUrl }
        : undefined),
    };
    addLesson(lessonPayload, {
      onSuccess: (response) => {
        getLessons(
          { sectionId: selectedSectionId },
          {
            onSuccess: (response) => {
              setLessons(response.data);
            },
            onError: (error) => {
              const errorMessage = get(
                error,
                "response.data.errorMessage",
                "Failed to fetch lessons",
              );
              showError(errorMessage);
            },
          },
        );
        resetLesson(initialLessonFormState);
        setShowLessonForm(false);
        showSuccess(response.message || "Lesson added successfully");
      },
      onError: (error) => {
        const errorMessage = get(
          error,
          "response.data.errorMessage",
          "Failed to add lesson",
        );
        showError(errorMessage);
      },
    });
  };

  const handleEditLessonSubmit = async (data: LessonFormData) => {
    if (!selectedSectionId || !editingLesson) {
      showError("Missing lesson or section info");
      return;
    }
    const lessonPayload = {
      sectionId: selectedSectionId,
      lessonName: data.lessonName,
      lessonDescription: data.lessonDescription || "",
      lessonText: data.lessonText || "",
      duration: data.duration || 0,
      ...(data.lessonStorageId
        ? { lessonStorageId: data.lessonStorageId }
        : undefined),
      ...(data.lessonExternalUrl
        ? { lessonExternalUrl: data.lessonExternalUrl }
        : undefined),
    };

    editLesson(
      {
        lessonId: editingLesson.lessonId,
        ...lessonPayload,
      },
      {
        onSuccess: (response) => {
          getLessons(
            { sectionId: selectedSectionId },
            {
              onSuccess: (response) => {
                setLessons(response.data); // fresh data
              },
              onError: (error) => {
                const errorMessage = get(
                  error,
                  "response.data.errorMessage",
                  "Failed to fetch lessons",
                );
                showError(errorMessage);
              },
            },
          );
          resetLesson();
          setShowLessonForm(false);
          setEditingLesson(null);
          showSuccess(response.message || "Lesson updated successfully");
        },
        onError: (error) => {
          const errorMessage = get(
            error,
            "response.data.errorMessage",
            "Failed to update lesson",
          );
          showError(errorMessage);
        },
      },
    );
  };

  const onSubmitLesson = async (data: LessonFormData) => {
    if (editingLesson) {
      await handleEditLessonSubmit(data);
    } else {
      await handleAddLesson(data);
    }
  };

  const handleEditSection = (sectionId: string) => {
    getSectionById(
      { sectionId },
      {
        onSuccess: (response) => {
          const section = response.data;
          setEditingSection(section);
          setSectionValue("sectionName", section.sectionName);
          setSectionValue("sectionDescription", section.sectionDescription);
          setShowSectionForm(true);
        },
      },
    );
  };

  const handleEditLesson = (lessonId: string) => {
    getLessonById(
      { lessonId },
      {
        onSuccess: (response) => {
          const lesson = response.data;
          setEditingLesson(lesson);
          setLessonValue("lessonName", lesson.lessonName);
          setLessonValue("lessonDescription", lesson.lessonDescription);
          setLessonValue("lessonText", lesson.lessonText);
          setLessonValue(
            "lessonStorageId",
            lesson.lessonStorageId ? lesson.lessonStorageId : "",
          );
          setLessonValue(
            "lessonExternalUrl",
            lesson.lessonExternalUrl ? lesson.lessonExternalUrl : "",
          );
          setLessonValue("duration", lesson.duration || 0);
          setSelectedSectionId(lesson.sectionId);
          setExpandedSection(lesson.sectionId);
          const inputType = lesson.lessonExternalUrl ? "url" : "file";
          setLessonInputType(inputType);

          // Force reset the radio group state
          if (inputType === "url") {
            setLessonValue("lessonStorageId", "");
          } else {
            setLessonValue("lessonExternalUrl", "");
          }

          setShowLessonForm(true);
        },
      },
    );
  };

  const toggleSectionExpand = (sectionId: string) => {
    const isExpanding = expandedSection !== sectionId;
    setExpandedSection(isExpanding ? sectionId : null);
    setSelectedSectionId(sectionId);
    setShowLessonForm(false);
    setEditingLesson(null);
    if (isExpanding) {
      setLessons([]);
      getLessons(
        { sectionId },
        {
          onSuccess: (response) => {
            setLessons(response.data);
          },
          onError: () => {
            // Handle error if needed
            console.error("Failed to fetch lessons for section");
          },
        },
      );
    }
  };

  const confirmDelete = () => {
    if (!deleteConfirmation.id || !deleteConfirmation.type) return;

    if (deleteConfirmation.type === "section") {
      deleteSection(
        { sectionId: deleteConfirmation.id },
        {
          onSuccess: (response: { message?: string }) => {
            showSuccess(response.message || "Section deleted successfully");
            getSections(
              { programId: program?.programId || "" },
              {
                onSuccess: (response) => {
                  setSections(response.data);
                  showSuccess(
                    response.message || "Section deleted successfully",
                  );
                },
                onError: (error) => {
                  const errorMessage =
                    (error.response?.data as { errorMessage?: string })
                      ?.errorMessage ||
                    error.message ||
                    "Failed to get section";
                  showError(errorMessage);
                },
              },
            );

            setDeleteConfirmation({ open: false, id: null, type: null });
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ||
              error.message ||
              "Failed to delete section";
            showError(errorMessage || "Failed to delete section");
            setDeleteConfirmation({ open: false, id: null, type: null });
          },
        },
      );
    } else if (deleteConfirmation.type === "lesson") {
      deleteLesson(
        { lessonId: deleteConfirmation.id },
        {
          onSuccess: () => {
            if (expandedSection) {
              getLessons(
                { sectionId: expandedSection },
                {
                  onSuccess: (response) => {
                    setLessons(response.data);
                    showSuccess("Lesson deleted successfully");
                  },
                  onError: (error) => {
                    const errorMessage =
                      (error.response?.data as { errorMessage?: string })
                        ?.errorMessage ||
                      error.message ||
                      "Failed to get Lessons";
                    showError(errorMessage);
                  },
                },
              );
            }
            setDeleteConfirmation({ open: false, id: null, type: null });
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ||
              error.message ||
              "Failed to delete lesson";
            showError(errorMessage || "Failed to delete lesson");
            setDeleteConfirmation({ open: false, id: null, type: null });
          },
        },
      );
    }
  };

  const renderDiscardConfirm = () => (
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
              performClose();
            }}
            disabled={isAddProgramPending || isEditProgramPending}
          >
            Discard Changes
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
  return (
    <>
      {renderDiscardConfirm()}
      <CustomModal
        open={open}
        handleClose={handleClose}
        headingText={program ? "Edit Program" : "Add New Program"}
      >
        <Box className="p-4 w-full max-h-[80vh] overflow-y-auto">
          <Box component="form" onSubmit={handleProgramSubmit(onSubmitProgram)}>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}
            >
              <TextField
                {...registerProgram("programName")}
                label="Program Name"
                fullWidth
                error={!!programErrors.programName}
                helperText={programErrors.programName?.message}
                size="small"
              />

              <Controller
                name="orgId"
                control={programControl}
                rules={{ required: "Organization is required" }}
                render={({ field, fieldState: { error } }) => (
                  <Box sx={{ mb: 2 }}>
                    <OrganizationDropdown
                      value={field.value ?? null}
                      onChange={(value) => field.onChange(value)}
                      size="small"
                      error={!!error}
                    />
                    {error && (
                      <Typography color="error" variant="caption">
                        {error.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />

              <Controller
                name="programDescription"
                control={programControl}
                rules={{ required: "Program description is required" }}
                render={({ field }) => (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Program Description
                    </Typography>
                    <TiptapEditor
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {programErrors.programDescription && (
                      <Typography color="error" variant="caption">
                        {programErrors.programDescription.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />

              <TextField
                {...registerProgram("programAuthor")}
                label="Author"
                fullWidth
                size="small"
              />

              <Box>
                <Typography variant="subtitle1">Program Banner</Typography>
                <RadioGroup
                  row
                  value={bannerInputType}
                  onChange={(e) => {
                    const value = e.target.value as "file" | "url";
                    setBannerInputType(value);
                    if (value === "url") {
                      setProgramValue("programBannerStorageId", undefined);
                      setProgramValue("programBannerExternalUrl", "");
                    } else {
                      setProgramValue("programBannerExternalUrl", "");
                      setProgramValue("programBannerStorageId", undefined);
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
                    label="External URL"
                  />
                </RadioGroup>

                {bannerInputType === "file" ? (
                  <Box>
                    <Controller
                      name="programBannerStorageId"
                      control={programControl}
                      render={({ field }) => (
                        <ProfilePictureUpload
                          onUploadSuccess={(fileId) =>
                            field.onChange(fileId ?? undefined)
                          }
                          moduleType="PROGRAM"
                          fallbackImageUrl={FALLBACK_BANNER}
                          width={1024}
                          height={500}
                        />
                      )}
                    />
                    {programErrors.programBannerStorageId && (
                      <Typography color="error" variant="caption">
                        {programErrors.programBannerStorageId.message}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <TextField
                    {...registerProgram("programBannerExternalUrl")}
                    label="Banner URL"
                    fullWidth
                    error={!!programErrors.programBannerExternalUrl}
                    helperText={programErrors.programBannerExternalUrl?.message}
                    size="small"
                  />
                )}
              </Box>

              <Controller
                name="tags"
                control={programControl}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={tag}
                      value={field.value || []}
                      onChange={(_, newValue) => field.onChange(newValue)}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option}
                            {...getTagProps({ index })}
                            key={index}
                            color="success"
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tags"
                          placeholder="Add tags"
                          color="success"
                        />
                      )}
                      size="small"
                    />
                  </FormControl>
                )}
              />

              <Box textAlign="right" mt={1}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isAddProgramPending || isEditProgramPending}
                >
                  {isAddProgramPending || isEditProgramPending ? (
                    <CircularProgress size={24} />
                  ) : program ? (
                    "Update Program"
                  ) : (
                    "Save Program"
                  )}{" "}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Sections Section */}
          {programId && (
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Sections</Typography>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<Add />}
                  onClick={() => {
                    setShowSectionForm(!showSectionForm);
                    setEditingSection(null);
                    resetSection();
                  }}
                >
                  Add Section
                </Button>
              </Box>

              {sections.map((section) => (
                <Box key={section.sectionId} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      p: 0.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "background.paper",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleSectionExpand(section.sectionId)}
                  >
                    <Typography>{section.sectionName}</Typography>
                    <Box>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSection(section.sectionId);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section.sectionId);
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      <IconButton>
                        {expandedSection === section.sectionId ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </IconButton>
                    </Box>
                  </Box>

                  <Collapse in={expandedSection === section.sectionId}>
                    <Box sx={{ pl: 2, pt: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle1">Lessons</Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => {
                            setSelectedSectionId(section.sectionId);
                            setShowLessonForm(!showLessonForm);
                            setEditingLesson(null);
                            resetLesson(initialLessonFormState);
                            setLessonInputType("file");
                            setLessonValue("lessonStorageId", "");
                            setLessonValue("lessonExternalUrl", "");
                          }}
                        >
                          Add Lesson
                        </Button>
                      </Box>

                      {lessons
                        .filter(
                          (lesson) => lesson.sectionId === section.sectionId,
                        )
                        .map((lesson) => (
                          <Box
                            key={lesson.lessonId}
                            sx={{
                              p: 0.5,
                              mb: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 1,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography>{lesson.lessonName}</Typography>
                            <Box>
                              <IconButton
                                onClick={() =>
                                  handleEditLesson(lesson.lessonId)
                                }
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                onClick={() =>
                                  handleDeleteLesson(lesson.lessonId)
                                }
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        ))}

                      <Collapse
                        in={
                          showLessonForm &&
                          selectedSectionId === section.sectionId
                        }
                      >
                        <Box
                          component="form"
                          onSubmit={handleLessonSubmit(onSubmitLesson)}
                          sx={{
                            mb: 3,
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        >
                          <Controller
                            name="lessonName"
                            control={lessonControl}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Lesson Name"
                                fullWidth
                                size="small"
                                sx={{ mb: 2 }}
                                error={!!lessonErrors.lessonName}
                                helperText={lessonErrors.lessonName?.message}
                              />
                            )}
                          />

                          <Controller
                            name="lessonDescription"
                            control={lessonControl}
                            render={({ field }) => (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Lesson Description
                                </Typography>
                                <TiptapEditor
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                />
                              </Box>
                            )}
                          />

                          <Controller
                            name="lessonText"
                            control={lessonControl}
                            render={({ field }) => (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Lesson Content
                                </Typography>
                                <TiptapEditor
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                />
                              </Box>
                            )}
                          />

                          <Box>
                            <Typography variant="subtitle1">
                              Lesson Banner
                            </Typography>
                            <RadioGroup
                              row
                              value={lessonInputType}
                              onChange={(e) => {
                                const value = e.target.value as "file" | "url";
                                setLessonInputType(value);
                                if (value === "url") {
                                  setLessonValue("lessonStorageId", "");
                                  setLessonValue("lessonExternalUrl", "");
                                } else {
                                  setLessonValue("lessonExternalUrl", "");
                                  setLessonValue("lessonStorageId", "");
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
                                label="External URL"
                              />
                            </RadioGroup>

                            {lessonInputType === "file" ? (
                              <Controller
                                name="lessonStorageId"
                                control={lessonControl}
                                render={({ field }) => (
                                  <ProfilePictureUpload
                                    onUploadSuccess={(fileId, durationMs) => {
                                      field.onChange(fileId ?? undefined);
                                      if (durationMs) {
                                        setLessonValue("duration", durationMs);
                                      }
                                    }}
                                    moduleType="PROGRAM"
                                  />
                                )}
                              />
                            ) : (
                              <Controller
                                name="lessonExternalUrl"
                                control={lessonControl}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    value={field.value || ""}
                                    label="External URL"
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2 }}
                                    error={!!lessonErrors.lessonExternalUrl}
                                    helperText={
                                      lessonErrors.lessonExternalUrl?.message
                                    }
                                  />
                                )}
                              />
                            )}
                          </Box>

                          <Box>
                            <Typography variant="subtitle1">
                              Duration
                            </Typography>
                            <Controller
                              name="duration"
                              control={lessonControl}
                              defaultValue={0}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="Duration (HH:MM:SS)"
                                  value={msToHms(field.value)}
                                  onChange={(e) => {
                                    const ms = hmsToMs(e.target.value);
                                    field.onChange(ms);
                                  }}
                                  fullWidth
                                  size="small"
                                  margin="normal"
                                  placeholder="HH:MM:SS"
                                  inputProps={{
                                    pattern: "[0-9]{2}:[0-9]{2}:[0-9]{2}",
                                  }}
                                />
                              )}
                            />
                          </Box>

                          <Button
                            type="submit"
                            variant="contained"
                            disabled={isAddLessonPending || isEditLessonPending}
                          >
                            {isAddLessonPending || isEditLessonPending ? (
                              <CircularProgress size={24} />
                            ) : editingLesson ? (
                              "Update Lesson"
                            ) : (
                              "Save Lesson"
                            )}
                          </Button>

                          <Button
                            variant="contained"
                            sx={{
                              bgcolor: "error.main",
                              color: "white",
                              ml: 1,
                              ":hover": { bgcolor: "error.dark" },
                            }}
                            onClick={() => {
                              setShowLessonForm(false);
                              setEditingLesson(null);
                              resetLesson(initialLessonFormState);
                              setLessonInputType("file"); // 🛠 reset input type
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Collapse>
                    </Box>
                  </Collapse>
                </Box>
              ))}

              <Collapse in={showSectionForm}>
                <Box
                  component="form"
                  onSubmit={handleSectionSubmit(onSubmitSection)}
                  sx={{
                    mb: 3,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Controller
                    name="sectionName"
                    control={sectionControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value || ""}
                        label="Section Name"
                        fullWidth
                        sx={{ mb: 2 }}
                        error={!!sectionErrors.sectionName}
                        helperText={sectionErrors.sectionName?.message}
                        InputLabelProps={{
                          shrink: !!field.value, // This makes the label shrink when there's a value
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="sectionDescription"
                    control={sectionControl}
                    render={({ field }) => (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Section Description
                        </Typography>
                        <TiptapEditor
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </Box>
                    )}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isAddSectionPending || isEditSectionPending}
                  >
                    {isAddSectionPending || isEditSectionPending ? (
                      <CircularProgress size={24} />
                    ) : editingSection ? (
                      "Update Section"
                    ) : (
                      "Save Section"
                    )}
                  </Button>

                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "error.main",
                      color: "white",
                      ml: 1,
                      ":hover": { bgcolor: "error.dark" },
                    }}
                    onClick={() => setShowSectionForm(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Collapse>
            </Box>
          )}
        </Box>
        <SnackBar
          openSnackbar={snackbar.open}
          closeSnackbar={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          severity={snackbar.severity}
          duration={3000}
        />

        <ConfirmDelete
          open={deleteConfirmation.open}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      </CustomModal>
    </>
  );
};

export default ProgramModal;
