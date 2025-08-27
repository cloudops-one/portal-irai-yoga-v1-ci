import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridRowsProp,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarProps,
  useGridApiContext,
  useGridSelector,
  gridPageCountSelector,
  GridSortModel,
} from "@mui/x-data-grid";
import {
  Button,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Box,
} from "@mui/material";
import { FaCirclePlus, FaXmark } from "react-icons/fa6";
import Pagination from "@mui/material/Pagination";
import { FaSearch } from "react-icons/fa";

const CustomPagination = () => {
  const apiRef = useGridApiContext();
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  const paginationState = apiRef.current.state.pagination.paginationModel;
  const pageSize = paginationState.pageSize;
  const page = paginationState.page;
  const rowCount = apiRef.current.state.pagination.rowCount ?? 0;

  const from = page * pageSize + 1;
  const to = Math.min(rowCount, (page + 1) * pageSize);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      px={2}
      py={1}
      flexWrap="wrap"
      gap={2}
    >
      {/* 👈 Left: Page size selector & row count */}
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <label htmlFor="pageSize">Rows per page:</label>
        <select
          id="pageSize"
          data-testid="pageSize"
          value={pageSize}
          onChange={(e) => apiRef.current.setPageSize(Number(e.target.value))}
          style={{
            padding: "4px 8px",
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
        >
          {[5, 10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span data-testid="rowCount">
          Showing {from}-{to} of {rowCount} items
        </span>
      </Stack>

      {/* 👉 Right: Pagination Controls */}
      <Pagination
        data-testid="pagination"
        count={pageCount}
        page={page + 1}
        onChange={(_, value) => apiRef.current.setPage(value - 1)}
        color="primary"
        sx={{
          "& .MuiPagination-ul": {
            flexWrap: "nowrap",
            overflow: "auto",
            ml: "auto",
          },
        }}
      />
    </Stack>
  );
};

interface DataGridComponentProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  selectedRowIds: GridRowSelectionModel;
  setSelectedRowIds: (selection: GridRowSelectionModel) => void;
  checkboxSelection?: boolean;
  disableRowSelectionOnClick?: boolean;
  toolbar?: boolean;
  getRowId?: (row: { id: string }) => string | number;
  addButtonText?: string;
  onAddClick?: () => void;
  pagination?: true;
  paginationMode?: "client" | "server";
  paginationModel?: { page: number; pageSize: number };
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
  rowCount?: number;
  loading?: boolean;
  pageSizeOptions?: number[];
  onSearchChange?: (searchTerm: string) => void;
  searchTerm?: string;
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  sortingMode?: "client" | "server";
  extraToolbarComponents?: React.ReactNode;
  columnVisibilityModel?: Record<string, boolean>;
  onColumnVisibilityModelChange?: (model: Record<string, boolean>) => void;
}

const CustomToolbar: React.FC<
  GridToolbarProps & {
    addButtonText?: string;
    onAddClick?: () => void;
    onSearchChange?: (searchTerm: string) => void;
    initialSearchValue?: string;
    extraComponents?: React.ReactNode;
  }
> = ({
  addButtonText = "Add",
  onAddClick,
  onSearchChange,
  initialSearchValue = "",
  extraComponents,
}) => {
  const [inputValue, setInputValue] = useState(initialSearchValue || "");

  const isSearchDisabled = !inputValue.trim();
  const handleSearch = () => {
    if (!isSearchDisabled) {
      onSearchChange?.(inputValue);
    }
  };

  const handleClear = () => {
    setInputValue("");
    onSearchChange?.(""); // Clear the search term
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    setInputValue(initialSearchValue || "");
  }, [initialSearchValue]);
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      px={1}
      py={1}
      flexWrap="wrap"
      gap={2}
    >
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <GridToolbarColumnsButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
        <TextField
          size="small"
          placeholder="Search..."
          value={inputValue || ""}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ width: 240 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch />
                </InputAdornment>
              ),
              endAdornment: inputValue && (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={handleClear}
                    sx={{ p: 0 }}
                  >
                    <FaXmark />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ height: "40px" }}
          disabled={isSearchDisabled}
        >
          Search
        </Button>
        <Box> {extraComponents} </Box>
      </Stack>
      {addButtonText === "" ? null : (
        <Button
          variant="contained"
          startIcon={<FaCirclePlus />}
          onClick={onAddClick}
        >
          {addButtonText}
        </Button>
      )}
    </Stack>
  );
};

const toolbarWithProps = (
  addButtonText?: string,
  onAddClick?: () => void,
  onSearchChange?: (searchTerm: string) => void,
  initialSearchValue?: string,
  extraComponents?: React.ReactNode,
) => {
  const ToolbarWithPropsComponent: React.FC<GridToolbarProps> = (props) => (
    <CustomToolbar
      {...props}
      addButtonText={addButtonText}
      onAddClick={onAddClick}
      onSearchChange={onSearchChange}
      initialSearchValue={initialSearchValue}
      extraComponents={extraComponents}
    />
  );
  ToolbarWithPropsComponent.displayName = "ToolbarWithPropsComponent";
  return ToolbarWithPropsComponent;
};

const MuiDataGridComponent: React.FC<DataGridComponentProps> = ({
  rows,
  columns,
  selectedRowIds,
  setSelectedRowIds,
  checkboxSelection = true,
  disableRowSelectionOnClick = true,
  toolbar = true,
  getRowId = (row) => row.id,
  addButtonText = "",
  onAddClick,
  pagination,
  paginationMode = "client",
  paginationModel,
  onPaginationModelChange,
  rowCount,
  loading = false,
  pageSizeOptions,
  onSearchChange,
  searchTerm,
  sortModel,
  onSortModelChange,
  sortingMode = "client",
  extraToolbarComponents,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
}) => {
  return (
    <DataGrid
      rows={rows as { id: string }[]}
      columns={columns}
      checkboxSelection={checkboxSelection}
      disableRowSelectionOnClick={disableRowSelectionOnClick}
      rowSelectionModel={selectedRowIds}
      onRowSelectionModelChange={(newSelection) =>
        setSelectedRowIds(newSelection)
      }
      slots={{
        ...(toolbar && {
          toolbar: toolbarWithProps(
            addButtonText,
            onAddClick,
            onSearchChange,
            searchTerm,
            extraToolbarComponents,
          ),
        }),
        ...(pagination && { pagination: CustomPagination }),
      }}
      getRowId={getRowId}
      pagination={pagination}
      paginationMode={paginationMode}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      rowCount={rowCount}
      loading={loading}
      pageSizeOptions={pageSizeOptions}
      sortModel={sortModel}
      columnVisibilityModel={columnVisibilityModel}
      onColumnVisibilityModelChange={onColumnVisibilityModelChange}
      onSortModelChange={onSortModelChange}
      sortingMode={sortingMode}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? "even-row" : "odd-row"
      } // Apply zebra pattern classes
      sx={{
        "& .MuiDataGrid-footerContainer": {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          px: 2,
        },
        "& .even-row": { backgroundColor: "#ffffff" },
        "& .odd-row": { backgroundColor: "#f0f0f0" },
      }}
    />
  );
};

export default MuiDataGridComponent;
