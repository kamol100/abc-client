import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";

export const roles = [
  {
    value: "staff",
    label: "Staff",
  },
  {
    value: "manager",
    label: "Manager",
  },
];

export const status = [
  {
    label: "Active",
    value: "1",
    icon: ArrowUpIcon,
  },
  {
    label: "Inactive",
    value: "0",
    icon: ArrowDownIcon,
  },
];
