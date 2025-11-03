import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCity,
  FaBuilding,
  FaCar,
  FaFileContract,
  FaMoneyBillWave,
  FaCalendar,
  FaPercent,
  FaUserTie,
} from "react-icons/fa";
import { IconType } from "@/typescript/types";

export const UserIcon = (props?: IconType) => (
  <FaUser className={props?.className} style={props?.style} />
);

export const PhoneIcon = (props?: IconType) => (
  <FaPhone className={props?.className} style={props?.style} />
);

export const EmailIcon = (props?: IconType) => (
  <FaEnvelope className={props?.className} style={props?.style} />
);

export const LocationIcon = (props?: IconType) => (
  <FaMapMarkerAlt className={props?.className} style={props?.style} />
);

export const CityIcon = (props?: IconType) => (
  <FaCity className={props?.className} style={props?.style} />
);

export const StateIcon = (props?: IconType) => (
  <FaBuilding className={props?.className} style={props?.style} />
);

export const CarIcon = (props?: IconType) => (
  <FaCar className={props?.className} style={props?.style} />
);

export const PolicyIcon = (props?: IconType) => (
  <FaFileContract className={props?.className} style={props?.style} />
);

export const MoneyIcon = (props?: IconType) => (
  <FaMoneyBillWave className={props?.className} style={props?.style} />
);

export const CalendarIcon = (props?: IconType) => (
  <FaCalendar className={props?.className} style={props?.style} />
);

export const PercentIcon = (props?: IconType) => (
  <FaPercent className={props?.className} style={props?.style} />
);

export const AgentIcon = (props?: IconType) => (
  <FaUserTie className={props?.className} style={props?.style} />
);


