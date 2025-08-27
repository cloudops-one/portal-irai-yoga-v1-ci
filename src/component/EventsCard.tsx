import React from "react";
import { Box, Typography } from "@mui/material";
import { Event } from "../module/dashboard/Dashboard.type";
import { UseFormattedDateTime } from "../common/App.hooks";
import { IoLocationOutline } from "react-icons/io5";
import EventIcon from "@mui/icons-material/Event";

interface EventsCardProps {
  events: Event[];
}

const EventsCard: React.FC<EventsCardProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return <Typography>No events available</Typography>;
  }

  return (
    <div>
      {events.map((event) => (
        <div
          key={event.eventId}
          className="rounded-xl mt-1  bg-white shadow-lg  flex  justify-between items-center p-3 mb-4 w-full"
        >
          <div className="w-1/5">
            <img
              src={event.eventIconStorageUrl ?? ""}
              alt={event.eventName}
              className="object-contain p-2"
            />
          </div>
          <div className="w-4/5 flex flex-col">
            <Box display="flex" flexDirection="row">
              <EventIcon sx={{ mr: 1, fontSize: 15 }} />
              <Typography variant="caption">
                {UseFormattedDateTime(event.eventStartDateTime)}
              </Typography>
            </Box>
            <Typography variant="subtitle1">{event.eventName}</Typography>
            <Box display="flex" flexDirection="row" alignItems="center">
              <IoLocationOutline size={15} className="mr-1" />
              {event.addresses[0] && (
                <Typography variant="caption">
                  {event.addresses[0].addressLine1}, {event.addresses[0].city}
                </Typography>
              )}
            </Box>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsCard;
