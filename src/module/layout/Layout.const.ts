import { MODULES, ROUTE_PATHS } from "../../common/App.const";

import {
  MdOutlineVideoLibrary,
  MdEvent,
  MdEventAvailable,
} from "react-icons/md";
import { GiScrollQuill } from "react-icons/gi";
import { LuLayoutDashboard } from "react-icons/lu";
import { PiFlowerLotusLight, PiUsersThree } from "react-icons/pi";
import { GrYoga } from "react-icons/gr";
import { IoNewspaperOutline, IoSettingsOutline } from "react-icons/io5";
import { BiBookReader } from "react-icons/bi";
import React from "react";
import { TbCategoryPlus } from "react-icons/tb";
import { TiCloudStorageOutline } from "react-icons/ti";

type SubMenuItem = {
  title: string;
  to: string;
  icon?: React.ReactNode;
};

export type MenuItem = {
  title: string;
  icon: React.ReactNode;
  to?: string;
  submenu?: boolean;
  submenuItems?: SubMenuItem[];
};

export const Menus: MenuItem[] = [
  {
    title: MODULES?.DASHBOARD,
    icon: React.createElement(LuLayoutDashboard, { size: 23 }),
    to: ROUTE_PATHS.DASHBOARD,
  },
  {
    title: MODULES?.PRACTICE,
    icon: React.createElement(GrYoga, { size: 23, color: "white" }),
    to: ROUTE_PATHS?.PRACTICE,
  },
  {
    title: MODULES?.WISDOM,
    icon: React.createElement(BiBookReader, { size: 23, color: "white" }),
    submenu: true,
    submenuItems: [
      {
        title: MODULES?.SHORTS,
        to: ROUTE_PATHS?.SHORTS,
        icon: React.createElement(MdOutlineVideoLibrary, { size: 25 }),
      },
      {
        title: MODULES?.PROGRAM,
        to: ROUTE_PATHS?.PROGRAM,
        icon: React.createElement(MdEventAvailable, { size: 25 }),
      },
      {
        title: MODULES?.POEM,
        to: ROUTE_PATHS?.POEM,
        icon: React.createElement(GiScrollQuill, { size: 25 }),
      },
    ],
  },
  {
    title: MODULES?.EVENT,
    icon: React.createElement(MdEvent, { size: 23, color: "white" }),
    to: ROUTE_PATHS?.EVENT,
  },
  {
    title: MODULES?.USER,
    icon: React.createElement(PiUsersThree, { size: 23, color: "white" }),
    to: ROUTE_PATHS?.USER,
  },
  {
    title: MODULES?.ORGANIZATION,
    icon: React.createElement(PiFlowerLotusLight, { size: 23 }),
    to: ROUTE_PATHS?.ORGANIZATION,
  },
  {
    title: MODULES?.SETTING,
    icon: React.createElement(IoSettingsOutline, { size: 23, color: "white" }),
    submenu: true,
    submenuItems: [
      {
        title: MODULES?.PRACTICE_CATEGORY,
        to: ROUTE_PATHS?.PRACTICE_CATEGORY,
        icon: React.createElement(TbCategoryPlus, { size: 25 }),
      },
      {
        title: MODULES?.STORAGE,
        to: ROUTE_PATHS?.STORAGE,
        icon: React.createElement(TiCloudStorageOutline, { size: 25 }),
      },
    ],
  },
  {
    title: MODULES?.NEWS,
    icon: React.createElement(IoNewspaperOutline, { size: 23, color: "white" }),
    to: ROUTE_PATHS?.NEWS,
  },
];
