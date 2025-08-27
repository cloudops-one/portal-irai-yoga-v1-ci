import React from "react";
import { Typography } from "@mui/material";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => {
  return (
    <div className="rounded-xl shadow-lg bg-white flex flex-col justify-between p-3">
      <div>
        <Typography variant="h6">{title}</Typography>
      </div>
      <div className="flex flex-row justify-between items-center ">
        <Typography variant="h5">{value}</Typography>
        <Typography className="ml-auto flex flex-row items-center mt-3 gap-2">
          {icon}
        </Typography>
      </div>
    </div>
  );
};

export default StatsCard;
