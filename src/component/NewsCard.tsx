import React from "react";
import { Box, Typography } from "@mui/material";
import { News } from "../module/dashboard/Dashboard.type";
import { formatDistanceToNow } from "date-fns";

interface NewsCardProps {
  news: News[];
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  if (!news || news.length === 0) {
    return <Typography>No news available</Typography>;
  }

  return (
    <div>
      {news.map((item) => (
        <div
          key={item.newsId}
          className="rounded-xl mt-1 bg-white shadow-xl flex justify-between items-center p-3 mb-4 w-full"
        >
          <div className="w-1/5">
            <img
              src={item.newsIconStorageUrl ?? ""}
              alt={item.newsName}
              className="object-contain p-2"
            />
          </div>
          <div className="w-4/5 flex flex-col">
            <Box display="flex" flexDirection="row">
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1, textAlign: "right" }}
              >
                Created{" "}
                {formatDistanceToNow(new Date(item?.createdAt), {
                  addSuffix: true,
                })}
              </Typography>
            </Box>
            <Typography variant="subtitle1">{item.newsName}</Typography>
            <Box display="flex" flexDirection="row" alignItems="center">
              <Typography variant="caption">
                {item.likes} likes • {item.views} views
              </Typography>
            </Box>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsCard;
