import { FC, ReactNode } from "react";
import { Modal } from "@mui/material";
import { IoMdClose } from "react-icons/io";
import theme from "../common/App.theme"; // Adjust the import path as necessary
interface CustomModalProps {
  open: boolean;
  handleClose: () => void;
  children: ReactNode;
  headingText: string;
  width?: string;
  className?: string;
  "data-testid"?: string;
}

export const CustomModal: FC<CustomModalProps> = ({
  open,
  handleClose,
  children,
  headingText,
  width,
  className = "",
  "data-testid": testId,
}) => {
  return (
    <Modal open={open} className="!flex !items-center !justify-center">
      <div className="overflow-hidden shadow-lg bg-white flex items-end justify-between relative rounded-md">
        <div
          className={`overflow-y-auto shadow-lg font-alegerya ${!width ? "w-[80vw] md:w-[70vw]" : ""} ${className}`}
          style={width ? { width } : undefined}
          data-testid={testId}
        >
          <div className="w-full compact-modal">
            <div
              className="flex flex-row justify-between items-center px-5  text-white h-12 w-full  "
              style={{
                backgroundColor: theme.palette.badge?.activeUserText,
              }}
            >
              {" "}
              <p>{headingText}</p>
              <IoMdClose
                data-testid="close-modal-button"
                onClick={handleClose}
                className="text-2xl cursor-pointer transition-transform duration-200 hover:scale-125"
                color="white"
              />
            </div>
            <div className="p-1">{children}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
