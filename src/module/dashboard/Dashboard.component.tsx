import StatsCard from "../../component/StatsCard";
import { PiFlowerLotusLight, PiUsersThree } from "react-icons/pi";
import { GrUserSettings } from "react-icons/gr";
import { useGetDashboard } from "./DashBoard.service";
import Loading from "../../component/Loading";
import { IoMdBook } from "react-icons/io";
import { GiBattleGear } from "react-icons/gi";
import { FaFilm } from "react-icons/fa";
import { MdOutlineEventAvailable } from "react-icons/md";
import EventsCard from "../../component/EventsCard";
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import SnackBar from "../../component/SnackBar";
import { SNACKBAR_SEVERITY, SnackbarSeverity } from "../../common/App.const";
import NewsCard from "../../component/NewsCard";
import ScrollContainer from "../../component/ScrollContainer";
const Dashboard = () => {
  const { stats, isLoading, errors } = useGetDashboard();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: "",
    severity: SNACKBAR_SEVERITY.INFO,
  });

  // Show error messages when API errors occur
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors)
        .filter((error) => error?.message)
        .map((error) => error?.message)
        .join(", ");

      if (errorMessages) {
        showSnackbar(
          `Some data failed to load: ${errorMessages}`,
          SNACKBAR_SEVERITY.ERROR,
        );
      }
    }
  }, [errors]);

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const statsArray = [
    {
      text: "Total Organizations",
      count: stats.totalOrganizations,
      icon: <PiFlowerLotusLight size={30} />,
    },
    {
      text: "Total Users",
      count: stats.totalUsers,
      icon: <PiUsersThree size={30} />,
    },
    {
      text: "Active Users",
      count: stats.totalActiveUsers,
      icon: <GrUserSettings size={30} />,
    },
    {
      text: "Mobile Users",
      count: stats.totalMobileUsers,
      icon: <GrUserSettings size={30} />,
    },
    {
      text: "Total Practices",
      count: stats.totalPractices,
      icon: <GiBattleGear size={30} />,
    },
    {
      text: "Total Poems",
      count: stats.totalPoems,
      icon: <IoMdBook size={30} />,
    },
    {
      text: "Total Programs",
      count: stats.totalPrograms,
      icon: <MdOutlineEventAvailable size={30} />,
    },
    {
      text: "Total Shorts",
      count: stats.totalShorts,
      icon: <FaFilm size={30} />,
    },
  ];

  return (
    <>
      <SnackBar
        openSnackbar={snackbar.open}
        closeSnackbar={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
        duration={6000}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <div className="p-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {statsArray.map(({ text, count, icon }) => (
              <StatsCard title={text} value={count} key={text} icon={icon} />
            ))}
          </div>
          <div className="flex flex-col md:flex-row w-full gap-2 mt-5 h-108 ">
            <div className="sm:w-full md:w-2/5  bg-white  flex flex-col  mx-1 rounded-2xl">
              <Typography variant="h6" className="font-bold px-4">
                Upcoming Events
              </Typography>
              <ScrollContainer>
                <EventsCard events={stats.topEvents} />
              </ScrollContainer>
            </div>
            <div className="sm:w-full md:w-3/5 bg-white flex flex-col  mx-1 rounded-2xl">
              <Typography variant="h6" className="font-bold px-4">
                Latest News
              </Typography>
              <ScrollContainer>
                <NewsCard news={stats.topNews} />
              </ScrollContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
